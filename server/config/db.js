const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, do not create a new connection (important for serverless)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Only exit the process if we are running a local persistent server
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error; // Let the route handlers catch it and return 500
  }
};

module.exports = connectDB;
