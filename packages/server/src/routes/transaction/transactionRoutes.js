import express from "express";
import { PrismaClient } from "@prisma/client";
import { getAllCategories } from "common";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// GET /transactions - Get all transactions for a user
router.get("/", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id) || 1;

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
router.get("/categories", async (req, res) => {
  try {
    const categories = getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
