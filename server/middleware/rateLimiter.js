const rateLimit = require('express-rate-limit');

// Standard rate limiter for all API routes (e.g., GET requests)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for admin modifying routes (POST, PUT, DELETE)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { success: false, message: 'Too many admin actions from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, adminLimiter };
