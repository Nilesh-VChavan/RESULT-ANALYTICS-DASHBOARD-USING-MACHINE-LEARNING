import mongoose from "mongoose";
import { getCollegeDatabase } from "../utils/collegeDatabase.js";


const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8
    },

    academicYear: {
      type: String,
      required: true,
      trim: true
    },

    credits: {
      type: Number,
      default: 0,
      min: 0
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "subjects"
  }
);


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

subjectSchema.index(
  { code: 1 },
  { unique: true }
);

subjectSchema.index({
  department: 1
});

subjectSchema.index({
  semester: 1
});

subjectSchema.index({
  academicYear: 1
});

subjectSchema.index({
  department: 1,
  semester: 1
});

subjectSchema.index({
  isActive: 1
});


/*
|--------------------------------------------------------------------------
| TENANT SUBJECT MODEL
|--------------------------------------------------------------------------
*/

export function getSubjectModel(
  databaseName
) {
  const collegeDB =
    getCollegeDatabase(
      databaseName
    );

  return (
    collegeDB.models.Subject ||
    collegeDB.model(
      "Subject",
      subjectSchema
    )
  );
}