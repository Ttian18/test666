import * as insightsService from "../../src/services/transaction/insightsService.js";

describe("InsightsService", () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    await global.testDb.cleanup();

    testUser1 = await global.testDb.createUser({
      email: "insights1@test.com",
      name: "Insights User 1",
    });
    testUser2 = await global.testDb.createUser({
      email: "insights2@test.com",
      name: "Insights User 2",
    });
  });

  describe("User Isolation Tests", () => {
    test("getSpendingSummary should only analyze user-specific data", async () => {
      const now = new Date();

      // Create transactions for user 1
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        category: "Food",
        date: now,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        category: "Shopping",
        date: now,
      });

      // Create transactions for user 2 (should not affect user 1's summary)
      await global.testDb.createTransaction(testUser2.id, {
        amount: 1000,
        category: "Food",
        date: now,
      });

      const user1Summary = await insightsService.getSpendingSummary(
        testUser1.id
      );

      expect(user1Summary.userId).toBe(testUser1.id);
      expect(user1Summary.summary.totalTransactions).toBe(2);
      expect(user1Summary.summary.totalAmount).toBe(300);
      expect(user1Summary.summary.averageAmount).toBe(150);
    });

    test("getCategoryAnalysis should be user-scoped", async () => {
      // Create different category distributions for each user
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        category: "Food",
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 50,
        category: "Food",
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 75,
        category: "Shopping",
      });

      // User 2 has different spending pattern
      await global.testDb.createTransaction(testUser2.id, {
        amount: 500,
        category: "Food",
      });

      const user1Analysis = await insightsService.getCategoryAnalysis(
        testUser1.id
      );

      expect(user1Analysis.userId).toBe(testUser1.id);
      expect(user1Analysis.totalAmount).toBe(225);

      // Find Food category
      const foodCategory = user1Analysis.categories.find(
        (cat) => cat.category === "Food"
      );
      expect(foodCategory.totalAmount).toBe(150); // 100 + 50, not including user 2's 500
      expect(foodCategory.percentage).toBeCloseTo(66.67, 1); // 150/225 * 100
    });

    test("getMerchantAnalysis should be user-scoped", async () => {
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        merchant: "Store A",
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 50,
        merchant: "Store A",
      });
      await global.testDb.createTransaction(testUser2.id, {
        amount: 1000,
        merchant: "Store A",
      });

      const user1Analysis = await insightsService.getMerchantAnalysis(
        testUser1.id
      );

      expect(user1Analysis.userId).toBe(testUser1.id);
      expect(user1Analysis.totalAmount).toBe(150); // Only user 1's transactions

      const storeA = user1Analysis.merchants.find(
        (m) => m.merchant === "Store A"
      );
      expect(storeA.totalAmount).toBe(150); // Not 1150
    });
  });

  describe("Input Validation Tests", () => {
    test("should validate user ID for all functions", async () => {
      const invalidUserIds = [null, undefined, "string", 0, -1];

      for (const invalidId of invalidUserIds) {
        await expect(
          insightsService.getSpendingSummary(invalidId)
        ).rejects.toThrow("Valid user ID (integer) is required");
        await expect(
          insightsService.getCategoryAnalysis(invalidId)
        ).rejects.toThrow("Valid user ID (integer) is required");
        await expect(
          insightsService.getMerchantAnalysis(invalidId)
        ).rejects.toThrow("Valid user ID (integer) is required");
      }
    });

    test("getBudgetAnalysis should validate budget parameter", async () => {
      await expect(
        insightsService.getBudgetAnalysis(testUser1.id, "invalid")
      ).rejects.toThrow("Valid monthly budget (number) is required");

      await expect(
        insightsService.getBudgetAnalysis(testUser1.id, -100)
      ).rejects.toThrow("Valid monthly budget (number) is required");
    });
  });

  describe("Spending Trends Tests", () => {
    test("getSpendingTrends should be user-isolated", async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 15);

      // Create monthly transactions for user 1
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        date: lastMonth,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        date: twoMonthsAgo,
      });

      // Create transactions for user 2 (should not affect trends)
      await global.testDb.createTransaction(testUser2.id, {
        amount: 1000,
        date: lastMonth,
      });
      await global.testDb.createTransaction(testUser2.id, {
        amount: 2000,
        date: twoMonthsAgo,
      });

      const user1Trends = await insightsService.getSpendingTrends(
        testUser1.id,
        {
          period: "monthly",
          periods: 3,
        }
      );

      expect(user1Trends.userId).toBe(testUser1.id);

      // Should only include user 1's data
      const totalInTrends = user1Trends.periodData.reduce(
        (sum, period) => sum + period.totalAmount,
        0
      );
      expect(totalInTrends).toBe(300); // 100 + 200, not including user 2's amounts
    });

    test("should handle invalid period parameter", async () => {
      await expect(
        insightsService.getSpendingTrends(testUser1.id, {
          period: "invalid_period",
        })
      ).rejects.toThrow("Invalid period");
    });
  });

  describe("Budget Analysis Tests", () => {
    test("getBudgetAnalysis should be user-specific", async () => {
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of month

      // User 1 spends $400 this month (40% of budget)
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        date: currentMonth,
      });
      await global.testDb.createTransaction(testUser1.id, {
        amount: 200,
        date: currentMonth,
      });

      // User 2 spends $2000 this month (should not affect user 1's budget analysis)
      await global.testDb.createTransaction(testUser2.id, {
        amount: 2000,
        date: currentMonth,
      });

      const user1Budget = await insightsService.getBudgetAnalysis(
        testUser1.id,
        1000
      );

      expect(user1Budget.userId).toBe(testUser1.id);
      expect(user1Budget.budget).toBe(1000);
      expect(user1Budget.spent).toBe(400); // Only user 1's spending
      expect(user1Budget.remaining).toBe(600);
      expect(user1Budget.status).toBe("on_track");
    });
  });

  describe("Empty Data Handling", () => {
    test("should handle users with no transactions gracefully", async () => {
      const summary = await insightsService.getSpendingSummary(testUser1.id);

      expect(summary.userId).toBe(testUser1.id);
      expect(summary.summary.totalTransactions).toBe(0);
      expect(summary.summary.totalAmount).toBe(0);
      expect(summary.summary.averageAmount).toBe(0);
      expect(summary.periodBreakdown).toEqual([]);
    });

    test("should handle category analysis with no data", async () => {
      const analysis = await insightsService.getCategoryAnalysis(testUser1.id);

      expect(analysis.userId).toBe(testUser1.id);
      expect(analysis.totalAmount).toBe(0);
      expect(analysis.categories).toEqual([]);
    });
  });
});
