import express from "express";

import {
  uploadCSV,
  uploadExcel,
  validate,
  preview,
  publish,
  updatePublished,
  deleteUpload
} from "../controllers/examDepartment.controller.js";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware.js";

import {
  uploadResultFile
} from "../middleware/resultUpload.middleware.js";


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(
  authenticate
);


/*
|--------------------------------------------------------------------------
| EXAM DEPARTMENT ONLY
|--------------------------------------------------------------------------
*/

router.use(
  authorize(
    "exam_department"
  )
);


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT CSV
|--------------------------------------------------------------------------
*/

router.post(
  "/upload/csv",
  uploadResultFile,
  uploadCSV
);


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT EXCEL
|--------------------------------------------------------------------------
*/

router.post(
  "/upload/excel",
  uploadResultFile,
  uploadExcel
);


/*
|--------------------------------------------------------------------------
| VALIDATE RESULTS
|--------------------------------------------------------------------------
*/

router.post(
  "/validate/:uploadId",
  validate
);


/*
|--------------------------------------------------------------------------
| PREVIEW RESULTS
|--------------------------------------------------------------------------
*/

router.get(
  "/preview/:uploadId",
  preview
);


/*
|--------------------------------------------------------------------------
| PUBLISH RESULTS
|--------------------------------------------------------------------------
*/

router.post(
  "/publish/:uploadId",
  publish
);


/*
|--------------------------------------------------------------------------
| UPDATE PUBLISHED RESULT
|--------------------------------------------------------------------------
*/

router.put(
  "/published/:resultId",
  updatePublished
);

/*
|--------------------------------------------------------------------------
| DELETE UPLOADED RESULT RECORD
|--------------------------------------------------------------------------
*/

router.delete(
  "/upload/:uploadId",
  deleteUpload
);


export default router;