// backend/src/server.js

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

console.log("MONGODB_URI loaded:", Boolean(process.env.MONGODB_URI));

await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});