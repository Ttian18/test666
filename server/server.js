import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import all the route handlers
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";

dotenv.config({ debug: false });
const app = express();

// Middleware to enable CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const HOST = "192.168.50.174"; // Bind to specific network interface

// Assign routes to the app
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/transactions", transactionRoutes);
app.use("/insights", insightsRoutes);

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});
