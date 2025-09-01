import * as dotenv from "dotenv";

dotenv.config();

interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string[];
  uploadDir: string;
  maxFileSize: number;
  allowedFileTypes: string[];
}

const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "5001"),
  host: process.env.HOST || "0.0.0.0", // Allow external connections
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "your_secure_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "*", // Allow all origins for learning environment
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "0") || 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ],
};

export default appConfig;
