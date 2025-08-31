import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface VoucherData {
  id?: number;
  user_id?: number;
  image_path?: string;
  parsed_data?: any;
  timestamp?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface VoucherFindOptions {
  orderBy?: { [key: string]: string };
  take?: number;
  skip?: number;
}

class Voucher {
  public id?: number;
  public user_id?: number;
  public image_path?: string;
  public parsed_data?: any;
  public timestamp?: Date;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(data: VoucherData = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.image_path = data.image_path;
    this.parsed_data = data.parsed_data;
    this.timestamp = data.timestamp;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new voucher
  static async create(voucherData: Prisma.VoucherCreateInput): Promise<Voucher> {
    try {
      const voucher = await prisma.voucher.create({
        data: voucherData,
      });
      return new Voucher(voucher);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create voucher: ${errorMessage}`);
    }
  }

  // Find voucher by ID
  static async findById(id: string | number): Promise<Voucher | null> {
    try {
      const voucher = await prisma.voucher.findUnique({
        where: { id: parseInt(String(id)) },
      });
      return voucher ? new Voucher(voucher) : null;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find voucher: ${errorMessage}`);
    }
  }

  // Find vouchers by user ID
  static async findByUserId(userId: string | number, options: VoucherFindOptions = {}): Promise<Voucher[]> {
    try {
      const { orderBy = { timestamp: "desc" }, take, skip } = options;
      const vouchers = await prisma.voucher.findMany({
        where: { user_id: parseInt(String(userId)) },
        orderBy,
        take,
        skip,
      });
      return vouchers.map((v) => new Voucher(v));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to find vouchers: ${errorMessage}`);
    }
  }

  // Update voucher
  async update(updateData: Partial<VoucherData>): Promise<Voucher> {
    try {
      const updated = await prisma.voucher.update({
        where: { id: this.id },
        data: updateData,
      });
      Object.assign(this, updated);
      return this;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update voucher: ${errorMessage}`);
    }
  }

  // Delete voucher
  async delete(): Promise<boolean> {
    try {
      await prisma.voucher.delete({
        where: { id: this.id },
      });
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete voucher: ${errorMessage}`);
    }
  }

  // Get voucher statistics
  static async getStats(userId: string | number): Promise<any[]> {
    try {
      const stats = await prisma.voucher.groupBy({
        by: ["timestamp"],
        where: { user_id: parseInt(String(userId)) },
        _count: {
          id: true,
        },
      });
      return stats;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get voucher stats: ${errorMessage}`);
    }
  }

  // Convert to plain object
  toJSON(): VoucherData {
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
