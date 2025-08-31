import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Formats we pass through as-is
const DIRECT_OK = new Set(["image/jpeg", "image/png", "image/webp"]);

// Formats we convert to JPEG
const CONVERT_TO_JPEG = new Set([
  "image/heic",
  "image/heif",
  "image/gif", // sharp uses first frame
  "image/bmp",
  "image/tiff",
]);

interface UploadFile {
  buffer: Buffer;
  mimetype: string;
}

interface NormalizedImage {
  buffer: Buffer;
  mimeType: string;
}

// Image normalization for OpenAI
export async function normalizeImageForOpenAI(file: UploadFile): Promise<NormalizedImage> {
  let { buffer, mimetype } = file;

  // Pass-through
  if (DIRECT_OK.has(mimetype)) {
    return { buffer, mimeType: mimetype };
  }

  // Convert "exotic" types → JPEG
  if (CONVERT_TO_JPEG.has(mimetype)) {
    try {
      const out = await sharp(buffer)
        // For GIF/WEBP multi-frame inputs, sharp reads first frame by default
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
      return { buffer: out, mimeType: "image/jpeg" };
    } catch (e) {
      throw Object.assign(new Error(`Failed to convert ${mimetype} to JPEG`), {
        status: 415,
      });
    }
  }

  // Not supported
  throw Object.assign(new Error(`Unsupported image type: ${mimetype}`), {
    status: 415,
  });
}

// Disk storage for file uploads
export const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
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

// Memory storage for processing
export const memoryStorage = multer.memoryStorage();

// Common file filter for images
export const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Extended file filter for multiple formats
export const extendedImageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

// Upload middleware configurations
export const uploadImage = multer({
  storage: diskStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadImageMemory = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB limit
  },
});

export const uploadExtended = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: extendedImageFileFilter,
});
