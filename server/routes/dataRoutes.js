import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /data - Get all seeded data
router.get("/", async (req, res) => {
  try {
    // Fetch all data with relations
    const [users, restaurants, transactions, menuItems, recommendations] =
      await Promise.all([
        prisma.user.findMany({
          include: {
            profile: true,
            transactions: true,
            recommendations: {
              include: {
                restaurant: true,
              },
            },
          },
        }),
        prisma.restaurant.findMany({
          include: {
            menuItems: true,
            recommendations: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.transaction.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.menuItem.findMany({
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        prisma.recommendation.findMany({
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            restaurant: true,
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        users,
        restaurants,
        transactions,
        menuItems,
        recommendations,
      },
      summary: {
        totalUsers: users.length,
        totalRestaurants: restaurants.length,
        totalTransactions: transactions.length,
        totalMenuItems: menuItems.length,
        totalRecommendations: recommendations.length,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch data",
      message: error.message,
    });
  }
});

export default router;
