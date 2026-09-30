import express from "express";

import {
  getAll,
  getByDepartment,
  getById,
  create,
  update,
  remove
} from "../controllers/subject.controller.js";

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
| GET ALL SUBJECTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAll
);


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT SUBJECTS
|--------------------------------------------------------------------------
*/

router.get(
  "/department/:department",
  getByDepartment
);


/*
|--------------------------------------------------------------------------
| GET SUBJECT BY ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getById
);


/*
|--------------------------------------------------------------------------
| CREATE SUBJECT
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
| UPDATE SUBJECT
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
| DELETE SUBJECT
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