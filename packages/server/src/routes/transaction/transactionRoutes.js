import express from "express";
import { categories as allCategories } from "schema";
import { authenticate } from "../middleware/auth.js";
import * as transactionService from "../../services/transaction/transactionService.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// GET /transactions/stats - Get transaction statistics (authenticated)
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const stats = await transactionService.getTransactionStats(userId, options);

    res.json({ stats });
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({ error: "Failed to fetch transaction stats" });
  }
});

// GET /categories - Get all available categories (public)
router.get("/categories", async (req, res) => {
  try {
    res.json({ categories: allCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /transactions - Get all transactions for a user (authenticated)
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, startDate, endDate, limit, offset } = req.query;

    const options = {
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const transactions = await transactionService.getAllTransactions(
      userId,
      options
    );

    res.json({
      transactions,
      count: transactions.length,
      userId,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET /transactions/:id - Get a specific transaction (authenticated)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    const transaction = await transactionService.getTransactionById(
      userId,
      transactionId
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// POST /transactions - Create a new transaction (authenticated)
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionData = req.body;

    const transaction = await transactionService.createTransaction(
      userId,
      transactionData
    );

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    if (error.message.includes("Missing required field")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// PUT /transactions/:id - Update a transaction (authenticated)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);
    const updateData = req.body;

    if (isNaN(transactionId)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    const transaction = await transactionService.updateTransaction(
      userId,
      transactionId,
      updateData
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// DELETE /transactions/:id - Delete a transaction (authenticated)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    const deleted = await transactionService.deleteTransaction(
      userId,
      transactionId
    );

    if (!deleted) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;
