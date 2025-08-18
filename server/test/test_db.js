import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");
    console.log(
      "📊 Database URL:",
      process.env.DATABASE_URL ? "✅ Set" : "❌ Not set"
    );

    // Test basic connection
    console.log("\n🔄 Testing Prisma connection...");
    await prisma.$connect();
    console.log("✅ Prisma client connected successfully!");

    // Test querying the User table
    console.log("\n👥 Testing User table query...");
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Count: ${userCount}`);

    // Test querying the ZhongcaoResult table
    console.log("\n🍽️ Testing ZhongcaoResult table query...");
    const zhongcaoCount = await prisma.zhongcaoResult.count();
    console.log(`✅ ZhongcaoResult table accessible. Count: ${zhongcaoCount}`);

    // Test creating a test user
    console.log("\n➕ Testing user creation...");
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
      },
    });
    console.log(`✅ Test user created with ID: ${testUser.id}`);

    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log("🧹 Test user cleaned up");

    console.log("\n🎉 All database tests passed!");
  } catch (error) {
    console.error("❌ Database connection test failed:");
    console.error("Error:", error.message);

    if (error.code === "P1001") {
      console.error(
        "💡 This usually means the database server is not running or the connection string is incorrect."
      );
    } else if (error.code === "P2002") {
      console.error("💡 This usually means a unique constraint violation.");
    } else if (error.code === "P2024") {
      console.error("💡 This usually means a connection timeout.");
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Prisma client disconnected");
  }
}

// Run the test
testDatabaseConnection();
