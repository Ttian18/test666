import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";

// Make Jest available globally
global.jest = jest;

// Global test configuration
global.testConfig = {
  JWT_SECRET: process.env.JWT_SECRET || "your_secure_secret", // Match middleware secret
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test_db",
};

// Global test utilities
global.testUtils = {
  // Generate test JWT token
  generateTestToken: (userId) => {
    return jwt.sign({ id: userId }, global.testConfig.JWT_SECRET, {
      expiresIn: "1h",
    });
  },

  // Create test user data
  createTestUser: (overrides = {}) => ({
    name: "Test User",
    email:
      overrides.email ||
      `test-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}@example.com`,
    password: "$2a$10$test.hash.password", // bcrypt hash for "testpass123"
    profileComplete: false,
    ...overrides,
  }),

  // Create test transaction data
  createTestTransaction: (userId, overrides = {}) => ({
    user_id: userId,
    amount: 100.5,
    category: "Food",
    date: new Date(),
    merchant: "Test Merchant",
    source: "manual",
    ...overrides,
  }),

  // Create test profile data
  createTestProfile: (overrides = {}) => ({
    monthlyBudget: 2000,
    monthlyIncome: 5000,
    expensePreferences: {
      cuisineTypes: ["Italian", "Asian"],
      diningOut: "moderate",
    },
    savingsGoals: {
      targetAmount: 10000,
      timeframe: "12 months",
    },
    lifestylePreferences: {
      priceRange: "$$",
      diningStyle: "casual",
    },
    ...overrides,
  }),

  // Sleep utility for async tests
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Setup and teardown for tests
let prisma;

beforeAll(async () => {
  // Initialize Prisma client for tests
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: global.testConfig.DATABASE_URL,
      },
    },
  });

  global.prisma = prisma;
});

afterAll(async () => {
  // Cleanup after all tests
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Test database cleanup utilities
global.testDb = {
  // Clean all test data
  cleanup: async () => {
    if (prisma) {
      try {
        // Use raw SQL to truncate tables with CASCADE to handle foreign keys
        await prisma.$executeRaw`TRUNCATE TABLE transactions CASCADE`;
        await prisma.$executeRaw`TRUNCATE TABLE vouchers CASCADE`;
        await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;

        // Reset sequences to start from 1
        await prisma.$executeRaw`ALTER SEQUENCE transactions_id_seq RESTART WITH 1`;
        await prisma.$executeRaw`ALTER SEQUENCE vouchers_id_seq RESTART WITH 1`;
        await prisma.$executeRaw`ALTER SEQUENCE "User_id_seq" RESTART WITH 1`;

        // Clean up in-memory Profile entities
        const Profile = (await import("../src/models/entities/Profile.js"))
          .default;
        await Profile.deleteMany();
      } catch (error) {
        console.warn("Cleanup warning:", error.message);
        // Fallback to individual deletions
        try {
          await prisma.transaction.deleteMany({});
          await prisma.voucher.deleteMany({});
          await prisma.user.deleteMany({});

          // Clean up in-memory Profile entities
          const Profile = (await import("../src/models/entities/Profile.js"))
            .default;
          await Profile.deleteMany();
        } catch (fallbackError) {
          console.warn("Fallback cleanup also failed:", fallbackError.message);
        }
      }
    }
  },

  // Create test user in database
  createUser: async (userData = {}) => {
    const testUser = global.testUtils.createTestUser(userData);
    try {
      return await prisma.user.create({
        data: testUser,
      });
    } catch (error) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        // Handle unique constraint violation by generating new email
        const uniqueUser = global.testUtils.createTestUser({
          ...userData,
          email: `test-retry-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}@example.com`,
        });
        return await prisma.user.create({
          data: uniqueUser,
        });
      }
      throw error;
    }
  },

  // Create test transaction in database
  createTransaction: async (userId, transactionData = {}) => {
    // First ensure the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(
        `Cannot create transaction: User with ID ${userId} does not exist`
      );
    }

    const testTransaction = global.testUtils.createTestTransaction(
      userId,
      transactionData
    );
    return await prisma.transaction.create({
      data: testTransaction,
    });
  },
};

console.log("Test setup initialized");
