import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { overview } from "../controllers/analytics.controller.js";

const router = Router();
router.use(auth);
router.get("/overview", overview);
export default router;