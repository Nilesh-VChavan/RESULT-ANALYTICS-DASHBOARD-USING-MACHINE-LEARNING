// backend/src/models/RevokedToken.js

import mongoose from "mongoose";
import { platformDB } from "../config/platformDb.js";

const revokedTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: "revokedTokens"
  }
);

revokedTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const RevokedToken = platformDB.model(
  "RevokedToken",
  revokedTokenSchema
);

export async function revokeToken(token) {
  const jwt = await import("jsonwebtoken");

  const decoded = jwt.decode(token);

  if (!decoded || !decoded.jti || !decoded.exp) {
    throw new Error("Invalid token");
  }

  await RevokedToken.create({
    jti: decoded.jti,
    expiresAt: new Date(decoded.exp * 1000)
  });

  return true;
}

export default RevokedToken;