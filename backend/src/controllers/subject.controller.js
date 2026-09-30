import {
  getAllSubjects,
  getDepartmentSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from "../services/subject.service.js";


/*
|--------------------------------------------------------------------------
| GET ALL SUBJECTS
|--------------------------------------------------------------------------
*/

export async function getAll(
  req,
  res
) {
  try {
    const subjects =
      await getAllSubjects(
        req.user
      );

    return res.status(200).json({
      success: true,
      count: subjects.length,
      subjects
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
| GET DEPARTMENT SUBJECTS
|--------------------------------------------------------------------------
*/

export async function getByDepartment(
  req,
  res
) {
  try {
    const subjects =
      await getDepartmentSubjects(
        req.user,
        req.params.department
      );

    return res.status(200).json({
      success: true,
      count: subjects.length,
      department:
        req.params.department,
      subjects
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
| GET SUBJECT BY ID
|--------------------------------------------------------------------------
*/

export async function getById(
  req,
  res
) {
  try {
    const subject =
      await getSubjectById(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      subject
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
| CREATE SUBJECT
|--------------------------------------------------------------------------
*/

export async function create(
  req,
  res
) {
  try {
    const subject =
      await createSubject(
        req.user,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Subject created successfully",
      subject
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
| UPDATE SUBJECT
|--------------------------------------------------------------------------
*/

export async function update(
  req,
  res
) {
  try {
    const subject =
      await updateSubject(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Subject updated successfully",
      subject
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
| DELETE SUBJECT
|--------------------------------------------------------------------------
*/

export async function remove(
  req,
  res
) {
  try {
    await deleteSubject(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Subject deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}