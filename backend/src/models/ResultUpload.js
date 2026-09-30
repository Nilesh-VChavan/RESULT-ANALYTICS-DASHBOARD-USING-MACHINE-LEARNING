import mongoose from "mongoose";
import { getCollegeDatabase } from "../utils/collegeDatabase.js";


const resultUploadSchema =
  new mongoose.Schema(
    {
      fileName: {
        type: String,
        required: true,
        trim: true
      },

      fileType: {
        type: String,
        required: true,
        enum: [
          "csv",
          "xlsx",
          "xls"
        ]
      },

      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },

      status: {
        type: String,
        enum: [
          "uploaded",
          "validated",
          "published",
          "failed"
        ],
        default: "uploaded"
      },

      totalRows: {
        type: Number,
        default: 0
      },

      validRows: {
        type: Number,
        default: 0
      },

      invalidRows: {
        type: Number,
        default: 0
      },

      validationErrors: {
        type: [
          {
            row: Number,
            message: String
          }
        ],
        default: []
      },

      rows: {
        type: [
          {
            studentId: String,
            subjectCode: String,
            academicYear: String,
            semester: Number,
            examType: String,
            marksObtained: Number,
            maxMarks: Number,
            remarks: String
          }
        ],
        default: []
      },

      publishedAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true,
      collection: "resultUploads"
    }
  );


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

resultUploadSchema.index({
  uploadedBy: 1
});

resultUploadSchema.index({
  status: 1
});

resultUploadSchema.index({
  createdAt: -1
});


/*
|--------------------------------------------------------------------------
| TENANT RESULT UPLOAD MODEL
|--------------------------------------------------------------------------
*/

export function getResultUploadModel(
  databaseName
) {
  const collegeDB =
    getCollegeDatabase(
      databaseName
    );

  return (
    collegeDB.models.ResultUpload ||
    collegeDB.model(
      "ResultUpload",
      resultUploadSchema
    )
  );
}