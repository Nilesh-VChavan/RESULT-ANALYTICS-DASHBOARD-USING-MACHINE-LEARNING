import "dotenv/config";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

await connectDB();
await User.create({ name: "Principal", email: "admin@example.com", password: "password123", role: "principal" }).catch(() => {});
console.log("Seed complete");
process.exit(0);