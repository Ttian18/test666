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
  host: process.env.HOST || "localhost",
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "your_secure_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173", // Vite default
        "http://localhost:8080", // Your frontend port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080", // Your frontend port
      ],
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
