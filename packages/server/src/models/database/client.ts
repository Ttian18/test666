import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

prisma = global.__prisma;

export default prisma;
