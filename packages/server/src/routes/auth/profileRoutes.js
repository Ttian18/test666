import express from "express";
import { authenticate } from "../middleware/auth.js";
import * as profileService from "../../services/auth/profileService.js";

const router = express.Router();

// Create/Update Profile
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const profileData = req.body;

    const result = await profileService.createOrUpdateProfile(
      userId,
      profileData
    );

    res.status(201).json({
      message: "Profile saved successfully",
      profileId: result.profileId,
      profileComplete: result.profileComplete,
    });
  } catch (error) {
    console.error("Profile save error:", error);
    if (error.message.includes("Missing required profile fields")) {
      const missingFields = error.message.split(": ")[1].split(", ");
      return res.status(400).json({
        message: "Missing required profile fields",
        missing: missingFields,
      });
    }
    res.status(500).json({ message: "Server error saving profile" });
  }
});

// Get Profile
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const profileData = await profileService.getUserProfile(userId);

    if (!profileData) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

export default router;
