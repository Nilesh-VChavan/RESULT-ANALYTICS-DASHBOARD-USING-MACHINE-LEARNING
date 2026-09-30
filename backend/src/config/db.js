// backend/src/config/db.js

import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is undefined. Check backend/.env location and dotenv configuration."
    );
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};