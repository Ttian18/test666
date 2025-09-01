import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as dotenv from "dotenv";

// Import configurations
import appConfig from "./config/app.ts";

// Import routes
import authRoutes from "./routes/auth/index.ts";
import restaurantRoutes from "./routes/restaurant/index.ts";
import transactionRoutes from "./routes/transaction/index.ts";
import insightsRoutes from "./routes/insights/index.ts";

// Import services
import tokenCleanupService from "./services/auth/tokenCleanupService.ts";

dotenv.config({ debug: false });

const app = express();
const PORT = appConfig.port;
const HOST = appConfig.host;

// Middleware - Manual CORS setup for learning environment
app.use((req, res, next) => {
  // Allow all origins for learning purposes
  const origin = req.headers.origin || "*";
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-auth-token"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  } else {
    next();
  }
});

// Backup CORS middleware (should not be needed now)
app.use(
  cors({
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
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
    version: "1.0.1",
  });
});

// Assign routes to the app
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/transactions", transactionRoutes);
app.use("/insights", insightsRoutes);

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
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
app.use((req: Request, res: Response) => {
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
