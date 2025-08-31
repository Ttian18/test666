import express from "express";
import type { Request } from "express";
import { authenticate } from "../middleware/auth.ts";
import * as profileService from "../../services/auth/profileService.ts";

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

const router = express.Router();

// Create/Update Profile
router.post("/", authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("Missing required profile fields")) {
      const missingFields = errorMessage.split(": ")[1].split(", ");
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
    const userId = (req as AuthenticatedRequest).user.id;

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
