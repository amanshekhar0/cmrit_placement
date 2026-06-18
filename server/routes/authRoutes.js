const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/login
// Called after frontend verifies Google token to track login
router.post('/login', verifyToken, async (req, res) => {
  try {
    const { email, name, picture } = req.user;
    
    let user = await User.findOne({ email });
    
    if (user) {
      user.loginCount += 1;
      user.lastLogin = Date.now();
      user.name = name; // Update in case it changed
      user.picture = picture;
      await user.save();
    } else {
      user = await User.create({ email, name, picture });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
