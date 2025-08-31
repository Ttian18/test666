import express from "express";
import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import blacklistRoutes from "./blacklistRoutes.js";

const router = express.Router();

// Mount auth routes
router.use("/", authRoutes);

// Mount profile routes
router.use("/profile", profileRoutes);

// Mount blacklist management routes
router.use("/blacklist", blacklistRoutes);

export default router;
