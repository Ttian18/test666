import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../../utils/auth/authUtils.js";
import {
  validateEmail,
  validatePassword,
} from "../../utils/validation/validationUtils.js";

const prisma = new PrismaClient();

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    try {
      validateEmail(email);
      validatePassword(password);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    // Check existing user using Prisma
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user using Prisma
    const newUser = await prisma.user.create({
      data: {
        email,
        name: null, // Can be updated later in profile
        password: hashedPassword,
        profileComplete: false,
      },
    });

    // Generate JWT with integer ID (Prisma User model)
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    try {
      validateEmail(email);
      validatePassword(password);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

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

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      token,
      profileComplete: user.profileComplete,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
