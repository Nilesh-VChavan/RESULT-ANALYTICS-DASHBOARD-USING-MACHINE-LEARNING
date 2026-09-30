import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} from "../services/user.service.js";


export async function getAll(req, res) {
  try {
    const users = await getAllUsers(
      req.user
    );

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


export async function getById(req, res) {
  try {
    const user = await getUserById(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message
    });
  }
}


export async function create(req, res) {
  try {
    const user = await createUser(
      req.user,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


export async function update(req, res) {
  try {
    const user = await updateUser(
      req.user,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


export async function remove(req, res) {
  try {
    await deleteUser(
      req.user,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}


export async function password(req, res) {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;

    await changePassword(
      req.user,
      currentPassword,
      newPassword
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}