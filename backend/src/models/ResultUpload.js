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
        enum: [
          "csv",
          "excel"
        ],
        required: true
      },

      filePath: {
        type: String,
        required: true
      },

      status: {
        type: String,
        enum: [
          "uploaded",
          "validated",
          "invalid",
          "published"
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

      subjectCodes: {
        type: [String],
        default: []
      },

      headers: {
        type: [String],
        default: []
      },

      validationErrors: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
      },

      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
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


resultUploadSchema.index({
  status: 1
});

resultUploadSchema.index({
  createdAt: -1
});

resultUploadSchema.index({
  uploadedBy: 1
});


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