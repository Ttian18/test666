import * as transactionService from "../../src/services/transaction/transactionService.js";

describe("TransactionService", () => {
  let testUser1, testUser2;

  beforeEach(async () => {
    // Clean up before each test
    await global.testDb.cleanup();

    // Create test users
    testUser1 = await global.testDb.createUser({
      email: "user1@test.com",
      name: "User 1",
    });
    testUser2 = await global.testDb.createUser({
      email: "user2@test.com",
      name: "User 2",
    });
  });

  describe("User Isolation Tests", () => {
    test("getAllTransactions should only return user-specific transactions", async () => {
      // Create transactions for both users
      await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        merchant: "User 1 Store",
      });
      await global.testDb.createTransaction(testUser2.id, {
        amount: 200,
        merchant: "User 2 Store",
      });

      // Get transactions for user 1
      const user1Transactions = await transactionService.getAllTransactions(
        testUser1.id
      );

      // Should only see user 1's transaction
      expect(user1Transactions).toHaveLength(1);
      expect(user1Transactions[0].merchant).toBe("User 1 Store");
      expect(user1Transactions[0].user_id).toBe(testUser1.id);
    });

    test("getTransactionById should not allow cross-user access", async () => {
      // Create transaction for user 2
      const user2Transaction = await global.testDb.createTransaction(
        testUser2.id,
        {
          amount: 300,
          merchant: "User 2 Private Store",
        }
      );

      // Try to access user 2's transaction with user 1's ID
      const result = await transactionService.getTransactionById(
        testUser1.id,
        user2Transaction.id
      );

      // Should return null (not found for this user)
      expect(result).toBeNull();
    });

    test("updateTransaction should not allow cross-user updates", async () => {
      // Create transaction for user 2
      const user2Transaction = await global.testDb.createTransaction(
        testUser2.id,
        {
          amount: 400,
          merchant: "User 2 Store",
        }
      );

      // Try to update user 2's transaction with user 1's ID
      const result = await transactionService.updateTransaction(
        testUser1.id,
        user2Transaction.id,
        { merchant: "Hacked by User 1" }
      );

      // Should return null (not found for this user)
      expect(result).toBeNull();

      // Verify original transaction is unchanged
      const originalTransaction = await global.prisma.transaction.findUnique({
        where: { id: user2Transaction.id },
      });
      expect(originalTransaction.merchant).toBe("User 2 Store");
    });

    test("deleteTransaction should not allow cross-user deletion", async () => {
      // Create transaction for user 2
      const user2Transaction = await global.testDb.createTransaction(
        testUser2.id,
        {
          amount: 500,
          merchant: "User 2 Important Store",
        }
      );

      // Try to delete user 2's transaction with user 1's ID
      const result = await transactionService.deleteTransaction(
        testUser1.id,
        user2Transaction.id
      );

      // Should return false (not deleted)
      expect(result).toBe(false);

      // Verify transaction still exists
      const stillExists = await global.prisma.transaction.findUnique({
        where: { id: user2Transaction.id },
      });
      expect(stillExists).toBeTruthy();
    });
  });

  describe("Input Validation Tests", () => {
    test("should reject invalid user ID", async () => {
      await expect(
        transactionService.getAllTransactions("invalid")
      ).rejects.toThrow("Valid user ID (integer) is required");

      await expect(transactionService.getAllTransactions(null)).rejects.toThrow(
        "Valid user ID (integer) is required"
      );
    });

    test("createTransaction should validate required fields", async () => {
      await expect(
        transactionService.createTransaction(testUser1.id, {})
      ).rejects.toThrow("Missing required field");

      await expect(
        transactionService.createTransaction(testUser1.id, {
          amount: 100,
          // missing category, date, merchant
        })
      ).rejects.toThrow("Missing required field");
    });
  });

  describe("Statistics Tests", () => {
    test("getTransactionStats should be user-scoped", async () => {
      // Create different amounts for each user
      await global.testDb.createTransaction(testUser1.id, { amount: 100 });
      await global.testDb.createTransaction(testUser1.id, { amount: 200 });
      await global.testDb.createTransaction(testUser2.id, { amount: 1000 });

      const user1Stats = await transactionService.getTransactionStats(
        testUser1.id
      );

      expect(user1Stats.totalTransactions).toBe(2);
      expect(user1Stats.totalAmount).toBe(300);
      expect(user1Stats.averageAmount).toBe(150);
    });

    test("getTransactionsByCategory should be user-scoped", async () => {
      // Create Food transactions for both users
      await global.testDb.createTransaction(testUser1.id, {
        category: "Food",
        amount: 50,
      });
      await global.testDb.createTransaction(testUser2.id, {
        category: "Food",
        amount: 100,
      });

      const user1FoodTransactions =
        await transactionService.getTransactionsByCategory(
          testUser1.id,
          "Food"
        );

      expect(user1FoodTransactions).toHaveLength(1);
      expect(user1FoodTransactions[0].amount).toBe(50);
      expect(user1FoodTransactions[0].user_id).toBe(testUser1.id);
    });
  });

  describe("CRUD Operations Tests", () => {
    test("createTransaction should create with correct user_id", async () => {
      const transactionData = {
        amount: 75.25,
        category: "Shopping",
        date: new Date(),
        merchant: "Test Store",
        source: "manual",
      };

      const created = await transactionService.createTransaction(
        testUser1.id,
        transactionData
      );

      expect(created.user_id).toBe(testUser1.id);
      expect(created.amount).toBe(75.25);
      expect(created.merchant).toBe("Test Store");
    });

    test("updateTransaction should maintain user_id", async () => {
      const transaction = await global.testDb.createTransaction(testUser1.id, {
        amount: 100,
        merchant: "Original Store",
      });

      const updated = await transactionService.updateTransaction(
        testUser1.id,
        transaction.id,
        {
          merchant: "Updated Store",
          amount: 150,
        }
      );

      expect(updated.user_id).toBe(testUser1.id); // Should not change
      expect(updated.merchant).toBe("Updated Store");
      expect(updated.amount).toBe(150);
    });
  });
});
