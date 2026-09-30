import mongoose from "mongoose";
import { getCollegeDatabase } from "../utils/collegeDatabase.js";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    hodId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "departments"
  }
);

departmentSchema.index(
  { code: 1 },
  { unique: true }
);

departmentSchema.index({
  name: 1
});

departmentSchema.index({
  isActive: 1
});

export function getDepartmentModel(
  databaseName
) {
  const collegeDB =
    getCollegeDatabase(databaseName);

  return (
    collegeDB.models.Department ||
    collegeDB.model(
      "Department",
      departmentSchema
    )
  );
}