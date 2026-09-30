import {
  registerUser,
  loginUser
} from "../services/auth.service.js";

export async function register(req, res) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

export async function principalRegister(req, res) {
  req.body.role = "principal";
  return register(req, res);
}

export async function hodRegister(req, res) {
  req.body.role = "hod";
  return register(req, res);
}

export async function studentRegister(req, res) {
  req.body.role = "student";
  return register(req, res);
}

export async function examDepartmentRegister(req, res) {
  req.body.role = "exam_department";
  return register(req, res);
}

export async function principalLogin(req, res) {
  try {
    const result = await loginUser({
      ...req.body,
      role: "principal"
    });

    return res.status(200).json({
      success: true,
      message: "Principal login successful",
      ...result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
}

export async function hodLogin(req, res) {
  try {
    const result = await loginUser({
      ...req.body,
      role: "hod"
    });

    return res.status(200).json({
      success: true,
      message: "HOD login successful",
      ...result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
}

export async function studentLogin(req, res) {
  try {
    const result = await loginUser({
      ...req.body,
      role: "student"
    });

    return res.status(200).json({
      success: true,
      message: "Student login successful",
      ...result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
}

export async function examDepartmentLogin(req, res) {
  try {
    const result = await loginUser({
      ...req.body,
      role: "exam_department"
    });

    return res.status(200).json({
      success: true,
      message: "Exam Department login successful",
      ...result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
}

export async function logout(req, res) {
  try {
    const { revokeToken } = await import(
      "../models/RevokedToken.js"
    );

    await revokeToken(req.token);

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}