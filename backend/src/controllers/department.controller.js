import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from "../services/department.service.js";


export async function getAll(
  req,
  res
) {
  try {
    const departments =
      await getAllDepartments(
        req.user
      );

    return res.status(200).json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


export async function getById(
  req,
  res
) {
  try {
    const department =
      await getDepartmentById(
        req.user,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      department
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


export async function create(
  req,
  res
) {
  try {
    const department =
      await createDepartment(
        req.user,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Department created successfully",
      department
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


export async function update(
  req,
  res
) {
  try {
    const department =
      await updateDepartment(
        req.user,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Department updated successfully",
      department
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


export async function remove(
  req,
  res
) {
  try {
    await deleteDepartment(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Department deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}