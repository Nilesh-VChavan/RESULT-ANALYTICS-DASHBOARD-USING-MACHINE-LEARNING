import express from "express";

import {
  getAll,
  getByDepartment,
  getById,
  create,
  update,
  remove
} from "../controllers/student.controller.js";

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
| GET ALL STUDENTS
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| HOD
| Student
|
*/

router.get(
  "/",
  getAll
);


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT STUDENTS
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| HOD
|
*/

router.get(
  "/department/:department",
  getByDepartment
);


/*
|--------------------------------------------------------------------------
| GET STUDENT BY ID
|--------------------------------------------------------------------------
|
| Access is checked inside service.
|
*/

router.get(
  "/:id",
  getById
);


/*
|--------------------------------------------------------------------------
| CREATE STUDENT
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| hod
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
| UPDATE STUDENT
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| hod
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
| DELETE STUDENT
|--------------------------------------------------------------------------
|
| Principal
| Exam Department
| hod
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