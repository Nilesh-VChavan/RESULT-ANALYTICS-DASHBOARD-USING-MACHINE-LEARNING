import { Router } from "express";
import multer from "multer";
import { auth, allow } from "../middleware/auth.js";

const router = Router();
const upload = multer({ dest: "src/uploads/" });
router.post("/", auth, allow("principal", "hod", "faculty"), upload.single("file"), (req, res) =>
  res.json({ success: true, message: "File uploaded", file: req.file?.filename })
);
export default router;