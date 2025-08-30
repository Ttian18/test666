import { PrismaClient } from "@prisma/client";
import Profile from "../../models/entities/Profile.js";

const prisma = new PrismaClient();

/**
 * Create or update a user profile
 * @param {number} userId - User ID (integer from Prisma User model)
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<Object>} Profile creation/update result
 */
export const createOrUpdateProfile = async (userId, profileData) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!profileData || typeof profileData !== "object") {
    throw new Error("Profile data is required");
  }

  // Validate required fields
  const requiredFields = [
    "monthlyBudget",
    "monthlyIncome",
    "expensePreferences",
    "savingsGoals",
  ];

  const missingFields = requiredFields.filter((field) => !profileData[field]);
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required profile fields: ${missingFields.join(", ")}`
    );
  }

  try {
    // Create/update profile using the existing Profile entity
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

    return {
      profileId: profile._id,
      profileComplete: true,
    };
  } catch (error) {
    console.error("Profile service error:", error);
    throw new Error(`Failed to save profile: ${error.message}`);
  }
};

/**
 * Get user profile by user ID
 * @param {number} userId - User ID (integer from Prisma User model)
 * @returns {Promise<Object|null>} Profile data or null if not found
 */
export const getUserProfile = async (userId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return null;
    }

    // Return safe profile data
    return {
      monthlyBudget: profile.monthlyBudget,
      monthlyIncome: profile.monthlyIncome,
      expensePreferences: profile.expensePreferences,
      savingsGoals: profile.savingsGoals,
      lifestylePreferences: profile.lifestylePreferences,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }
};

/**
 * Get user profile for personalization (includes user data)
 * @param {number} userId - User ID (integer from Prisma User model)
 * @returns {Promise<Object|null>} User data with profile for personalization
 */
export const getUserDataForPersonalization = async (userId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  try {
    // Get user data from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return null;
    }

    // Get profile data
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
      };
    }

    return {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      monthlyBudget: profile.monthlyBudget,
      monthlyIncome: profile.monthlyIncome,
      expensePreferences: profile.expensePreferences,
      savingsGoals: profile.savingsGoals,
      lifestylePreferences: profile.lifestylePreferences,
    };
  } catch (error) {
    console.error("User data fetch error:", error);
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
};

/**
 * Check if user exists and is valid
 * @param {number} userId - User ID to validate
 * @returns {Promise<Object|null>} User data if valid, null if not found
 */
export const validateUser = async (userId) => {
  if (!userId || typeof userId !== "number") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    return user;
  } catch (error) {
    console.error("User validation error:", error);
    return null;
  }
};
