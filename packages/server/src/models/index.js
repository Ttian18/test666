// Database models
export { default as prisma } from "./database/client.js";

// Entity models
export { default as User } from "./entities/User.js";
export { default as Profile } from "./entities/Profile.js";
export { default as Transaction } from "./entities/Transaction.js";
export { default as Voucher } from "./entities/Voucher.js";
export { default as Restaurant } from "./entities/Restaurant.js";

// Re-export Prisma client for direct database access
export { PrismaClient } from "@prisma/client";
