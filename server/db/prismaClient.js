import { PrismaClient } from "@prisma/client";

let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

prisma = global.__prisma;

export default prisma;
