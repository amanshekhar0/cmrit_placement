const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyGoogleCredential, issueSessionToken } = require('../middleware/authMiddleware');

// POST /api/auth/google
// Exchange a Google ID token for a long-lived app session token (30 days),
// and upsert the user / track the login.
router.post('/google', async (req, res) => {
  try {
    const credential = req.body.credential || (req.headers.authorization || '').replace('Bearer ', '');
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Missing Google credential' });
    }

    let profile;
    try {
      profile = await verifyGoogleCredential(credential);
    } catch (e) {
      const msg = e.code === 'INVALID_DOMAIN'
        ? 'Please sign in with your @cmrit.ac.in email.'
        : 'Invalid or expired Google token.';
      return res.status(401).json({ success: false, message: msg });
    }

    let user = await User.findOne({ email: profile.email });
    if (user) {
      user.loginCount += 1;
      user.lastLogin = Date.now();
      user.name = profile.name;
      user.picture = profile.picture;
      await user.save();
    } else {
      user = await User.create({ email: profile.email, name: profile.name, picture: profile.picture });
    }

    let token;
    try {
      token = issueSessionToken(profile);
    } catch (e) {
      // Never hand back a success without a token: the client would cache a
      // 'signed in' user that fails every protected call with a 401.
      if (e.code === 'AUTH_NOT_CONFIGURED') {
        console.error('Sign-in failed:', e.message);
        return res.status(503).json({
          success: false,
          code: 'AUTH_NOT_CONFIGURED',
          message: 'Sign-in is temporarily unavailable. Please try again shortly.',
        });
      }
      throw e;
    }

    res.json({
      success: true,
      token,
      user: { email: profile.email, name: profile.name, picture: profile.picture },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
