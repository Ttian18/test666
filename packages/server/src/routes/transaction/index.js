import express from "express";
import transactionRoutes from "./transactionRoutes.js";
import voucherRoutes from "./voucherRoutes.js";
import insightsRoutes from "./insightsRoutes.js";

const router = express.Router();

// Mount sub-routes
router.use("/", transactionRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/insights", insightsRoutes);

export default router;
