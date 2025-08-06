import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import all the route handlers
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";

dotenv.config();
const app = express();

// Middleware to enable CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Assign routes to the app
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/transactions", transactionRoutes);
app.use("/insights", insightsRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
