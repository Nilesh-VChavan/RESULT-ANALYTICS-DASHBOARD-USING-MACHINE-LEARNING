import express from "express";

import {
  getAll,
  getById,
  create,
  update,
  remove
} from "../controllers/department.controller.js";

import {
  authenticate,
  authorize
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);


/*
|--------------------------------------------------------------------------
| GET ALL DEPARTMENTS
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  getAll
);


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT BY ID
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  getById
);


/*
|--------------------------------------------------------------------------
| CREATE DEPARTMENT
|--------------------------------------------------------------------------
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
| UPDATE DEPARTMENT
|--------------------------------------------------------------------------
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
| DELETE DEPARTMENT
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authorize(
    "principal",
    "exam_department"
  ),
  remove
);

export default router;