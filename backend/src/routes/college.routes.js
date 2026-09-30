// backend/src/routes/college.routes.js

import { Router } from "express";

import {
  register,
  getAll,
  getById,
  getByCode,
  update,
  activate,
  deactivate
} from "../controllers/college.controller.js";

import {
  registerCollegeSchema,
  updateCollegeSchema,
  validate
} from "../middleware/college.validation.js";

const router = Router();

router.post(
  "/register",
  validate(registerCollegeSchema),
  register
);

router.get("/", getAll);

router.get("/code/:code", getByCode);

router.get("/:id", getById);

router.put(
  "/:id",
  validate(updateCollegeSchema),
  update
);

router.patch("/:id/activate", activate);

router.patch("/:id/deactivate", deactivate);

export default router;