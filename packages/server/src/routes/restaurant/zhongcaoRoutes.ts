import express from "express";
import type { Request, Response } from "express";
import {
  processImageForUser,
  getAllZhongcaoResults,
  getZhongcaoResultById,
  updateZhongcaoResult,
  deleteZhongcaoResult,
} from "../../services/restaurant/zhongcao/index.ts";
import { uploadImage } from "../../utils/upload/uploadUtils.ts";
import { validateFile } from "../../utils/validation/validationUtils.ts";
import { authenticate } from "../middleware/auth.ts";

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /social-upload - Analyze restaurant images from social media
router.post("/social-upload", uploadImage.single("image"), async (req, res) => {
  try {
    const userId = (req as unknown as AuthenticatedRequest).user.id; // Guaranteed to exist after authentication
    validateFile(req.file, "image");

    const result = await processImageForUser(userId, req.file);

    res.status(201).json({
      message: "Image processed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: "Failed to process image",
      details: errorMessage,
    });
  }
});

// GET /zhongcao - list all for authenticated user
router.get("/", async (req, res) => {
  try {
    const userId = (req as unknown as AuthenticatedRequest).user.id; // Guaranteed to exist after authentication
    console.log(`Fetching zhongcao results for user ${userId}`);

    const results = await getAllZhongcaoResults(userId);
    res.json(results);
  } catch (error) {
    console.error("Error fetching zhongcao results:", error);
    res.status(500).json({
      error: "Failed to fetch results",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /zhongcao/:id - get one for authenticated user
router.get("/:id", async (req, res) => {
  try {
    const userId = (req as unknown as AuthenticatedRequest).user.id; // Guaranteed to exist after authentication
    const id = Number(req.params.id);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const result = await getZhongcaoResultById(userId, id);
    if (!result) {
      return res
        .status(404)
        .json({ error: "Zhongcao result not found or access denied" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching zhongcao result:", error);
    res.status(500).json({
      error: "Failed to fetch result",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// PUT /zhongcao/:id - update for authenticated user
router.put("/:id", async (req, res) => {
  try {
    const userId = (req as unknown as AuthenticatedRequest).user.id; // Guaranteed to exist after authentication
    const id = Number(req.params.id);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const {
      restaurantName,
      dishName,
      address,
      description,
      socialMediaHandle,
    } = req.body;

    const updated = await updateZhongcaoResult(userId, id, {
      restaurantName,
      dishName,
      address,
      description,
      socialMediaHandle,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating zhongcao result:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("access denied")
    ) {
      return res.status(404).json({ error: errorMessage });
    }

    if (
      errorMessage.includes("cannot be empty") ||
      errorMessage.includes("required")
    ) {
      return res.status(400).json({ error: errorMessage });
    }

    res.status(500).json({
      error: "Failed to update result",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// DELETE /zhongcao/:id - delete for authenticated user
router.delete("/:id", async (req, res) => {
  try {
    const userId = (req as unknown as AuthenticatedRequest).user.id; // Guaranteed to exist after authentication
    const id = Number(req.params.id);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    await deleteZhongcaoResult(userId, id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting zhongcao result:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("access denied")
    ) {
      return res.status(404).json({ error: errorMessage });
    }

    res.status(500).json({
      error: "Failed to delete result",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
