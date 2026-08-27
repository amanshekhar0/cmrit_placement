const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "671075020129-094p0idt8r9p9rr54mp0125j9l3ncqbl.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
// Use the configured secret. Fall back to a dev-only secret LOCALLY, but never
// in production (VERCEL) — there, a missing secret must fail closed rather than
// sign/verify tokens with a value that is public in the repo.
const JWT_SECRET = process.env.JWT_SECRET || (process.env.VERCEL ? null : 'cmrit-dev-secret-change-me');
const SESSION_DAYS = 30;

if (!JWT_SECRET) {
  // Without this every sign-in fails to mint a token and every protected
  // route answers 401, which reads to students as 'invalid or expired
  // session'. Make the real cause obvious in the logs.
  console.error(
    'FATAL: JWT_SECRET is not set. Sign-in cannot issue sessions and all ' +
      'authenticated routes will fail. Set JWT_SECRET in the Vercel project ' +
      'environment variables (same value as server/.env) and redeploy.'
  );
}

// Verify a Google ID token. Used ONLY at sign-in to mint our own session token.
async function verifyGoogleCredential(credential) {
  const ticket = await client.verifyIdToken({ idToken: credential, audience: CLIENT_ID });
  const payload = ticket.getPayload();
  const email = (payload.email || '').toLowerCase();
  if (!email.endsWith('@cmrit.ac.in')) {
    const err = new Error('Invalid domain');
    err.code = 'INVALID_DOMAIN';
    throw err;
  }
  return { email, name: payload.name, picture: payload.picture };
}

// Issue a long-lived app session token. Google ID tokens expire after ~1 hour,
// which logged users out (and broke paid access) — our own token lasts 30 days.
function issueSessionToken(user) {
  if (!JWT_SECRET) {
    const err = new Error('JWT_SECRET is not configured on the server');
    err.code = 'AUTH_NOT_CONFIGURED';
    throw err;
  }
  return jwt.sign(
    { email: user.email, name: user.name, picture: user.picture },
    JWT_SECRET,
    { expiresIn: `${SESSION_DAYS}d` }
  );
}

// Verify our own session JWT for all protected routes.
const verifyToken = (req, res, next) => {
  // A server that cannot verify anything is a server problem, not the
  // caller's -- 503 says so instead of blaming the student's session.
  if (!JWT_SECRET) {
    return res.status(503).json({
      success: false,
      code: 'AUTH_NOT_CONFIGURED',
      message: 'Sign-in is temporarily unavailable. Please try again shortly.',
    });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  // A client that cached a user without a token sends the literal strings
  // 'undefined' / 'null' here. Treat them as no token at all.
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({
      success: false,
      code: 'NO_SESSION',
      message: 'Please sign in again to continue.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { email: decoded.email, name: decoded.name, picture: decoded.picture };
    next();
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    // Logged so a secret rotation (every token rejected at once) is
    // distinguishable from ordinary expiry in the Vercel logs.
    console.warn(`Auth rejected on ${req.method} ${req.originalUrl}: ${err.name} - ${err.message}`);
    res.status(401).json({
      success: false,
      code: expired ? 'SESSION_EXPIRED' : 'SESSION_INVALID',
      message: expired
        ? 'Your session has expired. Please sign in again.'
        : 'Your session is no longer valid. Please sign in again.',
    });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    const email = req.user.email;
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase())
      : [];
    if (adminEmails.length === 0) adminEmails.push('amsh23ise@cmrit.ac.in');
    if (!adminEmails.includes(email)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
};

module.exports = { verifyToken, verifyAdmin, verifyGoogleCredential, issueSessionToken };
