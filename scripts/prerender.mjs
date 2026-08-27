/**
 * Static prerendering.
 *
 * Renders every public route to real HTML at build time and writes it into
 * dist/, so a crawler that does not execute JavaScript still sees the question
 * text, the headings, and the JSON-LD.
 *
 * Without this, every route served the same empty index.html shell and the
 * entire SEO surface was invisible to anything but a JS-executing crawler.
 *
 * Runs AFTER `vite build`, against the built dist/index.html as its template.
 * Data comes from server/data (questions) and MongoDB (cached answers, if
 * MONGODB_URI is set -- answers are skipped gracefully when it is not, so the
 * build still works without database access).
 *
 *   node scripts/prerender.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// The database URL lives in server/.env, not the root .env (which only holds
// VITE_-prefixed, publicly-inlined values).
try {
  const dotenv = (await import('dotenv')).default;
  dotenv.config({ path: join(ROOT, 'server', '.env') });
} catch {
  // dotenv is optional here; without it we simply prerender without answers.
}
const DIST = join(ROOT, 'dist');

// Vite outputs ESM that Node can import directly, but the source tree uses JSX.
// The prerender entry is built separately by vite (see prerender:bundle) into
// a Node-loadable module.
const ENTRY = join(DIST, 'prerender-entry', 'entry.js');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found. Run `vite build` first.');
  process.exit(1);
}
if (!existsSync(ENTRY)) {
  console.error(`${ENTRY} not found. Run the prerender bundle step first.`);
  process.exit(1);
}

/**
 * The pristine shell, cached separately from dist/index.html.
 *
 * Route "/" is written back to dist/index.html, so on a second run without an
 * intervening `vite build` that file no longer contains an empty
 * `<div id="root"></div>`. The replace below would then match nothing and every
 * route would be written the stale, already-rendered homepage -- silently, with
 * a success message. Keeping an untouched copy makes re-runs idempotent.
 */
const TEMPLATE_CACHE = join(DIST, '.prerender-template.html');
const built = readFileSync(join(DIST, 'index.html'), 'utf8');

if (built.includes('<div id="root"></div>')) {
  // Fresh from vite build: this is the pristine shell.
  writeFileSync(TEMPLATE_CACHE, built, 'utf8');
} else if (!existsSync(TEMPLATE_CACHE)) {
  console.error(
    'dist/index.html has already been prerendered and no template cache exists.\n' +
    'Run `vite build` to regenerate a clean shell, then prerender again.'
  );
  process.exit(1);
}

const template = readFileSync(TEMPLATE_CACHE, 'utf8');

const { AppRoutes, seedQuestionData, slugify, groupCompanies, StaticRouter } = await import(
  'file://' + ENTRY.replace(/\\/g, '/')
);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
function readJson(rel) {
  const full = join(ROOT, rel);
  return existsSync(full) ? JSON.parse(readFileSync(full, 'utf8')) : [];
}

const techRaw = readJson('server/data/interview_questions_combined.json');
const hrRaw = readJson('server/data/hr_questions_company_wise.json');

// The free-tier sample sizes must match the server's, or prerendered pages
// would show a different amount of content than the live API returns for the
// same anonymous visitor -- which is exactly the mismatch Google penalises.
// Both default to 0 here for the same reason they do in server/config/products.js:
// an anonymous visitor is told how many questions exist, never what they are.
const FREE_TECH_SAMPLE = parseInt(process.env.FREE_TECH_SAMPLE || '0', 10);
const FREE_HR_SAMPLE =
  process.env.FREE_HR_SAMPLE === 'all'
    ? null
    : parseInt(process.env.FREE_HR_SAMPLE || '0', 10);

function sampleTech(e) {
  const tech = e.technical_questions || [];
  const prog = e.programming_questions || [];
  const total = tech.length + prog.length;
  const shownTech = tech.slice(0, FREE_TECH_SAMPLE);
  const shownProg = prog.slice(0, Math.max(0, FREE_TECH_SAMPLE - shownTech.length));
  const shown = shownTech.length + shownProg.length;
  return {
    ...e,
    technical_questions: shownTech,
    programming_questions: shownProg,
    locked: total > shown,
    lockedCount: total - shown,
    totalAvailable: total,
    counts: { technical: tech.length, programming: prog.length, hr: 0, total },
  };
}

function sampleHrEntry(e) {
  const all = e.hr_questions || [];
  const counts = { technical: 0, programming: 0, hr: all.length, total: all.length };
  if (FREE_HR_SAMPLE === null) {
    return { ...e, locked: false, lockedCount: 0, totalAvailable: all.length, counts };
  }
  const shown = all.slice(0, FREE_HR_SAMPLE);
  return {
    ...e,
    hr_questions: shown,
    locked: all.length > shown.length,
    lockedCount: all.length - shown.length,
    totalAvailable: all.length,
    counts,
  };
}

const tech = techRaw.map(sampleTech);
const hr = hrRaw.map(sampleHrEntry);

// Cached answers, when a database is reachable.
let answers = {};
if (process.env.MONGODB_URI) {
  try {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connect(process.env.MONGODB_URI);
    const rows = await mongoose.connection.db.collection('answers').find({}).toArray();
    for (const r of rows) answers[r.question] = { answer: r.answer, type: r.type };
    await mongoose.disconnect();
    console.log(`  loaded ${rows.length} cached answers`);
  } catch (err) {
    console.warn(`  ! could not load answers (${err.message}); prerendering without them`);
  }
} else {
  console.warn('  ! MONGODB_URI not set; prerendering without cached answers');
}

