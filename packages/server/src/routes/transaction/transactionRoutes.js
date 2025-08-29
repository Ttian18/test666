import express from "express";
import { PrismaClient } from "@prisma/client";
import { getAllCategories } from "common";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// GET /transactions - Get all transactions for a user
// TODO: This route will be updated in Phase 3 to use authentication middleware
// For now, removing the dangerous user_id query parameter
router.get("/", async (req, res) => {
  try {
    // TEMPORARY: Return empty array until authentication is properly implemented
    // This removes the security vulnerability where any user could access any user's data
    res.json({
      transactions: [],
      message: "Authentication required - will be implemented in Phase 3",
    });
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
