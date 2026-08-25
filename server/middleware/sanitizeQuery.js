/**
 * Rejects MongoDB operator objects arriving through query strings.
 *
 * Express parses `?year[$gt]=0` into `{ year: { $gt: '0' } }`, and any route
 * that assigns a query value straight onto a filter (`filter.year = year`)
 * hands Mongo a live operator. Verified: `?year[$gt]=0` returned all 114
 * entries instead of the 36 for a real year.
 *
 * It leaked nothing on its own -- the paywall samples after filtering, so a
 * widened filter still returns only free-tier questions -- but it is an
 * injection primitive, and the next route that uses a query value less
 * carefully would turn it into a real hole.
 *
 * Strings and arrays of strings are allowed through untouched; anything
 * object-shaped, and any key starting with `$` or containing a dot, is refused.
 */
function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function offending(value) {
  if (typeof value === 'string') return false;
  if (Array.isArray(value)) return value.some(offending);
  if (isPlainObject(value)) return true;
  return false;
}

function sanitizeQuery(req, res, next) {
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key.startsWith('$') || key.includes('.') || offending(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid query parameter: ${key}`,
      });
    }
  }
  next();
}

/**
 * Same check for request bodies on non-admin routes.
 *
 * Admin CRUD deliberately accepts rich bodies, so this is applied selectively
 * rather than globally.
 */
function sanitizeBody(req, res, next) {
  for (const key of Object.keys(req.body || {})) {
    if (key.startsWith('$') || key.includes('.')) {
      return res.status(400).json({
        success: false,
        message: `Invalid field: ${key}`,
      });
    }
  }
  next();
}

module.exports = { sanitizeQuery, sanitizeBody };
