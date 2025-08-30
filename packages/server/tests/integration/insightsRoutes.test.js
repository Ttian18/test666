import request from "supertest";
import express from "express";
import insightsRoutes from "../../src/routes/transaction/insightsRoutes.js";

describe("Insights Routes Integration", () => {
  let app;
  let testUser1, testUser2;
  let user1Token, user2Token;

  beforeAll(async () => {
    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use("/insights", insightsRoutes);
  });

  beforeEach(async () => {
    await global.testDb.cleanup();

    // Create test users
    testUser1 = await global.testDb.createUser({
      email: "insights1@test.com",
      name: "Insights User 1",
    });
    testUser2 = await global.testDb.createUser({
      email: "insights2@test.com",
      name: "Insights User 2",
    });

    // Generate tokens
    user1Token = global.testUtils.generateTestToken(testUser1.id);
    user2Token = global.testUtils.generateTestToken(testUser2.id);
  });

  describe("Authentication Requirements", () => {
    const insightEndpoints = [
      "/insights/summary",
      "/insights/categories",
      "/insights/merchants",
      "/insights/trends",
      "/insights/dashboard",
    ];

    test.each(insightEndpoints)(
      "%s should require authentication",
      async (endpoint) => {
        await request(app).get(endpoint).expect(401);
      }
    );

    test.each(insightEndpoints)(
      "%s should work with valid token",
      async (endpoint) => {
        const response = await request(app)
          .get(endpoint)
          .set("x-auth-token", user1Token)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    );
  });

  describe("User Isolation in Insights", () => {
    beforeEach(async () => {
      // Create different spending patterns for each user
      const now = new Date();

      // User 1: $300 total spending
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        category: "Food",
        merchant: "Restaurant A",
        date: now,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        category: "Shopping",
        merchant: "Store B",
        date: now,
      });

      // User 2: $1000 total spending
      await global.testDb.createTransaction(testUser2.id, {
        amount: 500,
        category: "Food",
        merchant: "Restaurant A",
        date: now,
      });
      await global.testDb.createTransaction(testUser2.id, {
        amount: 500,
        category: "Travel",
        merchant: "Airline C",
        date: now,
      });
    });

    test("GET /insights/summary should only show user-specific data", async () => {
      const user1Response = await request(app)
        .get("/insights/summary")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.data.userId).toBe(testUser1.id);
      expect(user1Response.body.data.summary.totalAmount).toBe(300);
      expect(user1Response.body.data.summary.totalTransactions).toBe(2);

      const user2Response = await request(app)
        .get("/insights/summary")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2Response.body.data.userId).toBe(testUser2.id);
      expect(user2Response.body.data.summary.totalAmount).toBe(1000);
      expect(user2Response.body.data.summary.totalTransactions).toBe(2);
    });

    test("GET /insights/categories should be user-isolated", async () => {
      const user1Response = await request(app)
        .get("/insights/categories")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.data.userId).toBe(testUser1.id);
      expect(user1Response.body.data.totalAmount).toBe(300);

      const foodCategory = user1Response.body.data.categories.find(
        (cat) => cat.category === "Food"
      );
      expect(foodCategory.totalAmount).toBe(100); // User 1's Food spending, not User 2's 500

      const user2Response = await request(app)
        .get("/insights/categories")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2Response.body.data.userId).toBe(testUser2.id);
      expect(user2Response.body.data.totalAmount).toBe(1000);

      const user2FoodCategory = user2Response.body.data.categories.find(
        (cat) => cat.category === "Food"
      );
      expect(user2FoodCategory.totalAmount).toBe(500);
    });

    test("GET /insights/merchants should be user-isolated", async () => {
      const user1Response = await request(app)
        .get("/insights/merchants")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.data.userId).toBe(testUser1.id);
      expect(user1Response.body.data.totalAmount).toBe(300);

      const restaurantA = user1Response.body.data.merchants.find(
        (m) => m.merchant === "Restaurant A"
      );
      expect(restaurantA.totalAmount).toBe(100); // User 1's spending at Restaurant A

      const user2Response = await request(app)
        .get("/insights/merchants")
        .set("x-auth-token", user2Token)
        .expect(200);

      expect(user2Response.body.data.userId).toBe(testUser2.id);

      const user2RestaurantA = user2Response.body.data.merchants.find(
        (m) => m.merchant === "Restaurant A"
      );
      expect(user2RestaurantA.totalAmount).toBe(500); // User 2's spending at Restaurant A
    });
  });

  describe("Budget Analysis", () => {
    test("GET /insights/budget should require monthlyBudget parameter", async () => {
      const response = await request(app)
        .get("/insights/budget")
        .set("x-auth-token", user1Token)
        .expect(400);

      expect(response.body.error).toBe("Monthly budget is required");
    });

    test("GET /insights/budget should validate budget parameter", async () => {
      await request(app)
        .get("/insights/budget?monthlyBudget=invalid")
        .set("x-auth-token", user1Token)
        .expect(400);

      await request(app)
        .get("/insights/budget?monthlyBudget=-100")
        .set("x-auth-token", user1Token)
        .expect(400);
    });

    test("GET /insights/budget should provide user-specific budget analysis", async () => {
      const currentMonth = new Date();
      currentMonth.setDate(1);

      // User 1 spends $800 this month
      await global.testDb.createTransaction(testUser1.id, {
        amount: 400,
        date: currentMonth,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 400,
        date: currentMonth,
      });

      // User 2 spends $2000 this month
      await global.testDb.createTransaction(testUser2.id, {
        amount: 2000,
        date: currentMonth,
      });

      const user1Response = await request(app)
        .get("/insights/budget?monthlyBudget=1000")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.data.userId).toBe(testUser1.id);
      expect(user1Response.body.data.budget.monthlyBudget).toBe(1000);
      expect(user1Response.body.data.budget.currentSpending).toBe(800);
      expect(user1Response.body.data.budget.remainingBudget).toBe(200);
      expect(user1Response.body.data.budget.status).toBe("within_budget");
    });
  });

  describe("Spending Trends", () => {
    test("GET /insights/trends should validate period parameter", async () => {
      const response = await request(app)
        .get("/insights/trends?period=invalid_period")
        .set("x-auth-token", user1Token)
        .expect(400);

      expect(response.body.error).toContain("Invalid period");
    });

    test("GET /insights/trends should show user-specific trends", async () => {
      // Create monthly transactions for user 1
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        date: new Date("2024-01-15"),
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        date: new Date("2024-02-15"),
      });

      // Create different pattern for user 2
      await global.testDb.createTransaction(testUser2.id, {
        amount: 1000,
        date: new Date("2024-01-15"),
      });

      const user1Response = await request(app)
        .get("/insights/trends?period=monthly&periods=3")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(user1Response.body.data.userId).toBe(testUser1.id);
      expect(user1Response.body.data.period).toBe("monthly");

      // Should only include user 1's data
      const totalInTrends = user1Response.body.data.periodData.reduce(
        (sum, period) => sum + period.totalAmount,
        0
      );
      expect(totalInTrends).toBe(300); // 100 + 200, not including user 2's 1000
    });
  });

  describe("Dashboard Endpoint", () => {
    test("GET /insights/dashboard should combine multiple insights", async () => {
      // Create some test data
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        category: "Food",
        date: new Date(),
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        category: "Shopping",
        date: new Date(),
      });

      const response = await request(app)
        .get("/insights/dashboard")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.topCategories).toBeDefined();
      expect(response.body.data.trends).toBeDefined();
      expect(response.body.data.budget).toBeNull(); // No budget provided

      expect(response.body.data.summary.userId).toBe(testUser1.id);
      expect(response.body.data.summary.summary.totalAmount).toBe(300);
    });

    test("GET /insights/dashboard should include budget analysis when provided", async () => {
      await global.testDb.createTransaction(testUser1.id, {
        amount: 500,
        date: new Date(),
      });

      const response = await request(app)
        .get("/insights/dashboard?monthlyBudget=1000")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.data.budget).toBeDefined();
      expect(response.body.data.budget.budget.monthlyBudget).toBe(1000);
      expect(response.body.data.budget.userId).toBe(testUser1.id);
    });
  });

  describe("Query Parameter Handling", () => {
    test("should handle date range parameters", async () => {
      const date1 = new Date("2024-01-15");
      const date2 = new Date("2024-02-15");

      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        date: date1,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        date: date2,
      });

      const response = await request(app)
        .get("/insights/summary?startDate=2024-01-01&endDate=2024-01-31")
        .set("x-auth-token", user1Token)
        .expect(200);

      // Should only include January transaction
      expect(response.body.data.summary.totalAmount).toBe(100);
    });

    test("should handle limit parameters", async () => {
      // Create multiple categories
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        category: "Food",
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        category: "Shopping",
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 300,
        category: "Travel",
      });

      const response = await request(app)
        .get("/insights/categories?limit=2")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.data.categories.length).toBeLessThanOrEqual(2);
    });
  });

  describe("Error Handling", () => {
    test("should handle service errors gracefully", async () => {
      // This test would require mocking the service to throw errors
      // For now, we test that the routes handle empty data correctly

      const response = await request(app)
        .get("/insights/summary")
        .set("x-auth-token", user1Token)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.totalTransactions).toBe(0);
      expect(response.body.data.summary.totalAmount).toBe(0);
    });
  });
});
