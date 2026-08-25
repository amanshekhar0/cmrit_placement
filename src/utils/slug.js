/**
 * Company name <-> URL slug handling.
 *
 * Shared by the app and by scripts/gen-sitemap.mjs so a company's URL is
 * derived one way only. If these ever diverge, the sitemap advertises URLs the
 * router cannot resolve.
 */

/** URL-safe key for a company name. Not reversible -- use findCompanies to go back. */
export function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Preferred display spelling where the data contains casing variants of one
 * company ("PhonePe" and "Phonepe" both slug to "phonepe").
 *
 * These are the same employer entered inconsistently across drives, so they
 * must render as a single company: two cards for PhonePe is a visible bug, and
 * two URLs for it splits the SEO value of the page in half. Listed explicitly
 * rather than guessed at, because brand casing has no reliable rule -- "iManage"
 * and "KOCH" are both correct as written.
 */
const CANONICAL_NAMES = {
  'phonepe': 'PhonePe',
  'tata-elxsi': 'Tata Elxsi',
  'dhiomics': 'dhiOmics',
  'msg-global-solutions': 'MSG Global Solutions',
  'koch': 'Koch',
  'bluebird': 'BlueBird',
  'light-and-wonder': 'Light & Wonder',
  'imanage': 'iManage',
};

/** The name to show for a slug, given the variants actually present in the data. */
export function displayName(slug, variants = []) {
  if (CANONICAL_NAMES[slug]) return CANONICAL_NAMES[slug];
  if (!variants.length) return slug;
  // No canonical entry: prefer the variant that is not all-uppercase and not
  // all-lowercase, which is usually the correctly-cased one.
  const mixed = variants.find((v) => v !== v.toUpperCase() && v !== v.toLowerCase());
  return mixed || variants[0];
}

/**
 * Group raw company names by slug.
 *
 * Returns Map<slug, { slug, name, variants: string[] }>, so callers can both
 * render one card per real company and still match every spelling when
 * filtering the question data.
 */
export function groupCompanies(names) {
  const bySlug = new Map();
  for (const raw of names) {
    const name = String(raw || '').trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, { slug, name: '', variants: [] });
    const entry = bySlug.get(slug);
    if (!entry.variants.includes(name)) entry.variants.push(name);
  }
  for (const entry of bySlug.values()) {
    entry.name = displayName(entry.slug, entry.variants);
  }
  return bySlug;
}

/** True when a raw company name belongs to the given slug. */
export function matchesSlug(companyName, slug) {
  return slugify(companyName) === slug;
}
