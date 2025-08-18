import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log("👤 Creating test user...");

    const testUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
      },
    });

    console.log(`✅ Test user created successfully!`);
    console.log(`   ID: ${testUser.id}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);

    return testUser;
  } catch (error) {
    if (error.code === "P2002") {
      console.log("ℹ️  Test user already exists, fetching existing user...");
      const existingUser = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      console.log(`✅ Found existing user: ID ${existingUser.id}`);
      return existingUser;
    } else {
      console.error("❌ Error creating test user:", error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
