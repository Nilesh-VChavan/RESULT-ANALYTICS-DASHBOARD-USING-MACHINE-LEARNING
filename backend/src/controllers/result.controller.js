import {
  getAllResults,
  getDepartmentResults,
  getStudentResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult
} from "../services/result.service.js";


/*
|--------------------------------------------------------------------------
| GET ALL RESULTS
|--------------------------------------------------------------------------
*/

export async function getAll(
  req,
  res
) {
  try {
    const results =
      await getAllResults(
        req.user
      );

    return res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET DEPARTMENT RESULTS
|--------------------------------------------------------------------------
*/

export async function getByDepartment(
  req,
  res
) {
  try {
    const results =
      await getDepartmentResults(
        req.user,
        req.params.department
      );

    return res.status(200).json({
      success: true,
      count: results.length,
      department:
        req.params.department,
      results
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET STUDENT RESULTS
|--------------------------------------------------------------------------
*/

export async function getByStudent(
  req,
  res
) {
  try {
    const results =
      await getStudentResults(
        req.user,
        req.params.studentId
      );

    return res.status(200).json({
      success: true,
      count: results.length,
      studentId:
        req.params.studentId,
      results
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET RESULT BY ID
|--------------------------------------------------------------------------
*/

export async function getById(
  req,
  res
) {
  try {
    const result =
      await getResultById(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


/*
|--------------------------------------------------------------------------
| CREATE RESULT
|--------------------------------------------------------------------------
*/

export async function create(
  req,
  res
) {
  try {
    const result =
      await createResult(
        req.user,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Result created successfully",
      result
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
| UPDATE RESULT
|--------------------------------------------------------------------------
*/

export async function update(
  req,
  res
) {
  try {
    const result =
      await updateResult(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Result updated successfully",
      result
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
| DELETE RESULT
|--------------------------------------------------------------------------
*/

export async function remove(
  req,
  res
) {
  try {
    await deleteResult(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Result deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}