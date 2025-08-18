import express from "express";
import jwt from "jsonwebtoken";
import Profile from "../models/Profile.js"; // Assume Profile model exists
import User from "../models/User.js"; // Assume User model exists

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header("x-auth-token");
  
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

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
      "savingsGoals"
    ];
    
    const missingFields = requiredFields.filter(field => !profileData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required profile fields",
        missing: missingFields
      });
    }

    // Create/update profile
    let profile = await Profile.findOne({ userId });
    
    if (!profile) {
      // Create new profile
      profile = new Profile({
        userId,
        ...profileData
      });
    } else {
      // Update existing profile
      Object.keys(profileData).forEach(key => {
        profile[key] = profileData[key];
      });
    }

    await profile.save();

    // Mark user as profile complete
    await User.findByIdAndUpdate(userId, { profileComplete: true });

    res.status(201).json({
      message: "Profile saved successfully",
      profileId: profile._id
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
    
    const profile = await Profile.findOne({ userId })
      .populate("expensePreferences")
      .populate("savingsGoals");
    
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
      updatedAt: profile.updatedAt
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

export default router;