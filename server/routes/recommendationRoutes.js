import express from "express";
import { getRestaurantRecommendations } from "../services/recommendationService.mjs";
import { extractInfoFromImage } from "../services/zhongcao.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// GET /recommendations - Personalized restaurant recommendations based on location
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        error:
          "Location parameter is required. Please provide a location query parameter.",
      });
    }

    // Create a query for restaurant recommendations in the specified location
    const query = `I'm looking for restaurant recommendations in ${location}. Please suggest good places to eat.`;

    const result = await getRestaurantRecommendations(query);

    res.status(200).json({
      message: "Personalized restaurant recommendations",
      location: location,
      recommendations: result.answer,
      query: result.query,
      steps: result.steps,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({
      error: "Failed to get recommendations",
      details: error.message,
    });
  }
});

// POST /recommendations/social-upload - Analyze restaurant images from social media
router.post("/social-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image file uploaded. Please upload an image file.",
      });
    }

    console.log(`📸 Processing uploaded image: ${req.file.filename}`);

    // Extract restaurant information from the uploaded image
    const extractedInfo = await extractInfoFromImage(req.file.filename);

    // Clean up the uploaded file after processing
    try {
      fs.unlinkSync(req.file.path);
      console.log(`🗑️ Cleaned up uploaded file: ${req.file.filename}`);
    } catch (cleanupError) {
      console.warn(
        `⚠️ Failed to clean up file ${req.file.filename}:`,
        cleanupError
      );
    }

    // Return the extracted information
    res.status(200).json({
      message: "Successfully analyzed restaurant image from social media",
      extractedInfo: extractedInfo,
      originalFilename: req.file.originalname,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing social upload:", error);

    // Clean up file if it exists and there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Cleaned up file after error: ${req.file.filename}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to clean up file after error:`, cleanupError);
      }
    }

    res.status(500).json({
      error: "Failed to process social media image",
      details: error.message,
    });
  }
});

// Placeholder for POST /recommendations/menu-analysis
router.post("/menu-analysis", (req, res) => {
  res.status(200).json({ message: "Endpoint for AI menu analysis" });
});

export default router;
