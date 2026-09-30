// backend/src/models/College.js

import mongoose from "mongoose";
import { platformDB } from "../config/platformDb.js";

const collegeSchema = new mongoose.Schema(
  {
    collegeName: {
      type: String,
      required: true,
      trim: true
    },

    collegeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },

    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    city: String,
    state: String,
    pincode: String,

    databaseName: {
      type: String,
      required: true,
      unique: true
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    }
  },
  {
    timestamps: true,
    collection: "colleges"
  }
);

export default platformDB.model("College", collegeSchema);