import express from "express";
import { authenticate } from "../middleware/auth.ts";
import * as voucherService from "../../services/transaction/voucherService.ts";
import {
  uploadExtended,
  normalizeImageForOpenAI,
} from "../../utils/upload/uploadUtils.ts";
import { validateFile } from "../../utils/validation/validationUtils.ts";

// Phase 3: Secured voucher routes with authentication middleware
// All routes now require valid JWT token and use service layer for user isolation

const router = express.Router();

// POST /vouchers/upload - Upload and process a single receipt (authenticated)
router.post(
  "/upload",
  authenticate,
  uploadExtended.single("receipt"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate file
      try {
        validateFile(req.file, "receipt");
      } catch (validationError) {
        return res.status(400).json({ error: validationError.message });
      }

      // Process voucher using service
      const result = await voucherService.processVoucher(userId, {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      });

      res.status(201).json({
        message: "Receipt uploaded and processed successfully",
        voucher: result.voucher,
        transaction: result.transaction,
        parsedData: result.parsedData,
      });
    } catch (error) {
      console.error("Error processing voucher:", error);
      if (error.message.includes("Failed to extract required information")) {
        return res.status(422).json({
          error: "Failed to extract required information from receipt",
          details: error.message,
        });
      }
      res.status(500).json({
        error: "Failed to process receipt",
        details: error.message,
      });
    }
  }
);

// POST /vouchers/bulk-upload - Upload and process multiple receipts (authenticated)
router.post(
  "/bulk-upload",
  authenticate,
  uploadExtended.array("receipts", 10),
  async (req, res) => {
    try {
      const userId = req.user.id;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      // Convert files to the format expected by service
      const filesData = req.files.map((file) => ({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      }));

      // Process vouchers using service
      const result = await voucherService.processBulkVouchers(
        userId,
        filesData
      );

      res.status(201).json({
        message: `Processed ${result.successful} receipts successfully, ${result.failed} failed`,
        summary: {
          successful: result.successful,
          failed: result.failed,
          total: filesData.length,
        },
        results: result.results,
        errors: result.errors,
      });
    } catch (error) {
      console.error("Error processing bulk vouchers:", error);
      res.status(500).json({
        error: "Failed to process receipts",
        details: error.message,
      });
    }
  }
);

// GET /vouchers/stats - Get voucher statistics (authenticated)
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const stats = await voucherService.getVoucherStats(userId, options);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching voucher stats:", error);
    res.status(500).json({
      error: "Failed to fetch voucher stats",
      details: error.message,
    });
  }
});

// GET /vouchers - Get all vouchers for authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset, startDate, endDate } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const vouchers = await voucherService.getUserVouchers(userId, options);

    res.json({
      vouchers,
      count: vouchers.length,
      userId,
    });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    res.status(500).json({
      error: "Failed to fetch vouchers",
      details: error.message,
    });
  }
});

// GET /vouchers/:id - Get a specific voucher (authenticated)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const voucherId = parseInt(req.params.id);

    if (isNaN(voucherId)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const voucher = await voucherService.getVoucherById(userId, voucherId);

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.json({ voucher });
  } catch (error) {
    console.error("Error fetching voucher:", error);
    res.status(500).json({
      error: "Failed to fetch voucher",
      details: error.message,
    });
  }
});

// PUT /vouchers/:id - Update voucher parsed data (authenticated)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const voucherId = parseInt(req.params.id);
    const { parsed_data } = req.body;

    if (isNaN(voucherId)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    if (!parsed_data) {
      return res.status(400).json({ error: "parsed_data is required" });
    }

    const updatedVoucher = await voucherService.updateVoucher(
      userId,
      voucherId,
      parsed_data
    );

    if (!updatedVoucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.json({
      message: "Voucher updated successfully",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("Error updating voucher:", error);
    res.status(500).json({
      error: "Failed to update voucher",
      details: error.message,
    });
  }
});

// POST /vouchers/:id/confirm - Confirm voucher and create transaction (authenticated)
router.post("/:id/confirm", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const voucherId = parseInt(req.params.id);

    if (isNaN(voucherId)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const transaction = await voucherService.confirmVoucher(userId, voucherId);

    if (!transaction) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error confirming voucher:", error);
    if (error.message.includes("already exists")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({
      error: "Failed to confirm voucher",
      details: error.message,
    });
  }
});

// DELETE /vouchers/:id - Delete voucher (authenticated)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const voucherId = parseInt(req.params.id);

    if (isNaN(voucherId)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const deleted = await voucherService.deleteVoucher(userId, voucherId);

    if (!deleted) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.json({ message: "Voucher deleted successfully" });
  } catch (error) {
    console.error("Error deleting voucher:", error);
    res.status(500).json({
      error: "Failed to delete voucher",
      details: error.message,
    });
  }
});

export default router;
