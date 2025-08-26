import { StateCreator } from 'zustand';

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  icon: string;
  isActive: boolean;
}

export interface BudgetProgress {
  totalBudget: number;
  totalSpent: number;
  remainingAmount: number;
  percentageUsed: number;
  daysLeftInMonth: number;
  dailyAverageSpending: number;
  projectedEndOfMonthSpending: number;
  isOnTrack: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface BudgetSlice {
  // State
  monthlyBudget: number;
  budgetCategories: BudgetCategory[];
  budgetProgress: BudgetProgress;
  savingsGoal: SavingsGoal | null;
  remainingBudget: number;
  budgetAlerts: string[];
  
  // Actions
  setBudget: (amount: number) => void;
  updateBudgetCategory: (categoryId: string, updates: Partial<BudgetCategory>) => void;
  addBudgetCategory: (category: Omit<BudgetCategory, 'id'>) => void;
  removeBudgetCategory: (categoryId: string) => void;
  setSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsProgress: (amount: number) => void;
  calculateBudgetProgress: () => void;
  generateBudgetAlerts: () => void;
}

export const createBudgetSlice: StateCreator<
  any,
  any,
  any,
  BudgetSlice
> = (set, get) => ({
  // Initial state
  monthlyBudget: 2000,
  budgetCategories: [
    {
      id: 'food-dining',
      name: 'Food & Dining',
      limit: 600,
      spent: 450,
      color: '#8B5CF6',
      icon: '🍽️',
      isActive: true,
    },
    {
      id: 'transportation',
      name: 'Transportation',
      limit: 300,
      spent: 220,
      color: '#10B981',
      icon: '🚗',
      isActive: true,
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      limit: 200,
      spent: 150,
      color: '#F59E0B',
      icon: '🎬',
      isActive: true,
    },
    {
      id: 'shopping',
      name: 'Shopping',
      limit: 400,
      spent: 320,
      color: '#EF4444',
      icon: '🛍️',
      isActive: true,
    },
  ],
  budgetProgress: {
    totalBudget: 2000,
    totalSpent: 1140,
    remainingAmount: 860,
    percentageUsed: 57,
    daysLeftInMonth: 15,
    dailyAverageSpending: 76,
    projectedEndOfMonthSpending: 1900,
    isOnTrack: true,
  },
  savingsGoal: {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 3500,
    deadline: new Date('2024-12-31'),
    priority: 'high',
    category: 'Emergency',
  },
  remainingBudget: 860,
  budgetAlerts: [],

  // Actions
  setBudget: (amount) => {
    set((state: any) => {
      state.monthlyBudget = amount;
    });
    get().calculateBudgetProgress();
  },

  updateBudgetCategory: (categoryId, updates) => {
    set((state: any) => {
      const index = state.budgetCategories.findIndex(
        (cat: BudgetCategory) => cat.id === categoryId
      );
      if (index !== -1) {
        state.budgetCategories[index] = {
          ...state.budgetCategories[index],
          ...updates,
        };
      }
    });
    get().calculateBudgetProgress();
  },

  addBudgetCategory: (category) => {
    const newCategory: BudgetCategory = {
      ...category,
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    set((state: any) => {
      state.budgetCategories.push(newCategory);
    });
    get().calculateBudgetProgress();
  },

  removeBudgetCategory: (categoryId) => {
    set((state: any) => {
      state.budgetCategories = state.budgetCategories.filter(
        (cat: BudgetCategory) => cat.id !== categoryId
      );
    });
    get().calculateBudgetProgress();
  },

  setSavingsGoal: (goal) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    set((state: any) => {
      state.savingsGoal = newGoal;
    });
  },

  updateSavingsProgress: (amount) => {
    set((state: any) => {
      if (state.savingsGoal) {
        state.savingsGoal.currentAmount = Math.max(0, state.savingsGoal.currentAmount + amount);
      }
    });
  },

  calculateBudgetProgress: () => {
    const { monthlyBudget, budgetCategories } = get();
    
    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeftInMonth = daysInMonth - dayOfMonth;
    
    // Calculate totals
    const totalSpent = budgetCategories.reduce(
      (sum: number, cat: BudgetCategory) => sum + (cat.isActive ? cat.spent : 0), 
      0
    );
    const remainingAmount = monthlyBudget - totalSpent;
    const percentageUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
    
    // Calculate spending patterns
    const dailyAverageSpending = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
    const projectedEndOfMonthSpending = dailyAverageSpending * daysInMonth;
    const isOnTrack = projectedEndOfMonthSpending <= monthlyBudget;
    
    const budgetProgress: BudgetProgress = {
      totalBudget: monthlyBudget,
      totalSpent,
      remainingAmount,
      percentageUsed,
      daysLeftInMonth,
      dailyAverageSpending,
      projectedEndOfMonthSpending,
      isOnTrack,
    };
    
    set((state: any) => {
      state.budgetProgress = budgetProgress;
      state.remainingBudget = remainingAmount;
    });
    
    get().generateBudgetAlerts();
  },

  generateBudgetAlerts: () => {
    const { budgetProgress, budgetCategories } = get();
    const alerts: string[] = [];
    
    // Overall budget alerts
    if (budgetProgress.percentageUsed > 90) {
      alerts.push('⚠️ You\'ve used 90% of your monthly budget!');
    } else if (budgetProgress.percentageUsed > 75) {
      alerts.push('📊 You\'ve used 75% of your monthly budget');
    }
    
    if (!budgetProgress.isOnTrack) {
      const overage = budgetProgress.projectedEndOfMonthSpending - budgetProgress.totalBudget;
      alerts.push(`📈 You're projected to overspend by $${overage.toFixed(2)} this month`);
    }
    
    // Category-specific alerts
    budgetCategories.forEach((category: BudgetCategory) => {
      const categoryPercentage = category.limit > 0 ? (category.spent / category.limit) * 100 : 0;
      
      if (categoryPercentage > 100) {
        alerts.push(`🚨 ${category.name} budget exceeded by $${(category.spent - category.limit).toFixed(2)}`);
      } else if (categoryPercentage > 90) {
        alerts.push(`⚠️ ${category.name} budget is 90% used`);
      }
    });
    
    // Savings goal alerts
    const { savingsGoal } = get();
    if (savingsGoal) {
      const daysUntilDeadline = Math.ceil(
        (savingsGoal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const remainingAmount = savingsGoal.targetAmount - savingsGoal.currentAmount;
      
      if (daysUntilDeadline <= 30 && remainingAmount > 0) {
        const dailyRequirement = remainingAmount / daysUntilDeadline;
        alerts.push(`💰 Save $${dailyRequirement.toFixed(2)}/day to reach your ${savingsGoal.name} goal`);
      }
    }
    
    set((state: any) => {
      state.budgetAlerts = alerts;
    });
  },
});
