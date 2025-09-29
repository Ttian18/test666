import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { categories } from "schema";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// GET /transactions - Get all transactions for a user
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.user_id as string) || 1;

    const transactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { date: "desc" },
    });

    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET /categories - Get all available categories
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// POST /bulk - Create multiple transactions
router.post("/bulk", async (req: Request, res: Response) => {
  try {
    const { transactions, user_id } = req.body;
    const userId = parseInt(user_id) || 1;

    console.log("🔍 Bulk transactions request:", { transactions, user_id });

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: "Transactions array is required" });
    }

    const createdTransactions = [];
    const errors = [];

    for (const transactionData of transactions) {
      try {
        const transaction = await prisma.transaction.create({
          data: {
            user_id: userId,
            date: new Date(transactionData.date) || new Date(),
            amount: parseFloat(transactionData.amount),
            category: transactionData.category || "Other",
            merchant: transactionData.merchant || "Manual Entry",
            source: transactionData.source || "manual",
            receipt_img: null,
            merchant_category: transactionData.category || "Other",
          },
        });
        createdTransactions.push(transaction);
      } catch (error) {
        console.error("Error creating transaction:", error);
        errors.push({
          transaction: transactionData,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    res.status(201).json({
      message: `Created ${createdTransactions.length} transactions`,
      transactions: createdTransactions,
      errors,
      successful: createdTransactions.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error("Error in bulk transaction creation:", error);
    res.status(500).json({ error: "Failed to create bulk transactions" });
  }
});

export default router;
