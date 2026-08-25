const jwt = require('jsonwebtoken');
const { getEntitlements } = require('../utils/accessService');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.VERCEL ? null : 'cmrit-dev-secret-change-me');

// Decode the session token if one is present, but never reject.
//
// Used on the public question routes: an anonymous visitor gets the free
// sample, a signed-in subscriber gets everything, and both are served by the
// same handler. Deliberately distinct from verifyToken, which fails closed.
function optionalAuth(req, res, next) {
  req.user = null;
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ') && JWT_SECRET) {
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      req.user = { email: decoded.email, name: decoded.name, picture: decoded.picture };
    }
  } catch {
    // Expired or tampered token is treated as anonymous, not as an error.
    req.user = null;
  }
  next();
}

// Resolve the caller's entitlements onto req.access.
//
// Always hits the database rather than trusting a claim in the JWT: sessions
// last 30 days (authMiddleware.js), so a token minted today would otherwise
// outlive a 60-day pass that expires next month, or keep working after a
// refund. Entitlement is checked per request, never cached in the token.
async function attachAccess(req, res, next) {
  try {
    req.access = req.user
      ? await getEntitlements(req.user.email)
      : { questions: false, notes: false, lifetime: false, expiresAt: null, products: [] };
    next();
  } catch (err) {
    next(err);
  }
}

// Hard gate for routes that have no free tier (note downloads, AI answers).
function requireAccess(capability) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Sign in to continue.' });
    }
    if (!req.access || !req.access[capability]) {
      return res.status(402).json({
        success: false,
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'This requires an active CMRIT Placement Pass.',
      });
    }
    next();
  };
}

module.exports = { optionalAuth, attachAccess, requireAccess };
