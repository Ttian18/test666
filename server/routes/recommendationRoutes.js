import express from "express";
import { getRestaurantRecommendations } from "../services/recommendationService.mjs";
import { extractInfoFromImage } from "../services/zhongcao.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../db/prismaClient.js";

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

    // Persist to DB
    const created = await prisma.zhongcaoResult.create({
      data: {
        originalFilename: req.file.originalname,
        restaurantName: extractedInfo.restaurant_name,
        dishName: extractedInfo.dish_name || null,
        address: extractedInfo.address || null,
        description: extractedInfo.description,
        socialMediaHandle: extractedInfo.social_media_handle || null,
        processedAt: new Date(),
      },
    });

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

    // Return the extracted information from DB entry
    res.status(200).json({
      message: "Successfully analyzed and saved image analysis result",
      result: created,
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

// CRUD for ZhongcaoResult
// GET /recommendations/zhongcao - list all
router.get("/zhongcao", async (req, res) => {
  console.log("Fetching zhongcao results");
  try {
    const results = await prisma.zhongcaoResult.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(results);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch results", details: err.message });
  }
});

// GET /recommendations/zhongcao/:id - get one
router.get("/zhongcao/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const result = await prisma.zhongcaoResult.findUnique({ where: { id } });
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch result", details: err.message });
  }
});

// PUT /recommendations/zhongcao/:id - update
router.put("/zhongcao/:id", async (req, res) => {
  try {
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

    // Validate required fields
    if (!restaurantName || !description) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["restaurantName", "description"],
      });
    }

    const updated = await prisma.zhongcaoResult.update({
      where: { id },
      data: {
        restaurantName,
        dishName,
        address,
        description,
        socialMediaHandle,
      },
    });
    res.json(updated);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    res
      .status(500)
      .json({ error: "Failed to update result", details: err.message });
  }
});

// DELETE /recommendations/zhongcao/:id - delete
router.delete("/zhongcao/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    await prisma.zhongcaoResult.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
    res
      .status(500)
      .json({ error: "Failed to delete result", details: err.message });
  }
});

// Placeholder for POST /recommendations/menu-analysis
router.post("/menu-analysis", (req, res) => {
  res.status(200).json({ message: "Endpoint for AI menu analysis" });
});

export default router;
