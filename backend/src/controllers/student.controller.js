import {
  getAllStudents,
  getDepartmentStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} from "../services/student.service.js";


/*
|--------------------------------------------------------------------------
| GET ALL STUDENTS
|--------------------------------------------------------------------------
*/

export async function getAll(
  req,
  res
) {
  try {
    const students =
      await getAllStudents(
        req.user
      );

    return res.status(200).json({
      success: true,
      count: students.length,
      students
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
| GET DEPARTMENT STUDENTS
|--------------------------------------------------------------------------
*/

export async function getByDepartment(
  req,
  res
) {
  try {
    const students =
      await getDepartmentStudents(
        req.user,
        req.params.department
      );

    return res.status(200).json({
      success: true,
      count: students.length,
      department:
        req.params.department,
      students
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
| GET STUDENT BY ID
|--------------------------------------------------------------------------
*/

export async function getById(
  req,
  res
) {
  try {
    const student =
      await getStudentById(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      student
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
| CREATE STUDENT
|--------------------------------------------------------------------------
*/

export async function create(
  req,
  res
) {
  try {
    const student =
      await createStudent(
        req.user,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Student created successfully",
      student
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
| UPDATE STUDENT
|--------------------------------------------------------------------------
*/

export async function update(
  req,
  res
) {
  try {
    const student =
      await updateStudent(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Student updated successfully",
      student
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
| DELETE STUDENT
|--------------------------------------------------------------------------
*/

export async function remove(
  req,
  res
) {
  try {
    await deleteStudent(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Student deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}