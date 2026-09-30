import express from "express";

import {
  principalRegister,
  hodRegister,
  studentRegister,
  examDepartmentRegister,

  principalLogin,
  hodLogin,
  studentLogin,
  examDepartmentLogin,

  logout
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| REGISTRATION
|--------------------------------------------------------------------------
*/

router.post(
  "/principal/register",
  principalRegister
);

router.post(
  "/hod/register",
  hodRegister
);

router.post(
  "/student/register",
  studentRegister
);

router.post(
  "/exam-department/register",
  examDepartmentRegister
);

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

router.post(
  "/principal/login",
  principalLogin
);

router.post(
  "/hod/login",
  hodLogin
);

router.post(
  "/student/login",
  studentLogin
);

router.post(
  "/exam-department/login",
  examDepartmentLogin
);

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  authenticate,
  logout
);

export default router;