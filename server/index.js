const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const technicalRoutes = require('./routes/technicalRoutes');
const hrRoutes = require('./routes/hrRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Vercel's proxy for accurate IP rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl or postman)
    if (!origin) return callback(null, true);
    
    const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
    const isProduction = origin === 'https://cmritplacement.vercel.app';
    
    if (isLocalhost || isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 CMRIT Placement API is running',
    version: '1.0.0',
    endpoints: {
      technical: '/api/technical',
      hr: '/api/hr',
      stats: '/api/stats'
    }
  });
});

// API Routes
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/technical', technicalRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Technical API: http://localhost:${PORT}/api/technical`);
      console.log(`💬 HR API:        http://localhost:${PORT}/api/hr`);
      console.log(`📊 Stats API:     http://localhost:${PORT}/api/stats\n`);
    });
  }
};

startServer();

module.exports = app;
