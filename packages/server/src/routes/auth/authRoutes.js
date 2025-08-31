import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../../utils/auth/authUtils.js";
import {
  validateEmail,
  validatePassword,
} from "../../utils/validation/validationUtils.js";
import {
  RegisterRequestSchema,
  RegisterResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
} from "@your-project/schema";
import tokenBlacklistService from "../../services/auth/tokenBlacklistService.js";
import { authenticate } from "../../utils/auth/authUtils.js";

const prisma = new PrismaClient();

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    // Validate request body using schema
    const validatedData = RegisterRequestSchema.parse(req.body);
    const { email, password, firstName, lastName } = validatedData;

    // Combine firstName and lastName to create full name
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Check existing user using Prisma
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user using Prisma with name
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        profileComplete: false,
      },
    });

    // Generate JWT with integer ID (Prisma User model)
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Validate response before sending
    const response = RegisterResponseSchema.parse({
      message: "User registered successfully",
      userId: newUser.id,
      token,
    });

    res.status(201).json(response);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    // Validate request body using schema
    const validatedData = LoginRequestSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user using Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT with integer ID (Prisma User model)
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Validate response before sending
    const response = LoginResponseSchema.parse({
      message: "Login successful",
      userId: user.id,
      token,
      profileComplete: user.profileComplete,
      name: user.name,
    });

    res.status(200).json(response);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Token Validation
router.get("/validate", authenticate, async (req, res) => {
  try {
    // If we reach here, the token is valid (authenticate middleware passed)
    const userId = req.user.id;
    
    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileComplete: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      profileComplete: user.profileComplete || false,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(500).json({ message: "Server error during token validation" });
  }
});

// User Logout
router.post("/logout", authenticate, async (req, res) => {
  try {
    // Validate request body using schema
    const validatedData = LogoutRequestSchema.parse(req.body);
    const { token } = validatedData;

    // Blacklist the token
    const success = await tokenBlacklistService.blacklistToken(
      token,
      req.user.id
    );

    if (!success) {
      return res.status(500).json({ message: "Failed to logout" });
    }

    // Validate response before sending
    const response = LogoutResponseSchema.parse({
      message: "Logout successful",
      success: true,
    });

    res.status(200).json(response);
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
});

export default router;
