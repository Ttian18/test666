import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import type { Request } from "express";

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

// Interface for file object
interface FileObject {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
}

// Interface for normalized image result
interface NormalizedImageResult {
  buffer: Buffer;
  mimeType: string;
}

// Image normalization for OpenAI
export async function normalizeImageForOpenAI(
  file: FileObject
): Promise<NormalizedImageResult> {
  let { buffer, mimetype, originalname } = file;

  // For HEIC files, browsers sometimes send wrong MIME type
  // Check file extension as backup
  const ext = originalname ? path.extname(originalname).toLowerCase() : "";
  const isHeicFile = ext === ".heic" || ext === ".heif";

  // Correct MIME type for HEIC files if needed
  if (isHeicFile && !mimetype.includes("heic") && !mimetype.includes("heif")) {
    console.log(`Correcting MIME type for HEIC file: ${originalname}`);
    mimetype = ext === ".heic" ? "image/heic" : "image/heif";
  }

  // Pass-through
  if (DIRECT_OK.has(mimetype)) {
    return { buffer, mimeType: mimetype };
  }

  // Convert "exotic" types → JPEG (including HEIC)
  if (CONVERT_TO_JPEG.has(mimetype) || isHeicFile) {
    try {
      console.log(`Converting ${mimetype} (${originalname}) to JPEG...`);
      const out = await sharp(buffer)
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
      console.log(`Successfully converted ${originalname} to JPEG`);
      return { buffer: out, mimeType: "image/jpeg" };
    } catch (e) {
      console.error(
        `Sharp conversion error for ${mimetype} (${originalname}):`,
        e instanceof Error ? e.message : String(e)
      );

      // Check for specific HEIC compression format issues
      if (
        isHeicFile &&
        e instanceof Error &&
        (e.message.includes(
          "Support for this compression format has not been built in"
        ) ||
          e.message.includes("heif:") ||
          e.message.includes("bad seek"))
      ) {
        throw Object.assign(
          new Error(
            `This HEIC file uses a compression format not supported by the server. Please convert to JPG, PNG, or WebP format. You can convert HEIC files using: Photos app → Share → Copy Photo → Choose 'JPG' format.`
          ),
          {
            status: 415,
          }
        );
      }

      throw Object.assign(
        new Error(
          `Failed to convert ${mimetype} to JPEG. Please try a different file or ensure the image is not corrupted.`
        ),
        {
          status: 415,
        }
      );
    }
  }

  // Not supported
  throw Object.assign(new Error(`Unsupported image type: ${mimetype}`), {
    status: 415,
  });
}

// Disk storage for file uploads
export const diskStorage = multer.diskStorage({
  destination: function (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, uploadsDir);
  },
  filename: function (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
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
export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Extended file filter for multiple formats
export const extendedImageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();

  // Define allowed extensions (more permissive)
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
    ".gif",
    ".bmp",
    ".tiff",
    ".jfif", // JPEG File Interchange Format
  ];

  // Define allowed MIME types
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/jfif",
    "application/octet-stream", // Sometimes files come with this generic type
  ];

  // Check by MIME type or file extension
  const isValidMimeType = allowedTypes.includes(file.mimetype);
  const isValidExtension = allowedExtensions.includes(ext);

  // Special handling for HEIC files
  const isHeicFile = ext === ".heic" || ext === ".heif";

  // If we have a valid extension, accept the file regardless of MIME type
  // This handles cases where browsers send wrong MIME types
  if (isValidExtension || isValidMimeType || isHeicFile) {
    console.log(`✅ File accepted: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    console.log(
      `❌ File rejected: ${file.originalname} (${file.mimetype}) with extension ${ext}`
    );
    cb(
      new Error(
        `Unsupported file type: ${
          file.mimetype
        } with extension ${ext}. Please use: ${allowedExtensions.join(", ")}`
      )
    );
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
