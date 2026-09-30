import {
  getCollegeOverview,
  getDepartmentOverview,
  getStudentPerformance,
  getSubjectPerformance,
  getGradeDistribution,
  getPassPercentage,
  getPerformanceTrends,
  getAtRiskStudents
} from "../services/analytics.service.js";


/*
|--------------------------------------------------------------------------
| COLLEGE OVERVIEW
|--------------------------------------------------------------------------
*/

export async function collegeOverview(
  req,
  res
) {
  try {
    const data =
      await getCollegeOverview(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "College overview fetched successfully",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| DEPARTMENT OVERVIEW
|--------------------------------------------------------------------------
*/

export async function departmentOverview(
  req,
  res
) {
  try {
    const data =
      await getDepartmentOverview(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Department overview fetched successfully",
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| STUDENT PERFORMANCE
|--------------------------------------------------------------------------
*/

export async function studentPerformance(
  req,
  res
) {
  try {
    const data =
      await getStudentPerformance(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Student performance fetched successfully",
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| SUBJECT PERFORMANCE
|--------------------------------------------------------------------------
*/

export async function subjectPerformance(
  req,
  res
) {
  try {
    const data =
      await getSubjectPerformance(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Subject performance fetched successfully",
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| GRADE DISTRIBUTION
|--------------------------------------------------------------------------
*/

export async function gradeDistribution(
  req,
  res
) {
  try {
    const data =
      await getGradeDistribution(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Grade distribution fetched successfully",
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| PASS PERCENTAGE
|--------------------------------------------------------------------------
*/

export async function passPercentage(
  req,
  res
) {
  try {
    const data =
      await getPassPercentage(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Pass percentage fetched successfully",
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| PERFORMANCE TRENDS
|--------------------------------------------------------------------------
*/

export async function performanceTrends(
  req,
  res
) {
  try {
    const data =
      await getPerformanceTrends(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "Performance trends fetched successfully",
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| AT-RISK STUDENTS
|--------------------------------------------------------------------------
*/

export async function atRiskStudents(
  req,
  res
) {
  try {
    const data =
      await getAtRiskStudents(
        req.user,
        req.query
      );

    return res.status(200).json({
      success: true,
      message:
        "At-risk students fetched successfully",
      count: data.length,
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}