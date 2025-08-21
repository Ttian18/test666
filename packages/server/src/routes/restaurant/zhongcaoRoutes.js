import express from "express";
import { extractInfoFromImage } from "../../services/restaurant/zhongcaoService.js";
import { uploadImage } from "../../utils/upload/uploadUtils.js";
import { validateFile } from "../../utils/validation/validationUtils.js";
import prisma from "../../models/database/client.js";

const router = express.Router();

// POST /social-upload - Analyze restaurant images from social media
router.post("/social-upload", uploadImage.single("image"), async (req, res) => {
  try {
    validateFile(req.file, "image");

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

    res.status(201).json({
      message: "Image processed successfully",
      result: created,
      extractedInfo,
      // Expose key fields at top-level for easier FE consumption
      restaurant_name:
        extractedInfo?.restaurant_name || created.restaurantName || "",
      dish_name: extractedInfo?.dish_name ?? created.dishName ?? null,
      address: extractedInfo?.address ?? created.address ?? null,
      description: extractedInfo?.description || created.description || "",
      social_media_handle:
        extractedInfo?.social_media_handle ?? created.socialMediaHandle ?? null,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({
      error: "Failed to process image",
      details: error.message,
    });
  }
});

// GET /zhongcao - list all
router.get("/", async (req, res) => {
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

// GET /zhongcao/:id - get one
router.get("/:id", async (req, res) => {
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

// PUT /zhongcao/:id - update
router.put("/:id", async (req, res) => {
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

// DELETE /zhongcao/:id - delete
router.delete("/:id", async (req, res) => {
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

export default router;
