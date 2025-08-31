import { randomUUID } from "node:crypto";

interface ProfileData {
  userId?: string;
  monthlyBudget?: number;
  monthlyIncome?: number;
  expensePreferences?: string[];
  savingsGoals?: string[];
  lifestylePreferences?: Record<string, any>;
}

interface ProfileQuery {
  userId?: string;
}

const profiles: Profile[] = [];

export default class Profile {
  public _id: string;
  public userId?: string;
  public monthlyBudget: number;
  public monthlyIncome: number;
  public expensePreferences: string[];
  public savingsGoals: string[];
  public lifestylePreferences: Record<string, any>;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: ProfileData = {}) {
    this._id = randomUUID();
    this.userId = data.userId;
    this.monthlyBudget = data.monthlyBudget ?? 0;
    this.monthlyIncome = data.monthlyIncome ?? 0;
    this.expensePreferences = data.expensePreferences ?? [];
    this.savingsGoals = data.savingsGoals ?? [];
    this.lifestylePreferences = data.lifestylePreferences ?? {};
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static async findOne(query: ProfileQuery): Promise<Profile | null> {
    const { userId } = query || {};
    if (!userId) return null;
    return profiles.find((p) => p.userId === userId) || null;
  }

  async save(): Promise<Profile> {
    this.updatedAt = new Date();
    const idx = profiles.findIndex((p) => p._id === this._id);
    if (idx >= 0) profiles[idx] = this;
    else profiles.push(this);
    return this;
  }

  populate(): Profile {
    return this; // no-op for in-memory stub
  }

  static async deleteMany(): Promise<{ deletedCount: number }> {
    profiles.length = 0; // Clear the array
    return { deletedCount: profiles.length };
  }
}
