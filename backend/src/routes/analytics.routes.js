import express from "express";

import {
  collegeOverview,
  departmentOverview,
  studentPerformance,
  subjectPerformance,
  gradeDistribution,
  passPercentage,
  performanceTrends,
  atRiskStudents
} from "../controllers/analytics.controller.js";

import {
  authenticate
} from "../middleware/auth.middleware.js";


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
| ANALYTICS
|--------------------------------------------------------------------------
*/


/*
| College Overview
|
| Principal
| Exam Department
|
*/

router.get(
  "/college-overview",
  collegeOverview
);


/*
| Department Overview
|
| Principal       -> all departments
| Exam Department -> all departments
| HOD             -> own department
*/

router.get(
  "/department-overview",
  departmentOverview
);


/*
| Student Performance
|
| Principal       -> all students
| Exam Department -> all students
| HOD             -> own department
| Student         -> own performance
*/

router.get(
  "/student-performance",
  studentPerformance
);


/*
| Subject Performance
|
| Principal       -> all
| Exam Department -> all
| HOD             -> own department
| Student         -> own result subjects
*/

router.get(
  "/subject-performance",
  subjectPerformance
);


/*
| Grade Distribution
*/

router.get(
  "/grade-distribution",
  gradeDistribution
);


/*
| Pass Percentage
*/

router.get(
  "/pass-percentage",
  passPercentage
);


/*
| Performance Trends
*/

router.get(
  "/performance-trends",
  performanceTrends
);


/*
| At-Risk Students
|
| Principal
| Exam Department
| HOD
|
| Student cannot access the complete
| at-risk student list.
*/

router.get(
  "/at-risk-students",
  atRiskStudents
);


export default router;