import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import tokenBlacklistService from "../../services/auth/tokenBlacklistService.js";

declare global {
  var prisma: PrismaClient | undefined;
}

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_secure_secret";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string | null;
  };
}

interface TokenPayload extends JwtPayload {
  id: number;
}

// Enhanced authentication middleware with database validation
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

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
  } catch (error: unknown) {
    console.error("Authentication error:", error);
    // Handle specific JWT errors vs database errors
    if (
      error instanceof Error && (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      )
    ) {
      return res.status(401).json({ message: "Token is not valid" });
    }
    // For database errors or other issues, still return token invalid for security
    res.status(401).json({ message: "Token is not valid" });
  }
};

export { JWT_SECRET };
