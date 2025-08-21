import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Transaction {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.date = data.date;
    this.amount = data.amount;
    this.category = data.category;
    this.merchant = data.merchant;
    this.source = data.source;
    this.receipt_img = data.receipt_img;
    this.merchant_category = data.merchant_category;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new transaction
  static async create(transactionData) {
    try {
      const transaction = await prisma.transaction.create({
        data: transactionData,
      });
      return new Transaction(transaction);
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  // Find transaction by ID
  static async findById(id) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(id) },
      });
      return transaction ? new Transaction(transaction) : null;
    } catch (error) {
      throw new Error(`Failed to find transaction: ${error.message}`);
    }
  }

  // Find transactions by user ID
  static async findByUserId(userId, options = {}) {
    try {
      const { orderBy = { date: "desc" }, take, skip } = options;
      const transactions = await prisma.transaction.findMany({
        where: { user_id: parseInt(userId) },
        orderBy,
        take,
        skip,
      });
      return transactions.map((t) => new Transaction(t));
    } catch (error) {
      throw new Error(`Failed to find transactions: ${error.message}`);
    }
  }

  // Update transaction
  async update(updateData) {
    try {
      const updated = await prisma.transaction.update({
        where: { id: this.id },
        data: updateData,
      });
      Object.assign(this, updated);
      return this;
    } catch (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
  }

  // Delete transaction
  async delete() {
    try {
      await prisma.transaction.delete({
        where: { id: this.id },
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  // Get transaction statistics
  static async getStats(userId) {
    try {
      const stats = await prisma.transaction.groupBy({
        by: ["category"],
        where: { user_id: parseInt(userId) },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });
      return stats;
    } catch (error) {
      throw new Error(`Failed to get transaction stats: ${error.message}`);
    }
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      date: this.date,
      amount: this.amount,
      category: this.category,
      merchant: this.merchant,
      source: this.source,
      receipt_img: this.receipt_img,
      merchant_category: this.merchant_category,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

export default Transaction;
