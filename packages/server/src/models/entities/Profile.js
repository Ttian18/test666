import { randomUUID } from "node:crypto";

const profiles = [];

export default class Profile {
  constructor(data = {}) {
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

  static async findOne(query) {
    const { userId } = query || {};
    if (!userId) return null;
    return profiles.find((p) => p.userId === userId) || null;
  }

  async save() {
    this.updatedAt = new Date();
    const idx = profiles.findIndex((p) => p._id === this._id);
    if (idx >= 0) profiles[idx] = this;
    else profiles.push(this);
    return this;
  }

  populate() {
    return this; // no-op for in-memory stub
  }
}
