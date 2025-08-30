import request from "supertest";
import express from "express";
import transactionRoutes from "../../src/routes/transaction/index.js";
import authRoutes from "../../src/routes/auth/index.js";

describe("Cross-User Data Access Security Tests", () => {
  let app;
  let user1, user2, user3;
  let user1Token, user2Token, user3Token;
  let user1Transaction, user2Transaction;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use("/transactions", transactionRoutes);
    app.use("/auth", authRoutes);
  });

  beforeEach(async () => {
    await global.testDb.cleanup();

    // Create multiple test users
    user1 = await global.testDb.createUser({
      email: "security1@test.com",
      name: "Security User 1",
    });
    user2 = await global.testDb.createUser({
      email: "security2@test.com",
      name: "Security User 2",
    });
    user3 = await global.testDb.createUser({
      email: "security3@test.com",
      name: "Security User 3",
    });

    // Generate tokens
    user1Token = global.testUtils.generateTestToken(user1.id);
    user2Token = global.testUtils.generateTestToken(user2.id);
    user3Token = global.testUtils.generateTestToken(user3.id);

    // Create transactions for each user
    user1Transaction = await global.testDb.createTransaction(user1.id, {
      amount: 100,
      description: "User 1 Confidential Transaction",
      category: "Food",
      merchant: "User 1 Restaurant",
    });

    user2Transaction = await global.testDb.createTransaction(user2.id, {
      amount: 200,
      description: "User 2 Private Transaction",
      category: "Shopping",
      merchant: "User 2 Store",
    });
  });

  describe("Transaction Access Control", () => {
    test("User should not access another user's transaction by ID", async () => {
      // User 1 tries to access User 2's transaction
      const response = await request(app)
        .get(`/transactions/${user2Transaction.id}`)
        .set("x-auth-token", user1Token)
        .expect(404);

      expect(response.body.error).toBe("Transaction not found");
    });

    test("User should not modify another user's transaction", async () => {
      // User 1 tries to update User 2's transaction
      const updateResponse = await request(app)
        .put(`/transactions/${user2Transaction.id}`)
        .set("x-auth-token", user1Token)
        .send({
          description: "Hacked by User 1",
          amount: 999999,
        })
        .expect(404);

      expect(updateResponse.body.error).toBe("Transaction not found");

      // Verify User 2's transaction is unchanged
      const originalTransaction = await global.prisma.transaction.findUnique({
        where: { id: user2Transaction.id },
      });
      expect(originalTransaction.description).toBe(
        "User 2 Private Transaction"
      );
      expect(originalTransaction.amount).toBe(200);
    });

    test("User should not delete another user's transaction", async () => {
      // User 1 tries to delete User 2's transaction
      const deleteResponse = await request(app)
        .delete(`/transactions/${user2Transaction.id}`)
        .set("x-auth-token", user1Token)
        .expect(404);

      expect(deleteResponse.body.error).toBe("Transaction not found");

      // Verify User 2's transaction still exists
      const stillExists = await global.prisma.transaction.findUnique({
        where: { id: user2Transaction.id },
      });
      expect(stillExists).toBeTruthy();
    });

    test("User should only see their own transactions in list", async () => {
      // Create additional transactions for different users
      await global.testDb.createTransaction(user1.id, {
        amount: 150,
        description: "User 1 Second",
      });
      await global.testDb.createTransaction(user2.id, {
        amount: 250,
        description: "User 2 Second",
      });
      await global.testDb.createTransaction(user3.id, {
        amount: 350,
        description: "User 3 Transaction",
      });

      // User 1 gets their transactions
      const user1Response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.transactions).toHaveLength(2);
      expect(user1Response.body.userId).toBe(user1.id);
      user1Response.body.transactions.forEach((transaction) => {
        expect(transaction.user_id).toBe(user1.id);
        expect(transaction.description).toContain("User 1");
      });

      // User 2 gets their transactions
      const user2Response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2Response.body.transactions).toHaveLength(2);
      expect(user2Response.body.userId).toBe(user2.id);
      user2Response.body.transactions.forEach((transaction) => {
        expect(transaction.user_id).toBe(user2.id);
        expect(transaction.description).toContain("User 2");
      });
    });
  });

  describe("Statistics Isolation", () => {
    test("Transaction stats should be user-isolated", async () => {
      // Create different spending amounts for each user
      await global.testDb.createTransaction(user1.id, { amount: 100 });
      await global.testDb.createTransaction(user1.id, { amount: 200 }); // User 1 total: 300

      await global.testDb.createTransaction(user2.id, { amount: 500 });
      await global.testDb.createTransaction(user2.id, { amount: 1000 }); // User 2 total: 1500

      // User 1's stats should only reflect their data
      const user1StatsResponse = await request(app)
        .get("/transactions/stats")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1StatsResponse.body.stats.totalTransactions).toBe(2);
      expect(user1StatsResponse.body.stats.totalAmount).toBe(300);
      expect(user1StatsResponse.body.stats.averageAmount).toBe(150);

      // User 2's stats should only reflect their data
      const user2StatsResponse = await request(app)
        .get("/transactions/stats")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2StatsResponse.body.stats.totalTransactions).toBe(2);
      expect(user2StatsResponse.body.stats.totalAmount).toBe(1500);
      expect(user2StatsResponse.body.stats.averageAmount).toBe(750);
    });

    test("Insights should be completely user-isolated", async () => {
      // Create transactions with same categories but different amounts
      await global.testDb.createTransaction(user1.id, {
        amount: 100,
        category: "Food",
        merchant: "Restaurant A",
      });
      await global.testDb.createTransaction(user2.id, {
        amount: 1000,
        category: "Food",
        merchant: "Restaurant A",
      });

      // User 1's insights should only show their spending
      const user1InsightsResponse = await request(app)
        .get("/transactions/insights/summary")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1InsightsResponse.body.data.userId).toBe(user1.id);
      expect(user1InsightsResponse.body.data.summary.totalAmount).toBe(100);

      // User 2's insights should only show their spending
      const user2InsightsResponse = await request(app)
        .get("/transactions/insights/summary")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2InsightsResponse.body.data.userId).toBe(user2.id);
      expect(user2InsightsResponse.body.data.summary.totalAmount).toBe(1000);
    });
  });

  describe("Token Manipulation Attacks", () => {
    test("Should not allow access with tampered JWT payload", async () => {
      // Create a JWT with User 1's ID but try to access User 2's data
      const jwt = await import("jsonwebtoken");

      // This should fail because the signature won't match the tampered payload
      const tamperedToken = jwt.default.sign(
        { id: user2.id },
        "wrong_secret", // Different secret
        { expiresIn: "1h" }
      );

      const response = await request(app)
        .get("/transactions")
        .set("x-auth-token", tamperedToken)
        .expect(401);

      expect(response.body.message).toBe("Token is not valid");
    });

    test("Should not allow access with expired token", async () => {
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.default.sign(
        { id: user1.id },
        global.testConfig.JWT_SECRET,
        { expiresIn: "-1h" } // Expired 1 hour ago
      );

      const response = await request(app)
        .get("/transactions")
        .set("x-auth-token", expiredToken)
        .expect(401);

      expect(response.body.message).toBe("Token is not valid");
    });

    test("Should not allow access with token for deleted user", async () => {
      // Delete user 3 from database
      await global.prisma.user.delete({ where: { id: user3.id } });

      // Try to use user 3's token (should fail because user no longer exists)
      const response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user3Token)
        .expect(401);

      expect(response.body.message).toBe("User not found");
    });
  });

  describe("SQL Injection Prevention", () => {
    test("Should handle malicious input in transaction ID parameter", async () => {
      const maliciousInputs = [
        "1'; DROP TABLE transactions; --",
        "1 OR 1=1",
        "1 UNION SELECT * FROM users",
        "../../../etc/passwd",
        "<script>alert('xss')</script>",
      ];

      for (const maliciousInput of maliciousInputs) {
        const response = await request(app)
          .get(`/transactions/${encodeURIComponent(maliciousInput)}`)
          .set("x-auth-token", user1Token)
          .expect(400);

        expect(response.body.error).toBe("Invalid transaction ID");
      }
    });

    test("Should handle malicious input in query parameters", async () => {
      const response = await request(app)
        .get("/transactions?category='; DROP TABLE transactions; --")
        .set("x-auth-token", user1Token)
        .expect(200);

      // Should return empty results, not cause database errors
      expect(response.body.transactions).toEqual([]);
    });
  });

  describe("Authorization Boundary Testing", () => {
    test("Should maintain user isolation under concurrent requests", async () => {
      // Create promises for concurrent requests from different users
      const user1Requests = Array(5)
        .fill()
        .map(() =>
          request(app).get("/transactions").set("x-auth-token", user1Token)
        );

      const user2Requests = Array(5)
        .fill()
        .map(() =>
          request(app).get("/transactions").set("x-auth-token", user2Token)
        );

      // Execute all requests concurrently
      const allResponses = await Promise.all([
        ...user1Requests,
        ...user2Requests,
      ]);

      // Verify each response maintains proper user isolation
      allResponses.slice(0, 5).forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(user1.id);
        response.body.transactions.forEach((transaction) => {
          expect(transaction.user_id).toBe(user1.id);
        });
      });

      allResponses.slice(5, 10).forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(user2.id);
        response.body.transactions.forEach((transaction) => {
          expect(transaction.user_id).toBe(user2.id);
        });
      });
    });

    test("Should prevent privilege escalation through parameter manipulation", async () => {
      // Try various ways to bypass user isolation
      const bypassAttempts = [
        "/transactions?user_id=2",
        "/transactions?userId=2",
        "/transactions?id=2",
        "/transactions/../2",
        "/transactions?filter[user_id]=2",
      ];

      for (const attempt of bypassAttempts) {
        const response = await request(app)
          .get(attempt)
          .set("x-auth-token", user1Token)
          .expect(200);

        // Should only return user 1's data regardless of parameters
        expect(response.body.userId).toBe(user1.id);
        response.body.transactions.forEach((transaction) => {
          expect(transaction.user_id).toBe(user1.id);
        });
      }
    });
  });

  describe("Data Leakage Prevention", () => {
    test("Error messages should not leak sensitive information", async () => {
      // Try to access non-existent transaction
      const response = await request(app)
        .get("/transactions/99999")
        .set("x-auth-token", user1Token)
        .expect(404);

      // Error message should be generic, not revealing database structure
      expect(response.body.error).toBe("Transaction not found");
      expect(response.body).not.toHaveProperty("sql");
      expect(response.body).not.toHaveProperty("stack");
      expect(response.body).not.toHaveProperty("query");
    });

    test("Should not expose other users' data in any response field", async () => {
      const response = await request(app)
        .get("/transactions")
        .set("x-auth-token", user1Token)
        .expect(200);

      // Stringify response to check for any occurrence of other users' data
      const responseStr = JSON.stringify(response.body);

      expect(responseStr).not.toContain("User 2 Private Transaction");
      expect(responseStr).not.toContain("User 2 Store");
      expect(responseStr).not.toContain(user2.email);
      expect(responseStr).not.toContain(user3.email);
    });
  });
});
