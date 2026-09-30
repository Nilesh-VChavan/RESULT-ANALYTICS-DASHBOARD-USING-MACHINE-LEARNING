// backend/src/middleware/college.validation.js

import Joi from "joi";

export const registerCollegeSchema = Joi.object({
  collegeName: Joi.string().trim().min(3).max(150).required(),

  collegeCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_-]+$/)
    .min(2)
    .max(30)
    .required(),

  adminEmail: Joi.string().email().required(),

  address: Joi.string().trim().max(300).allow(""),

  city: Joi.string().trim().max(100).allow(""),

  state: Joi.string().trim().max(100).allow(""),

  pincode: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .allow("")
});

export const updateCollegeSchema = Joi.object({
  collegeName: Joi.string().trim().min(3).max(150),

  adminEmail: Joi.string().email(),

  address: Joi.string().trim().max(300).allow(""),

  city: Joi.string().trim().max(100).allow(""),

  state: Joi.string().trim().max(100).allow(""),

  pincode: Joi.string()
    .trim()
    .pattern(/^[0-9]{6}$/)
    .allow("")
}).min(1);

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((item) => item.message)
      });
    }

    req.body = value;
    next();
  };
}