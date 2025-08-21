import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Voucher {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.image_path = data.image_path;
    this.parsed_data = data.parsed_data;
    this.timestamp = data.timestamp;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new voucher
  static async create(voucherData) {
    try {
      const voucher = await prisma.voucher.create({
        data: voucherData,
      });
      return new Voucher(voucher);
    } catch (error) {
      throw new Error(`Failed to create voucher: ${error.message}`);
    }
  }

  // Find voucher by ID
  static async findById(id) {
    try {
      const voucher = await prisma.voucher.findUnique({
        where: { id: parseInt(id) },
      });
      return voucher ? new Voucher(voucher) : null;
    } catch (error) {
      throw new Error(`Failed to find voucher: ${error.message}`);
    }
  }

  // Find vouchers by user ID
  static async findByUserId(userId, options = {}) {
    try {
      const { orderBy = { timestamp: "desc" }, take, skip } = options;
      const vouchers = await prisma.voucher.findMany({
        where: { user_id: parseInt(userId) },
        orderBy,
        take,
        skip,
      });
      return vouchers.map((v) => new Voucher(v));
    } catch (error) {
      throw new Error(`Failed to find vouchers: ${error.message}`);
    }
  }

  // Update voucher
  async update(updateData) {
    try {
      const updated = await prisma.voucher.update({
        where: { id: this.id },
        data: updateData,
      });
      Object.assign(this, updated);
      return this;
    } catch (error) {
      throw new Error(`Failed to update voucher: ${error.message}`);
    }
  }

  // Delete voucher
  async delete() {
    try {
      await prisma.voucher.delete({
        where: { id: this.id },
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete voucher: ${error.message}`);
    }
  }

  // Get voucher statistics
  static async getStats(userId) {
    try {
      const stats = await prisma.voucher.groupBy({
        by: ["timestamp"],
        where: { user_id: parseInt(userId) },
        _count: {
          id: true,
        },
      });
      return stats;
    } catch (error) {
      throw new Error(`Failed to get voucher stats: ${error.message}`);
    }
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      image_path: this.image_path,
      parsed_data: this.parsed_data,
      timestamp: this.timestamp,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

export default Voucher;
