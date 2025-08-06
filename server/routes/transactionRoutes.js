import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /transactions - Return all transactions in a list
router.get("/", async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Placeholder for POST /transactions/upload
router.post("/upload", (req, res) => {
  res
    .status(200)
    .json({ message: "Endpoint for AI voucher/receipt recognition" });
});

// Placeholder for PUT /transactions/:id
router.put("/:id", (req, res) => {
  res.status(200).json({
    message: `Endpoint to update transaction with id ${req.params.id}`,
  });
});

export default router;
