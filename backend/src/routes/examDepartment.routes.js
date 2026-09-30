import express from "express";

import {
  upload,
  validate,
  preview,
  publish,
  updatePublished
} from "../controllers/examDepartment.controller.js";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware.js";

import uploadMiddleware from "../middleware/upload.middleware.js";


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
| UPLOAD RESULT CSV
|--------------------------------------------------------------------------
*/

router.post(
  "/upload/csv",
  authorize(
    "exam_department"
  ),
  uploadMiddleware.single(
    "file"
  ),
  upload
);


/*
|--------------------------------------------------------------------------
| UPLOAD RESULT EXCEL
|--------------------------------------------------------------------------
*/

router.post(
  "/upload/excel",
  authorize(
    "exam_department"
  ),
  uploadMiddleware.single(
    "file"
  ),
  upload
);


/*
|--------------------------------------------------------------------------
| VALIDATE RESULTS
|--------------------------------------------------------------------------
*/

router.post(
  "/validate/:id",
  authorize(
    "exam_department"
  ),
  validate
);


/*
|--------------------------------------------------------------------------
| PREVIEW RESULTS
|--------------------------------------------------------------------------
*/

router.get(
  "/preview/:id",
  authorize(
    "exam_department"
  ),
  preview
);


/*
|--------------------------------------------------------------------------
| PUBLISH RESULTS
|--------------------------------------------------------------------------
*/

router.post(
  "/publish/:id",
  authorize(
    "exam_department"
  ),
  publish
);


/*
|--------------------------------------------------------------------------
| UPDATE PUBLISHED RESULT
|--------------------------------------------------------------------------
*/

router.put(
  "/published/:id",
  authorize(
    "exam_department"
  ),
  updatePublished
);


export default router;