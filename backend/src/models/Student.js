import mongoose from "mongoose";
import { getCollegeDatabase } from "../utils/collegeDatabase.js";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null
    },

    phone: {
      type: String,
      trim: true,
      default: null
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    academicYear: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: Number,
      min: 1,
      max: 8,
      required: true
    },

    division: {
      type: String,
      trim: true,
      default: null
    },

    admissionYear: {
      type: Number,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "students"
  }
);


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

studentSchema.index(
  { studentId: 1 },
  { unique: true }
);

studentSchema.index({
  department: 1
});

studentSchema.index({
  academicYear: 1
});

studentSchema.index({
  semester: 1
});

studentSchema.index({
  department: 1,
  academicYear: 1
});

studentSchema.index({
  isActive: 1
});


/*
|--------------------------------------------------------------------------
| TENANT STUDENT MODEL
|--------------------------------------------------------------------------
*/

export function getStudentModel(databaseName) {
  const collegeDB =
    getCollegeDatabase(databaseName);

  return (
    collegeDB.models.Student ||
    collegeDB.model(
      "Student",
      studentSchema
    )
  );
}