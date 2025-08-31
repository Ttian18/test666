import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import configurations
import appConfig from "./src/config/app.js";

// Import routes
import authRoutes from "./src/routes/auth/index.js";
import restaurantRoutes from "./src/routes/restaurant/index.js";
import transactionRoutes from "./src/routes/transaction/index.js";
import insightsRoutes from "./src/routes/insights/index.js";

// Import services
import tokenCleanupService from "./src/services/auth/tokenCleanupService.js";

dotenv.config({ debug: false });

const app = express();
const PORT = appConfig.port;
const HOST = appConfig.host;

// Middleware
app.use(
  cors({
    origin: appConfig.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv,
    version: "1.0.0",
  });
});

// Assign routes to the app
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/transactions", transactionRoutes);
app.use("/insights", insightsRoutes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      appConfig.nodeEnv === "development"
        ? error.message
        : "Something went wrong",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment: ${appConfig.nodeEnv}`);

  // Start token cleanup service
  tokenCleanupService.startCleanup(24); // Run cleanup every 24 hours
  console.log(`🔒 Token cleanup service started`);
});
