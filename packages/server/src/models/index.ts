// Database models
export { default as prisma } from "./database/client.ts";

// Entity models (Note: User model removed - using Prisma User model only)
export { default as Profile } from "./entities/Profile.ts";
export { default as Transaction } from "./entities/Transaction.ts";
export { default as Voucher } from "./entities/Voucher.ts";
// Note: Restaurant model commented out - not in Prisma schema
// export { default as Restaurant } from "./entities/Restaurant.ts";

// Re-export Prisma client for direct database access
export { PrismaClient } from "@prisma/client";
