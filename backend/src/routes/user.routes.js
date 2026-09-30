import express from "express";

import {
  getAll,
  getById,
  create,
  update,
  remove,
  password
} from "../controllers/user.controller.js";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);


/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
|
| Principal       -> all users
| Exam Department -> all users
| HOD             -> own department
| Student         -> own record
|
*/

router.get(
  "/",
  getAll
);


/*
|--------------------------------------------------------------------------
| GET USER BY ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getById
);


/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
|
| Principal + Exam Department
|
*/

router.post(
  "/",
  authorize(
    "principal",
    "exam_department"
  ),
  create
);


/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
|
| Principal + Exam Department
|
*/

router.put(
  "/:id",
  authorize(
    "principal",
    "exam_department"
  ),
  update
);


/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
|
| Principal + Exam Department
|
*/

router.delete(
  "/:id",
  authorize(
    "principal",
    "exam_department"
  ),
  remove
);


/*
|--------------------------------------------------------------------------
| CHANGE OWN PASSWORD
|--------------------------------------------------------------------------
|
| All authenticated users
|
*/

router.patch(
  "/change-password",
  password
);

export default router;