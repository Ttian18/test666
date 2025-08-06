import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password: hashedPassword,
      name: "Test User",
      profile: {
        create: {
          avatar: "https://via.placeholder.com/150",
          preferences: {
            cuisine: ["Italian", "Japanese", "Mexican"],
            priceRange: "medium",
            dietaryRestrictions: [],
          },
        },
      },
    },
  });

  console.log("✅ Created test user:", user.email);

  // Create sample restaurants
  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        name: "Pizza Palace",
        address: "123 Main St, Downtown",
        cuisine: "Italian",
        rating: 4.5,
        priceRange: "medium",
        imageUrl: "https://via.placeholder.com/300x200",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Sushi Master",
        address: "456 Oak Ave, Midtown",
        cuisine: "Japanese",
        rating: 4.8,
        priceRange: "high",
        imageUrl: "https://via.placeholder.com/300x200",
      },
    }),
    prisma.restaurant.create({
      data: {
        name: "Taco Fiesta",
        address: "789 Pine St, Uptown",
        cuisine: "Mexican",
        rating: 4.2,
        priceRange: "low",
        imageUrl: "https://via.placeholder.com/300x200",
      },
    }),
  ]);

  console.log(
    "✅ Created restaurants:",
    restaurants.map((r) => r.name)
  );

  // Create sample transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 25.5,
        description: "Dinner at Pizza Palace",
        category: "Food & Dining",
        restaurant: "Pizza Palace",
        date: new Date("2024-01-15"),
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 45.0,
        description: "Lunch at Sushi Master",
        category: "Food & Dining",
        restaurant: "Sushi Master",
        date: new Date("2024-01-16"),
      },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount: 12.75,
        description: "Quick bite at Taco Fiesta",
        category: "Food & Dining",
        restaurant: "Taco Fiesta",
        date: new Date("2024-01-17"),
      },
    }),
  ]);

  console.log("✅ Created transactions:", transactions.length);

  // Create sample menu items
  const menuItems = await Promise.all([
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id, // Pizza Palace
        name: "Margherita Pizza",
        description: "Classic tomato and mozzarella pizza",
        price: 18.99,
        category: "Pizza",
        imageUrl: "https://via.placeholder.com/200x150",
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id, // Sushi Master
        name: "California Roll",
        description: "Crab, avocado, and cucumber roll",
        price: 12.99,
        category: "Rolls",
        imageUrl: "https://via.placeholder.com/200x150",
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id, // Taco Fiesta
        name: "Street Tacos",
        description: "Three authentic street tacos",
        price: 8.99,
        category: "Tacos",
        imageUrl: "https://via.placeholder.com/200x150",
      },
    }),
  ]);

  console.log("✅ Created menu items:", menuItems.length);

  // Create sample recommendations
  const recommendations = await Promise.all([
    prisma.recommendation.create({
      data: {
        userId: user.id,
        restaurantId: restaurants[0].id,
        score: 0.85,
        reason: "Based on your preference for Italian cuisine",
      },
    }),
    prisma.recommendation.create({
      data: {
        userId: user.id,
        restaurantId: restaurants[1].id,
        score: 0.92,
        reason: "High rating and matches your taste profile",
      },
    }),
  ]);

  console.log("✅ Created recommendations:", recommendations.length);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
