import mongoose from "mongoose";
import { getCollegeDatabase } from "../utils/collegeDatabase.js";


const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    subjectCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    subjectName: {
      type: String,
      required: true,
      trim: true
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
      required: true,
      min: 1,
      max: 8
    },

    examType: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "internal",
        "midterm",
        "practical",
        "theory",
        "end_semester",
        "final"
      ]
    },

    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 1
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    grade: {
      type: String,
      trim: true,
      default: null
    },

    gradePoint: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },

    resultStatus: {
      type: String,
      enum: [
        "pass",
        "fail",
        "absent"
      ],
      default: "pass"
    },

    remarks: {
      type: String,
      trim: true,
      default: ""
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: "results"
  }
);


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

resultSchema.index({
  studentId: 1
});

resultSchema.index({
  department: 1
});

resultSchema.index({
  subjectId: 1
});

resultSchema.index({
  academicYear: 1
});

resultSchema.index({
  semester: 1
});

resultSchema.index({
  department: 1,
  academicYear: 1,
  semester: 1
});

resultSchema.index({
  studentId: 1,
  academicYear: 1,
  semester: 1
});

resultSchema.index({
  "studentId": 1,
  "subjectId": 1,
  "academicYear": 1,
  "semester": 1,
  "examType": 1
});


/*
|--------------------------------------------------------------------------
| TENANT RESULT MODEL
|--------------------------------------------------------------------------
*/

export function getResultModel(
  databaseName
) {
  const collegeDB =
    getCollegeDatabase(
      databaseName
    );

  return (
    collegeDB.models.Result ||
    collegeDB.model(
      "Result",
      resultSchema
    )
  );
}