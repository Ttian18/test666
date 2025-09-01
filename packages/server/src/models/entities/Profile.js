import { PrismaClient } from "@prisma/client";

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();

export default class Profile {
  constructor(data = {}) {
    this.id = data.id;
    this.userId = data.userId;
    this.monthlyBudget = data.monthlyBudget ?? 0;
    this.monthlyIncome = data.monthlyIncome ?? 0;
    this.expensePreferences = data.expensePreferences ?? {};
    this.savingsGoals = data.savingsGoals ?? {};
    this.lifestylePreferences = data.lifestylePreferences ?? {};
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findOne(query) {
    const { userId } = query || {};
    if (!userId) return null;

    try {
      const profileData = await prisma.profile.findUnique({
        where: { userId: parseInt(userId) },
      });

      if (!profileData) return null;

      return new Profile(profileData);
    } catch (error) {
      console.error("Error finding profile:", error);
      return null;
    }
  }

  async save() {
    try {
      this.updatedAt = new Date();

      if (this.id) {
        // Update existing profile
        const updatedProfile = await prisma.profile.update({
          where: { id: this.id },
          data: {
            monthlyBudget: this.monthlyBudget,
            monthlyIncome: this.monthlyIncome,
            expensePreferences: this.expensePreferences,
            savingsGoals: this.savingsGoals,
            lifestylePreferences: this.lifestylePreferences,
            updatedAt: this.updatedAt,
          },
        });

        Object.assign(this, updatedProfile);
      } else {
        // Create new profile
        const newProfile = await prisma.profile.create({
          data: {
            userId: this.userId,
            monthlyBudget: this.monthlyBudget,
            monthlyIncome: this.monthlyIncome,
            expensePreferences: this.expensePreferences,
            savingsGoals: this.savingsGoals,
            lifestylePreferences: this.lifestylePreferences,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
          },
        });

        Object.assign(this, newProfile);
      }

      return this;
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }

  populate() {
    return this; // no-op for Prisma
  }

  static async deleteMany() {
    try {
      const result = await prisma.profile.deleteMany();
      return { deletedCount: result.count };
    } catch (error) {
      console.error("Error deleting profiles:", error);
      return { deletedCount: 0 };
    }
  }
}
