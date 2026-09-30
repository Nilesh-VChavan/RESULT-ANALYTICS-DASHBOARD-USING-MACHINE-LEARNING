import mongoose from "mongoose";
import { getCollegeDatabase } from "../utils/collegeDatabase.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: [
        "principal",
        "hod",
        "student",
        "exam_department"
      ],
      required: true
    },

    department: {
      type: String,
      default: null
    },

    studentId: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

userSchema.index(
  { email: 1 },
  { unique: true }
);

userSchema.index({
  role: 1
});

export function getUserModel(databaseName) {
  const collegeDB = getCollegeDatabase(databaseName);

  return (
    collegeDB.models.User ||
    collegeDB.model("User", userSchema)
  );
}