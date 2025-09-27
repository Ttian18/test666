import express from "express";
import transactionRoutes from "./transactionRoutes";
import voucherRoutes from "./voucherRoutes";

const router = express.Router();

// Mount sub-routes - specific routes MUST come before general routes
router.use("/", transactionRoutes);
router.use("/vouchers", voucherRoutes);

export default router;
