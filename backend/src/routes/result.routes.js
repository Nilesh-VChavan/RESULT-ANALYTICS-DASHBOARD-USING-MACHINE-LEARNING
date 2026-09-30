import express from "express";

import {
  getAll,
  getByDepartment,
  getByStudent,
  getById,
  create,
  update,
  remove
} from "../controllers/result.controller.js";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware.js";


const router =
  express.Router();


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

router.use(authenticate);


/*
|--------------------------------------------------------------------------
| GET ALL RESULTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAll
);


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT RESULTS
|--------------------------------------------------------------------------
*/

router.get(
  "/department/:department",
  getByDepartment
);


/*
|--------------------------------------------------------------------------
| GET STUDENT RESULTS
|--------------------------------------------------------------------------
*/

router.get(
  "/student/:studentId",
  getByStudent
);


/*
|--------------------------------------------------------------------------
| GET RESULT BY ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getById
);


/*
|--------------------------------------------------------------------------
| CREATE RESULT
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| HOD
|
*/

router.post(
  "/",
  authorize(
    "principal",
    "exam_department",
    "hod"
  ),
  create
);


/*
|--------------------------------------------------------------------------
| UPDATE RESULT
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| HOD
|
*/

router.put(
  "/:id",
  authorize(
    "principal",
    "exam_department",
    "hod"
  ),
  update
);


/*
|--------------------------------------------------------------------------
| DELETE RESULT
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| HOD
|
*/

router.delete(
  "/:id",
  authorize(
    "principal",
    "exam_department",
    "hod"
  ),
  remove
);


export default router;