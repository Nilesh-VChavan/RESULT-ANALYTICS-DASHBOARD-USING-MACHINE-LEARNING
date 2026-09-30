// controllers/health.controller.js

export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    service: "result-analytics-dashboard",
    database: "connected",
    timestamp: new Date().toISOString()
  });
};