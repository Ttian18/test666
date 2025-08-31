import express from "express";
import transactionRoutes from "./transactionRoutes.js";
import voucherRoutes from "./voucherRoutes.js";

const router = express.Router();

// Mount sub-routes - specific routes MUST come before general routes
router.use("/vouchers", voucherRoutes);
router.use("/", transactionRoutes);

export default router;
