const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "671075020129-094p0idt8r9p9rr54mp0125j9l3ncqbl.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const email = payload.email || '';

    // Check if it's a CMRIT email
    if (!email.toLowerCase().endsWith('@cmrit.ac.in')) {
      return res.status(403).json({ success: false, message: 'Invalid domain' });
    }

    // Attach user to request
    req.user = { 
      email: email.toLowerCase(), 
      name: payload.name,
      picture: payload.picture
    };
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const verifyAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    const email = req.user.email;

    // Check admin emails if specified in env
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
    
    // Hardcode specific admin if no env var is set, or add it to the list
    if (adminEmails.length === 0) {
      adminEmails.push('amsh23ise@cmrit.ac.in');
    }

    if (!adminEmails.includes(email)) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    next();
  });
};

module.exports = { verifyToken, verifyAdmin };
