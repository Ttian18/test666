import express from "express";
import authRoutes from "./authRoutes.ts";
import profileRoutes from "./profileRoutes.ts";
import blacklistRoutes from "./blacklistRoutes.ts";

const router = express.Router();

// Mount auth routes
router.use("/", authRoutes);

// Mount profile routes
router.use("/profile", profileRoutes);

// Mount blacklist management routes
router.use("/blacklist", blacklistRoutes);

export default router;
