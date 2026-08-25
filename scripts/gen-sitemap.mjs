/**
 * Generates public/sitemap.xml at build time.
 *
 * Reads the question bank from server/data so the company list is always in
 * step with the actual content, rather than a hand-maintained list that silently
 * goes stale every time a drive is added.
 *
 * Wired into `npm run build`, so a deploy can never ship a sitemap that
 * disagrees with the data.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { slugify, groupCompanies } from '../src/utils/slug.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.env.SITE_URL || 'https://cmritplacement.vercel.app';

// Company URLs are only listed once /company/:slug routes actually render
// distinct pages. Until then every one of them falls through to the SPA
// catch-all and serves identical markup -- submitting ~280 duplicate pages to
// Google is actively worse than submitting none. Flip this to true in the same
// change that adds the routes.
// /company/:slug and /company/:slug/:year now render distinct pages, so the
// company URLs are safe to advertise.
const COMPANY_ROUTES_EXIST = process.env.COMPANY_ROUTES !== 'false';

// Imported, not reimplemented: one definition of a company's URL.

function readJson(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    console.warn(`  ! ${relPath} not found, skipping`);
    return [];
  }
  return JSON.parse(readFileSync(full, 'utf8'));
}

const tech = readJson('server/data/interview_questions_combined.json');
const hr = readJson('server/data/hr_questions_company_wise.json');

// Static, always-present routes.
const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/companies', priority: '0.9', changefreq: 'weekly' },
  { loc: '/pricing', priority: '0.7', changefreq: 'monthly' },
  { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: '/refund', priority: '0.3', changefreq: 'yearly' },
  { loc: '/contact', priority: '0.4', changefreq: 'yearly' },
];

// Group by slug so casing variants of one employer ("PhonePe" / "Phonepe")
// produce a single URL rather than two that split its ranking.
const grouped = groupCompanies([...tech.map((e) => e.company), ...hr.map((e) => e.company)]);

const yearsBySlug = new Map();
for (const e of tech) {
  const slug = slugify((e.company || '').trim());
  if (!slug || !e.year) continue;
  if (!yearsBySlug.has(slug)) yearsBySlug.set(slug, new Set());
  yearsBySlug.get(slug).add(e.year);
}

if (COMPANY_ROUTES_EXIST) {
  for (const { slug } of [...grouped.values()].sort((a, b) => a.slug.localeCompare(b.slug))) {
    urls.push({ loc: `/company/${slug}`, priority: '0.8', changefreq: 'monthly' });
    for (const year of [...(yearsBySlug.get(slug) || [])].sort()) {
      urls.push({ loc: `/company/${slug}/${year}`, priority: '0.6', changefreq: 'yearly' });
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
const body = urls
  .map(
    (u) => `  <url>
    <loc>${SITE}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

writeFileSync(join(ROOT, 'public/sitemap.xml'), xml, 'utf8');

console.log(`sitemap.xml: ${urls.length} URLs (${grouped.size} companies)`);
if (!COMPANY_ROUTES_EXIST) {
  console.log('  note: company pages withheld (COMPANY_ROUTES=false)');
}
