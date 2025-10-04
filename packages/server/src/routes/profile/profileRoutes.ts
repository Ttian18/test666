import express from "express";
import { authenticate } from "../middleware/auth";
import { ProfileService } from "../../services/profile/profileService";
import multer from "multer";
import path from "path";

const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("只允许上传图片文件 (JPEG, PNG, WebP)"));
    }
  },
});

// GET /api/users/profile - 获取用户资料
router.get("/", authenticate, async (req, res) => {
  try {
    const profile = await ProfileService.getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/users/profile - 更新用户资料
router.put("/", authenticate, async (req, res) => {
  try {
    const { section, data } = req.body;

    let result;
    switch (section) {
      case "basicInfo":
        result = await ProfileService.updateBasicInfo(req.user.id, data);
        break;
      case "dietaryPreferences":
        result = await ProfileService.updateDietaryPreferences(
          req.user.id,
          data
        );
        break;
      case "financialSettings":
        result = await ProfileService.updateFinancialSettings(
          req.user.id,
          data
        );
        break;
      case "notificationSettings":
        result = await ProfileService.updateNotificationSettings(
          req.user.id,
          data
        );
        break;
      case "privacySettings":
        result = await ProfileService.updatePrivacySettings(req.user.id, data);
        break;
      default:
        return res.status(400).json({ error: "Invalid section" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// POST /api/users/profile/avatar - 上传头像
router.post(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await ProfileService.uploadAvatar(req.user.id, req.file);
      res.json(result);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  }
);

// DELETE /api/users/profile - 删除用户资料
router.delete("/", authenticate, async (req, res) => {
  try {
    // 这里应该实现软删除或硬删除逻辑
    // 包括删除相关数据、文件等
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ error: "Failed to delete profile" });
  }
});

export default router;