// ---------------------------------------------------------------------------
// Routes to prerender
// ---------------------------------------------------------------------------
const grouped = groupCompanies([
  ...techRaw.map((e) => e.company),
  ...hrRaw.map((e) => e.company),
]);

const yearsBySlug = new Map();
for (const e of techRaw) {
  const s = slugify((e.company || '').trim());
  if (!s || !e.year) continue;
  if (!yearsBySlug.has(s)) yearsBySlug.set(s, new Set());
  yearsBySlug.get(s).add(e.year);
}

const routes = ['/', '/companies', '/pricing', '/terms', '/privacy', '/refund', '/contact'];
for (const { slug } of grouped.values()) {
  routes.push(`/company/${slug}`);
  for (const year of yearsBySlug.get(slug) || []) {
    routes.push(`/company/${slug}/${year}`);
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
/**
 * The seed embedded in each page, scoped to what that page actually renders.
 *
 * Seeding every route with the whole bank made each company page ~185KB (a
 * 152KB blob of all 172 companies) and dist/ 50MB. A company page only ever
 * renders its own questions, so it only ships its own.
 *
 * "/" and "/companies" genuinely need every company, because both derive
 * per-company counts for the grid. The legal pages need nothing at all.
 */
// Answers are premium content, and an answer's KEY is the question itself --
// so shipping the answer map ships both. Scope it to the questions the page
// actually renders, for every route. "/" and "/companies" render no question
// text at all, so they now embed no answers; before this they embedded the
// entire cache, which handed every answered question away in view-source.
function answersFor(scopedTech, scopedHr) {
  const visible = new Set([
    ...scopedTech.flatMap((e) => e.technical_questions || []),
    ...scopedTech.flatMap((e) => e.programming_questions || []),
    ...scopedHr.flatMap((e) => e.hr_questions || []),
  ]);
  const out = {};
  for (const [q, v] of Object.entries(answers)) {
    if (visible.has(q)) out[q] = v;
  }
  return out;
}

function seedFor(route) {
  if (route === '/' || route === '/companies') {
    return { tech, hr, answers: answersFor(tech, hr) };
  }

  const m = route.match(/^\/company\/([^/]+)/);
  if (!m) return null; // legal pages, 404: no question data rendered

  const slug = m[1];
  const scopedTech = tech.filter((e) => slugify((e.company || '').trim()) === slug);
  const scopedHr = hr.filter((e) => slugify((e.company || '').trim()) === slug);

  return { tech: scopedTech, hr: scopedHr, answers: answersFor(scopedTech, scopedHr) };
}

// Meta names/properties contain characters that are regex-significant (":" in
// og:title is harmless, but escaping keeps this correct for any future tag).
const escapeRe = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let written = 0;
let failed = 0;

for (const route of routes) {
  try {
    const seed = seedFor(route);

    // Seeded per route, immediately before rendering it.
    seedQuestionData(seed ? { tech: seed.tech, hr: seed.hr } : null);
    globalThis.__PRERENDER_ANSWERS__ = seed ? seed.answers : {};

    const seedBlob = seed
      ? `<script>window.__PRERENDER_DATA__=${JSON.stringify(seed).replace(/</g, '\\u003c')}</script>`
      : '';

    const html = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: route }, React.createElement(AppRoutes))
    );

    // Seo renders <title>/<meta>/<link> as real elements, so in static markup
    // they land in the body. React hoists them into <head> in the browser, but
    // a non-JS crawler reads the raw file, and a <title> inside <body> is not
    // reliably honoured. So lift them out of the body and into the head.
    const hoisted = [];
    const body = html
      .replace(/<title>[\s\S]*?<\/title>/g, (m) => { hoisted.push(m); return ''; })
      .replace(/<link\b[^>]*rel="canonical"[^>]*>/g, (m) => { hoisted.push(m); return ''; })
      .replace(/<meta\b[^>]*>/g, (m) => { hoisted.push(m); return ''; });

    // The hoisted tags must REPLACE the shell's defaults, not sit alongside
    // them: two <title> elements means the crawler may read the generic one.
    let head = template;
    for (const tag of hoisted) {
      if (tag.startsWith('<title')) {
        head = head.replace(/<title>[\s\S]*?<\/title>/, '');
        continue;
      }
      const name = tag.match(/\bname="([^"]+)"/)?.[1];
      const prop = tag.match(/\bproperty="([^"]+)"/)?.[1];
      if (name) {
        head = head.replace(new RegExp(`<meta[^>]*\\bname="${escapeRe(name)}"[^>]*>`, 'g'), '');
      } else if (prop) {
        head = head.replace(new RegExp(`<meta[^>]*\\bproperty="${escapeRe(prop)}"[^>]*>`, 'g'), '');
      } else if (tag.startsWith('<link')) {
        head = head.replace(/<link[^>]*rel="canonical"[^>]*>/g, '');
      }
    }

    const page = head
      .replace('</head>', `  ${hoisted.join('\n    ')}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${body}</div>\n    ${seedBlob}`);

    const outDir = route === '/' ? DIST : join(DIST, route);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), page, 'utf8');
    written++;
  } catch (err) {
    failed++;
    console.error(`  FAILED ${route}: ${err.message}`);
  }
}

// Build artefacts that must not ship: the SSR bundle and the template cache
// are written inside dist/, so without this they are served publicly alongside
// the site. Neither contains secrets, but neither belongs on the CDN.
for (const junk of ['prerender-entry', '.prerender-template.html']) {
  rmSync(join(DIST, junk), { recursive: true, force: true });
}

console.log(`prerendered ${written} routes${failed ? `, ${failed} failed` : ''}`);
if (failed) process.exit(1);
