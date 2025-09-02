import prisma from "../database/client.ts";
import type { Prisma } from "@prisma/client";

interface TransactionData {
  id?: number;
  user_id?: number;
  date?: Date;
  amount?: number;
  category?: string;
  merchant?: string;
  source?: string;
  receipt_img?: string | null;
  merchant_category?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface TransactionFindOptions {
  orderBy?: { [key: string]: string };
  take?: number;
  skip?: number;
}

class Transaction {
  public id?: number;
  public user_id?: number;
  public date?: Date;
  public amount?: number;
  public category?: string;
  public merchant?: string;
  public source?: string;
  public receipt_img?: string | null;
  public merchant_category?: string | null;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(data: TransactionData = {}) {
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
  static async create(
    transactionData: Prisma.TransactionCreateInput
  ): Promise<Transaction> {
    try {
      const transaction = await prisma.transaction.create({
        data: transactionData,
      });
      return new Transaction(transaction);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to create transaction: ${errorMessage}`);
    }
  }

  // Find transaction by ID
  static async findById(id: string | number): Promise<Transaction | null> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: parseInt(String(id)) },
      });
      return transaction ? new Transaction(transaction) : null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to find transaction: ${errorMessage}`);
    }
  }

  // Find transactions by user ID
  static async findByUserId(
    userId: string | number,
    options: TransactionFindOptions = {}
  ): Promise<Transaction[]> {
    try {
      const { orderBy = { date: "desc" }, take, skip } = options;
      const transactions = await prisma.transaction.findMany({
        where: { user_id: parseInt(String(userId)) },
        orderBy,
        take,
        skip,
      });
      return transactions.map((t) => new Transaction(t));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to find transactions: ${errorMessage}`);
    }
  }

  // Update transaction
  async update(updateData: Partial<TransactionData>): Promise<Transaction> {
    try {
      const updated = await prisma.transaction.update({
        where: { id: this.id },
        data: updateData,
      });
      Object.assign(this, updated);
      return this;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to update transaction: ${errorMessage}`);
    }
  }

  // Delete transaction
  async delete(): Promise<boolean> {
    try {
      await prisma.transaction.delete({
        where: { id: this.id },
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete transaction: ${errorMessage}`);
    }
  }

  // Get transaction statistics
  static async getStats(userId: string | number): Promise<any[]> {
    try {
      const stats = await prisma.transaction.groupBy({
        by: ["category"],
        where: { user_id: parseInt(String(userId)) },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });
      return stats;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get transaction stats: ${errorMessage}`);
    }
  }

  // Convert to plain object
  toJSON(): TransactionData {
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
