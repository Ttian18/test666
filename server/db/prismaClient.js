import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

let prisma;

  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
prisma = global.__prisma;

export default prisma;
