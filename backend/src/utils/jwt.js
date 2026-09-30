// backend/src/utils/jwt.js

import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export function generateToken({
  userId,
  collegeId,
  collegeCode,
  databaseName,
  role,
  department,
  studentId
}) {
  return jwt.sign(
    {
      sub: userId,
      jti: randomUUID(),

      collegeId,
      collegeCode,
      databaseName,

      role,
      department: department || null,
      studentId: studentId || null
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
}