import bcrypt from "bcryptjs";

import College from "../models/College.js";
import { getUserModel } from "../models/User.js";


function removePassword(user) {
  const data = user.toObject();

  delete data.password;
  delete data.__v;

  return data;
}


async function getCollegeFromUser(reqUser) {
  const college = await College.findOne({
    _id: reqUser.collegeId,
    status: "active"
  });

  if (!college) {
    throw new Error("Active college not found");
  }

  return college;
}


export async function getAllUsers(reqUser) {
  const college = await getCollegeFromUser(reqUser);

  const User = getUserModel(
    college.databaseName
  );

  let query = {};

  /*
   * Principal and Exam Department
   * can see all users.
   *
   * HOD can see users from
   * their department only.
   *
   * Student can see only himself.
   */

  if (reqUser.role === "hod") {
    query = {
      department: reqUser.department
    };
  }

  if (reqUser.role === "student") {
    query = {
      _id: reqUser.sub
    };
  }

  const users = await User.find(query)
    .select("-password -__v")
    .sort({ createdAt: -1 });

  return users;
}


export async function getUserById(
  reqUser,
  userId
) {
  const college = await getCollegeFromUser(reqUser);

  const User = getUserModel(
    college.databaseName
  );

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  /*
   * Student can access only own record.
   */

  if (
    reqUser.role === "student" &&
    user._id.toString() !== reqUser.sub
  ) {
    throw new Error("Access denied");
  }

  /*
   * HOD can access only users
   * from own department.
   */

  if (
    reqUser.role === "hod" &&
    user.department !== reqUser.department
  ) {
    throw new Error("Access denied");
  }

  return removePassword(user);
}


export async function createUser(
  reqUser,
  data
) {
  const college = await getCollegeFromUser(reqUser);

  const User = getUserModel(
    college.databaseName
  );

  const {
    name,
    email,
    password,
    role,
    department,
    studentId
  } = data;

  if (!name || !email || !password || !role) {
    throw new Error(
      "Name, email, password and role are required"
    );
  }

  const allowedRoles = [
    "principal",
    "hod",
    "student",
    "exam_department"
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid user role");
  }

  /*
   * Only Principal and Exam Department
   * can create users through User Management.
   */

  if (
    !["principal", "exam_department"].includes(
      reqUser.role
    )
  ) {
    throw new Error("Access denied");
  }

  if (
    role === "hod" &&
    !department
  ) {
    throw new Error(
      "Department is required for HOD"
    );
  }

  if (
    role === "student" &&
    !studentId
  ) {
    throw new Error(
      "Student ID is required for student"
    );
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase().trim()
  });

  if (existingUser) {
    throw new Error(
      "Email already registered"
    );
  }

  const hashedPassword =
    await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role,
    department: department || null,
    studentId: studentId || null,
    isActive: true
  });

  return removePassword(user);
}


export async function updateUser(
  reqUser,
  userId,
  data
) {
  const college = await getCollegeFromUser(reqUser);

  const User = getUserModel(
    college.databaseName
  );

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  /*
   * Student cannot update another user.
   */

  if (
    reqUser.role === "student" &&
    user._id.toString() !== reqUser.sub
  ) {
    throw new Error("Access denied");
  }

  /*
   * HOD can only access own department.
   */

  if (
    reqUser.role === "hod" &&
    user.department !== reqUser.department
  ) {
    throw new Error("Access denied");
  }

  /*
   * Only Principal and Exam Department
   * can update users through management.
   */

  if (
    !["principal", "exam_department"].includes(
      reqUser.role
    )
  ) {
    throw new Error("Access denied");
  }

  const allowedFields = [
    "name",
    "email",
    "role",
    "department",
    "studentId",
    "isActive"
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      user[field] = data[field];
    }
  }

  if (data.email) {
    user.email =
      data.email.toLowerCase().trim();

    const duplicate = await User.findOne({
      email: user.email,
      _id: { $ne: userId }
    });

    if (duplicate) {
      throw new Error(
        "Email already registered"
      );
    }
  }

  if (
    user.role === "hod" &&
    !user.department
  ) {
    throw new Error(
      "Department is required for HOD"
    );
  }

  if (
    user.role === "student" &&
    !user.studentId
  ) {
    throw new Error(
      "Student ID is required for student"
    );
  }

  await user.save();

  return removePassword(user);
}


export async function deleteUser(
  reqUser,
  userId
) {
  const college = await getCollegeFromUser(reqUser);

  const User = getUserModel(
    college.databaseName
  );

  if (
    !["principal", "exam_department"].includes(
      reqUser.role
    )
  ) {
    throw new Error("Access denied");
  }

  if (reqUser.sub === userId) {
    throw new Error(
      "You cannot delete your own account"
    );
  }

  const user = await User.findByIdAndDelete(
    userId
  );

  if (!user) {
    throw new Error("User not found");
  }

  return true;
}


export async function changePassword(
  reqUser,
  currentPassword,
  newPassword
) {
  const college = await getCollegeFromUser(reqUser);

  const User = getUserModel(
    college.databaseName
  );

  const user = await User.findById(
    reqUser.sub
  );

  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch =
    await bcrypt.compare(
      currentPassword,
      user.password
    );

  if (!passwordMatch) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error(
      "New password must be at least 6 characters"
    );
  }

  user.password =
    await bcrypt.hash(newPassword, 12);

  await user.save();

  return true;
}