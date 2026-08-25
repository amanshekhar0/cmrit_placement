/**
 * Asserts the CommonJS and ESM slug implementations agree.
 *
 * They must stay identical: the server uses its copy to decide which answers
 * belong to /company/:slug, and the client uses its copy to decide which
 * questions to render there. A divergence would silently serve one company's
 * answers on another company's page.
 *
 *   node server/scripts/checkSlugParity.js
 *
 * Exits non-zero on mismatch, so it is safe to run in CI.
 */
const path = require('path');
const { readFileSync } = require('fs');
const { slugify: cjsSlugify } = require('../utils/slug');

const ROOT = path.join(__dirname, '..', '..');

async function main() {
  const esm = await import(
    // A file:// URL is required for a Windows absolute path.
    'file://' + path.join(ROOT, 'src', 'utils', 'slug.js').replace(/\\/g, '/')
  );

  const tech = JSON.parse(
    readFileSync(path.join(ROOT, 'server/data/interview_questions_combined.json'), 'utf8')
  );
  const hr = JSON.parse(
    readFileSync(path.join(ROOT, 'server/data/hr_questions_company_wise.json'), 'utf8')
  );

  const names = new Set(
    [...tech.map((e) => e.company), ...hr.map((e) => e.company)]
      .map((n) => String(n || '').trim())
      .filter(Boolean)
  );

  // Include adversarial inputs alongside the real data, so the check covers
  // shapes the current dataset happens not to contain.
  const extra = [
    'Light & Wonder', 'AT&T', '  spaced  out  ', 'ALL CAPS CO',
    'dots.and.dots', 'slash/co', 'plus+co', 'unicode-café', '123 Numeric',
    '---leading', 'trailing---', 'Multi   Space',
  ];

  let mismatches = 0;
  for (const name of [...names, ...extra]) {
    const a = cjsSlugify(name);
    const b = esm.slugify(name);
    if (a !== b) {
      mismatches++;
      console.error(`  MISMATCH ${JSON.stringify(name)}: cjs=${a} esm=${b}`);
    }
  }

  if (mismatches) {
    console.error(`\nFAIL: ${mismatches} slug mismatch(es) between server/utils/slug.js and src/utils/slug.js`);
    process.exit(1);
  }
  console.log(`slug parity OK (${names.size} company names + ${extra.length} edge cases)`);
}

main().catch((err) => {
  console.error('checkSlugParity failed:', err);
  process.exit(1);
});
