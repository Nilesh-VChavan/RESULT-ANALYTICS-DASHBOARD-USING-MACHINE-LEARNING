// backend/src/app.js

import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import collegeRoutes from "./routes/college.routes.js";
import authRoutes from "./routes/auth.routes.js";
import collegeProfileRoutes from "./routes/collegeProfile.routes.js";
import userRoutes from "./routes/user.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import studentRoutes from "./routes/student.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import resultRoutes from "./routes/result.routes.js";
import examDepartmentRoutes from "./routes/examDepartment.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/college", collegeProfileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments",departmentRoutes);
app.use("/api/students",studentRoutes);
app.use("/api/subjects",subjectRoutes);
app.use("/api/results",resultRoutes);
app.use("/api/exam-department",examDepartmentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

export default app;