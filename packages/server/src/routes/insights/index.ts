import express from "express";
import insightsRoutes from "./insightsRoutes.js";

const router = express.Router();

// Mount insights routes
router.use("/", insightsRoutes);

export default router;
