import express from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";

const router = express.Router();

// Mount auth routes
router.use("/", authRoutes);

// Mount profile routes
router.use("/profile", profileRoutes);

export default router;
