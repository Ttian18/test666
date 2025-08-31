import express from "express";
import { authenticate } from "../../utils/auth/authUtils.js";
import tokenBlacklistService from "../../services/auth/tokenBlacklistService.js";
import tokenCleanupService from "../../services/auth/tokenCleanupService.js";

const router = express.Router();

// Get blacklist statistics (admin only)
router.get("/stats", authenticate, async (req, res) => {
  try {
    const stats = await tokenBlacklistService.getBlacklistStats();
    const cleanupStatus = tokenCleanupService.getStatus();

    res.status(200).json({
      blacklist: stats,
      cleanup: cleanupStatus,
    });
  } catch (error) {
    console.error("Error getting blacklist stats:", error);
    res.status(500).json({ message: "Server error getting blacklist stats" });
  }
});

// Manually trigger cleanup (admin only)
router.post("/cleanup", authenticate, async (req, res) => {
  try {
    await tokenCleanupService.performCleanup();
    res.status(200).json({ message: "Cleanup completed successfully" });
  } catch (error) {
    console.error("Error during manual cleanup:", error);
    res.status(500).json({ message: "Server error during cleanup" });
  }
});

// Start cleanup service (admin only)
router.post("/cleanup/start", authenticate, async (req, res) => {
  try {
    const { intervalHours = 24 } = req.body;
    tokenCleanupService.startCleanup(intervalHours);
    res.status(200).json({
      message: "Cleanup service started",
      intervalHours: intervalHours,
    });
  } catch (error) {
    console.error("Error starting cleanup service:", error);
    res.status(500).json({ message: "Server error starting cleanup service" });
  }
});

// Stop cleanup service (admin only)
router.post("/cleanup/stop", authenticate, async (req, res) => {
  try {
    tokenCleanupService.stopCleanup();
    res.status(200).json({ message: "Cleanup service stopped" });
  } catch (error) {
    console.error("Error stopping cleanup service:", error);
    res.status(500).json({ message: "Server error stopping cleanup service" });
  }
});

export default router;
