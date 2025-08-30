import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

// Enhanced authentication middleware with database validation
export const authenticate = async (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate token payload structure
    if (!decoded.id || typeof decoded.id !== "number") {
      console.error("Authentication error: Invalid token payload structure");
      return res.status(401).json({ message: "Token is not valid" });
    }

    // CRITICAL: Validate user exists in database (Prisma User model)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }, // Using integer ID from Prisma model
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Now contains validated Prisma user data
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    // Handle specific JWT errors vs database errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ message: "Token is not valid" });
    }
    // For database errors or other issues, still return token invalid for security
    res.status(401).json({ message: "Token is not valid" });
  }
};

export { JWT_SECRET };
