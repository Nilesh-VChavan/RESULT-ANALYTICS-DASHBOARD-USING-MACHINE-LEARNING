import express from "express";

import {
  profile,
  updateProfile,
  settings
} from "../controllers/collegeProfile.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Get College Profile
router.get(
  "/profile",
  profile
);

// Update College Profile
router.put(
  "/profile",
  updateProfile
);

// Get College Settings
router.get(
  "/settings",
  settings
);

export default router;