const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "671075020129-094p0idt8r9p9rr54mp0125j9l3ncqbl.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);
// Use the configured secret. Fall back to a dev-only secret LOCALLY, but never
// in production (VERCEL) — there, a missing secret must fail closed rather than
// sign/verify tokens with a value that is public in the repo.
const JWT_SECRET = process.env.JWT_SECRET || (process.env.VERCEL ? null : 'cmrit-dev-secret-change-me');
const SESSION_DAYS = 30;

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
  return jwt.sign(
    { email: user.email, name: user.name, picture: user.picture },
    JWT_SECRET,
    { expiresIn: `${SESSION_DAYS}d` }
  );
}

// Verify our own session JWT for all protected routes.
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { email: decoded.email, name: decoded.name, picture: decoded.picture };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
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
