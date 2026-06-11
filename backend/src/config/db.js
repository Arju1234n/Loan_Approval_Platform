const mongoose = require('mongoose');

const connectDB = async () => {
  console.log("DEBUG MONGODB_URI type: ", typeof process.env.MONGODB_URI);
  console.log("DEBUG REVEAL FIRST 3 CHARS: ", process.env.MONGODB_URI.substring(0, 3));
  if (process.env.MONGODB_URI) {
      console.log("DEBUG: Starts with mongodb: ", process.env.MONGODB_URI.startsWith("mongodb"));
  } else {
      console.log("DEBUG: MONGODB_URI is undefined or empty");
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✗ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
