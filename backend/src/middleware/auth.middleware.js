// backend/src/middleware/auth.middleware.js

import jwt from "jsonwebtoken";
import RevokedToken from "../models/RevokedToken.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required"
      });
    }

    const token = header.substring(7);

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const revoked = await RevokedToken.findOne({
      jti: payload.jti
    });

    if (revoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked"
      });
    }

    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
}