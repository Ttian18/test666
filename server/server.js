import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import all the route handlers
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";

dotenv.config({ debug: false });
const app = express();

// Middleware to enable CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const HOST = "0.0.0.0"; // Bind to all network interfaces for better network access

// Assign routes to the app
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/transactions", transactionRoutes);
app.use("/insights", insightsRoutes);

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://192.168.50.174:${PORT}`);
});
