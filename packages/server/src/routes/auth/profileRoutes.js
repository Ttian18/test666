import express from "express";
import { PrismaClient } from "@prisma/client";
import Profile from "../../models/entities/Profile.js";
import { authenticate } from "../../routes/middleware/auth.js";
import { validateRequired } from "../../utils/validation/validationUtils.js";

const prisma = new PrismaClient();

const router = express.Router();

// Create/Update Profile
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    // Validate required fields
    const requiredFields = [
      "monthlyBudget",
      "monthlyIncome",
      "expensePreferences",
      "savingsGoals",
    ];

    const missingFields = requiredFields.filter((field) => !profileData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required profile fields",
        missing: missingFields,
      });
    }

    // Create/update profile
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Create new profile
      profile = new Profile({
        userId,
        ...profileData,
      });
    } else {
      // Update existing profile
      Object.keys(profileData).forEach((key) => {
        profile[key] = profileData[key];
      });
    }

    await profile.save();

    // Mark user as profile complete using Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { profileComplete: true },
    });

    res.status(201).json({
      message: "Profile saved successfully",
      profileId: profile._id,
    });
  } catch (error) {
    console.error("Profile save error:", error);
    res.status(500).json({ message: "Server error saving profile" });
  }
});

// Get Profile
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove .populate() calls since this is an in-memory stub
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Return safe profile data
    const profileData = {
      monthlyBudget: profile.monthlyBudget,
      monthlyIncome: profile.monthlyIncome,
      expensePreferences: profile.expensePreferences,
      savingsGoals: profile.savingsGoals,
      lifestylePreferences: profile.lifestylePreferences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

export default router;
