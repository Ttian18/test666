import request from "supertest";
import express from "express";
import transactionRoutes from "../../src/routes/transaction/index.js";

describe("Transaction Routes Integration", () => {
  let app;
  let testUser1, testUser2;
  let user1Token, user2Token;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use("/transactions", transactionRoutes);
  });

  beforeEach(async () => {
    await global.testDb.cleanup();

    // Create test users
    testUser1 = await global.testDb.createUser({
      email: "integration1@test.com",
      name: "Integration User 1",
    });
    testUser2 = await global.testDb.createUser({
      email: "integration2@test.com",
      name: "Integration User 2",
    });

    // Generate tokens
    user1Token = global.testUtils.generateTestToken(testUser1.id);
    user2Token = global.testUtils.generateTestToken(testUser2.id);
  });

  describe("Authentication Requirements", () => {
    test("GET /transactions should return 401 without token", async () => {
      const response = await request(app).get("/transactions").expect(401);

      expect(response.body.message).toBe("No token, authorization denied");
    });

    test("GET /transactions should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/transactions")
        .set("x-auth-token", "invalid_token")
        .expect(401);

      expect(response.body.message).toBe("Token is not valid");
    });

    test("GET /transactions should work with valid token", async () => {
      const response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.transactions).toEqual([]);
      expect(response.body.count).toBe(0);
      expect(response.body.userId).toBe(testUser1.id);
    });
  });

  describe("User Isolation in Routes", () => {
    test("GET /transactions should only return user-specific transactions", async () => {
      // Create transactions for both users
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        description: "User 1 Transaction",
      });
      await global.testDb.createTransaction(testUser2.id, {
        amount: 200,
        description: "User 2 Transaction",
      });

      // User 1 should only see their transaction
      const user1Response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.transactions).toHaveLength(1);
      expect(user1Response.body.transactions[0].description).toBe(
        "User 1 Transaction"
      );
      expect(user1Response.body.userId).toBe(testUser1.id);

      // User 2 should only see their transaction
      const user2Response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2Response.body.transactions).toHaveLength(1);
      expect(user2Response.body.transactions[0].description).toBe(
        "User 2 Transaction"
      );
      expect(user2Response.body.userId).toBe(testUser2.id);
    });

    test("GET /transactions/:id should not allow cross-user access", async () => {
      // Create transaction for user 2
      const user2Transaction = await global.testDb.createTransaction(
        testUser2.id,
        {
          amount: 300,
          description: "User 2 Private Transaction",
        }
      );

      // User 1 tries to access user 2's transaction
      const response = await request(app)
        .get(`/transactions/${user2Transaction.id}`)
        .set("x-auth-token", user1Token)
        .expect(404);

      expect(response.body.error).toBe("Transaction not found");
    });

    test("PUT /transactions/:id should not allow cross-user updates", async () => {
      // Create transaction for user 2
      const user2Transaction = await global.testDb.createTransaction(
        testUser2.id,
        {
          amount: 400,
          description: "User 2 Transaction",
        }
      );

      // User 1 tries to update user 2's transaction
      const response = await request(app)
        .put(`/transactions/${user2Transaction.id}`)
        .set("x-auth-token", user1Token)
        .send({ description: "Hacked by User 1" })
        .expect(404);

      expect(response.body.error).toBe("Transaction not found");

      // Verify original transaction is unchanged
      const originalTransaction = await global.prisma.transaction.findUnique({
        where: { id: user2Transaction.id },
      });
      expect(originalTransaction.description).toBe("User 2 Transaction");
    });

    test("DELETE /transactions/:id should not allow cross-user deletion", async () => {
      // Create transaction for user 2
      const user2Transaction = await global.testDb.createTransaction(
        testUser2.id,
        {
          amount: 500,
          description: "User 2 Important Transaction",
        }
      );

      // User 1 tries to delete user 2's transaction
      const response = await request(app)
        .delete(`/transactions/${user2Transaction.id}`)
        .set("x-auth-token", user1Token)
        .expect(404);

      expect(response.body.error).toBe("Transaction not found");

      // Verify transaction still exists
      const stillExists = await global.prisma.transaction.findUnique({
        where: { id: user2Transaction.id },
      });
      expect(stillExists).toBeTruthy();
    });
  });

  describe("CRUD Operations", () => {
    test("POST /transactions should create transaction for authenticated user", async () => {
      const transactionData = {
        amount: 150.75,
        description: "Test Purchase",
        category: "Shopping",
        date: new Date().toISOString(),
        merchant: "Test Store",
        source: "manual",
      };

      const response = await request(app)
        .post("/transactions")
        .set("x-auth-token", user1Token)
        .send(transactionData)
        .expect(201);

      expect(response.body.message).toBe("Transaction created successfully");
      expect(response.body.transaction.user_id).toBe(testUser1.id);
      expect(response.body.transaction.amount).toBe(150.75);
      expect(response.body.transaction.description).toBe("Test Purchase");
    });

    test("POST /transactions should validate required fields", async () => {
      const incompleteData = {
        amount: 100,
        // missing required fields
      };

      const response = await request(app)
        .post("/transactions")
        .set("x-auth-token", user1Token)
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toContain("Missing required field");
    });

    test("PUT /transactions/:id should update user's own transaction", async () => {
      // Create transaction for user 1
      const transaction = await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        description: "Original Description",
      });

      const updateData = {
        description: "Updated Description",
        amount: 150,
      };

      const response = await request(app)
        .put(`/transactions/${transaction.id}`)
        .set("x-auth-token", user1Token)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Transaction updated successfully");
      expect(response.body.transaction.description).toBe("Updated Description");
      expect(response.body.transaction.amount).toBe(150);
      expect(response.body.transaction.user_id).toBe(testUser1.id);
    });

    test("DELETE /transactions/:id should delete user's own transaction", async () => {
      // Create transaction for user 1
      const transaction = await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        description: "To be deleted",
      });

      const response = await request(app)
        .delete(`/transactions/${transaction.id}`)
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.message).toBe("Transaction deleted successfully");

      // Verify transaction is deleted
      const deletedTransaction = await global.prisma.transaction.findUnique({
        where: { id: transaction.id },
      });
      expect(deletedTransaction).toBeNull();
    });
  });

  describe("Statistics Routes", () => {
    test("GET /transactions/stats should return user-specific statistics", async () => {
      // Create transactions for both users
      await global.testDb.createTransaction(testUser1.id, { amount: 100 });
      await global.testDb.createTransaction(testUser1.id, { amount: 200 });
      await global.testDb.createTransaction(testUser2.id, { amount: 1000 });

      const response = await request(app)
        .get("/transactions/stats")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.stats.totalTransactions).toBe(2);
      expect(response.body.stats.totalAmount).toBe(300);
      expect(response.body.stats.averageAmount).toBe(150);
    });

    test("GET /transactions/stats should require authentication", async () => {
      await request(app).get("/transactions/stats").expect(401);
    });
  });

  describe("Public Routes", () => {
    test("GET /transactions/categories should be accessible without authentication", async () => {
      const response = await request(app)
        .get("/transactions/categories")
        .expect(200);

      expect(response.body.categories).toBeDefined();
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });
  });

  describe("Input Validation", () => {
    test("should handle invalid transaction IDs", async () => {
      await request(app)
        .get("/transactions/invalid_id")
        .set("x-auth-token", user1Token)
        .expect(400);

      await request(app)
        .put("/transactions/invalid_id")
        .set("x-auth-token", user1Token)
        .send({ description: "test" })
        .expect(400);

      await request(app)
        .delete("/transactions/invalid_id")
        .set("x-auth-token", user1Token)
        .expect(400);
    });

    test("should handle non-existent transaction IDs", async () => {
      const nonExistentId = 99999;

      await request(app)
        .get(`/transactions/${nonExistentId}`)
        .set("x-auth-token", user1Token)
        .expect(404);

      await request(app)
        .put(`/transactions/${nonExistentId}`)
        .set("x-auth-token", user1Token)
        .send({ description: "test" })
        .expect(404);

      await request(app)
        .delete(`/transactions/${nonExistentId}`)
        .set("x-auth-token", user1Token)
        .expect(404);
    });
  });

  describe("Query Parameters", () => {
    test("GET /transactions should support filtering parameters", async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Create transactions with different categories and dates
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        category: "Food",
        date: today,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        category: "Shopping",
        date: yesterday,
      });

      // Test category filter
      const foodResponse = await request(app)
        .get("/transactions?category=Food")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(foodResponse.body.transactions).toHaveLength(1);
      expect(foodResponse.body.transactions[0].category).toBe("Food");

      // Test limit parameter
      const limitResponse = await request(app)
        .get("/transactions?limit=1")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(limitResponse.body.transactions).toHaveLength(1);
    });
  });
});
