import bcrypt from "bcryptjs";

import College from "../models/College.js";
import { getUserModel } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { getStudentModel } from "../models/Student.js";


export async function registerUser({
  collegeCode,
  name,
  email,
  password,
  role,
  department,
  studentId
}) {
  const college = await College.findOne({
    collegeCode: collegeCode.toUpperCase(),
    status: "active"
  });

  if (!college) {
    throw new Error("Active college not found");
  }

  const User = getUserModel(college.databaseName);

  const existingUser = await User.findOne({
    email: email.toLowerCase()
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  if (
    role === "hod" &&
    !department
  ) {
    throw new Error(
      "Department is required for HOD registration"
    );
  }

  if (
    role === "student" &&
    !studentId
  ) {
    throw new Error(
      "Student ID is required for student registration"
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    department: department || null,
    studentId: studentId || null,
    isActive: true
  });


  /*
  |--------------------------------------------------------------------------
  | CREATE STUDENT RECORD
  |--------------------------------------------------------------------------
  |
  | When a student registers, create the corresponding
  | Student document in the students collection.
  |
  */

  if (role === "student") {

    const Student =
      getStudentModel(
        college.databaseName
      );


    /*
    |--------------------------------------------------------------------------
    | CHECK EXISTING STUDENT
    |--------------------------------------------------------------------------
    */

    const existingStudent =
      await Student.findOne({
        studentId:
          studentId.toUpperCase()
      });


    /*
    |--------------------------------------------------------------------------
    | CREATE STUDENT
    |--------------------------------------------------------------------------
    */

    if (!existingStudent) {

      await Student.create({
        studentId:
          studentId.toUpperCase(),

        name,

        email:
          email.toLowerCase(),

        department,

        academicYear:
          "2026-27",

        semester: 1,

        isActive: true
      });
    }
  }


  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    studentId: user.studentId,
    collegeCode: college.collegeCode
  };
}


export async function loginUser({
  collegeCode,
  email,
  password,
  role
}) {
  const college = await College.findOne({
    collegeCode: collegeCode.toUpperCase(),
    status: "active"
  });

  if (!college) {
    throw new Error("Active college not found");
  }

  const User = getUserModel(
    college.databaseName
  );

  const user = await User.findOne({
    email: email.toLowerCase(),
    role,
    isActive: true
  });

  if (!user) {
    throw new Error(
      "Invalid email, password or role"
    );
  }

  const passwordMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!passwordMatch) {
    throw new Error(
      "Invalid email, password or role"
    );
  }

  const token = generateToken({
    userId: user._id.toString(),
    collegeId: college._id.toString(),
    collegeCode: college.collegeCode,
    databaseName: college.databaseName,
    role: user.role,
    department: user.department,
    studentId: user.studentId
  });

  return {
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId
    },

    college: {
      id: college._id,
      name: college.collegeName,
      code: college.collegeCode
    }
  };
}