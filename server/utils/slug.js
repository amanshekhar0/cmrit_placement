/**
 * CommonJS twin of src/utils/slug.js.
 *
 * The server is CommonJS and the client is ESM, so the logic cannot be shared
 * by import. It is duplicated here deliberately -- and guarded: running
 *
 *   node server/scripts/checkSlugParity.js
 *
 * asserts the two implementations agree on every company name in the data.
 * That check runs as part of `npm run verify`. If you edit one of these files,
 * edit the other.
 */
function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };
