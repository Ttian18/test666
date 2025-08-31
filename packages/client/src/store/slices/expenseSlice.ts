import { StateCreator } from 'zustand';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  location?: string;
  tags: string[];
  receiptUrl?: string;
  paymentMethod: 'cash' | 'card' | 'digital';
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpensesByCategory {
  [category: string]: {
    total: number;
    count: number;
    expenses: Expense[];
  };
}

export interface MonthlySpending {
  total: number;
  byCategory: { [category: string]: number };
  byDay: { [day: string]: number };
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
}

export interface ExpenseSlice {
  // State
  expenses: Expense[];
  recentExpenses: Expense[];
  expensesByCategory: ExpensesByCategory;
  monthlySpending: MonthlySpending;
  isLoadingExpenses: boolean;
  
  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];
  calculateMonthlySpending: () => void;
  importExpensesFromCSV: (csvData: string) => Promise<void>;
  syncExpensesWithCloud: () => Promise<void>;
}

export const createExpenseSlice: StateCreator<
  any,
  any,
  any,
  ExpenseSlice
> = (set, get) => ({
  // Initial state
  expenses: [],
  recentExpenses: [],
  expensesByCategory: {},
  monthlySpending: {
    total: 0,
    byCategory: {},
    byDay: {},
    trend: 'stable',
    percentageChange: 0,
  },
  isLoadingExpenses: false,

  // Actions
  addExpense: (expenseData) => {
    const expense: Expense = {
      ...expenseData,
      id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state: any) => {
      state.expenses.push(expense);
      state.recentExpenses = [expense, ...state.recentExpenses.slice(0, 9)];
    });

    // Recalculate derived data
    get().calculateMonthlySpending();
  },

  updateExpense: (id, expenseData) => {
    set((state: any) => {
      const index = state.expenses.findIndex((exp: Expense) => exp.id === id);
      if (index !== -1) {
        state.expenses[index] = {
          ...state.expenses[index],
          ...expenseData,
          updatedAt: new Date(),
        };
        
        // Update recent expenses if it's in there
        const recentIndex = state.recentExpenses.findIndex((exp: Expense) => exp.id === id);
        if (recentIndex !== -1) {
          state.recentExpenses[recentIndex] = state.expenses[index];
        }
      }
    });

    get().calculateMonthlySpending();
  },

  deleteExpense: (id) => {
    set((state: any) => {
      state.expenses = state.expenses.filter((exp: Expense) => exp.id !== id);
      state.recentExpenses = state.recentExpenses.filter((exp: Expense) => exp.id !== id);
    });

    get().calculateMonthlySpending();
  },

  getExpensesByDateRange: (startDate, endDate) => {
    const { expenses } = get();
    return expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  },

  calculateMonthlySpending: () => {
    const { expenses } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyExpenses = expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });

    const total = monthlyExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    
    const byCategory: { [category: string]: number } = {};
    const byDay: { [day: string]: number } = {};
    const expensesByCategory: ExpensesByCategory = {};

    monthlyExpenses.forEach((expense: Expense) => {
      // By category
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
      
      // By day
      const day = expense.date.toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + expense.amount;
      
      // Expenses by category with details
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = {
          total: 0,
          count: 0,
          expenses: [],
        };
      }
      expensesByCategory[expense.category].total += expense.amount;
      expensesByCategory[expense.category].count += 1;
      expensesByCategory[expense.category].expenses.push(expense);
    });

    // Calculate trend (simplified)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const previousMonthExpenses = expenses.filter((expense: Expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= previousMonth && expenseDate <= endOfPreviousMonth;
    });
    
    const previousTotal = previousMonthExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    const percentageChange = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;
    const trend = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable';

    set((state: any) => {
      state.monthlySpending = {
        total,
        byCategory,
        byDay,
        trend,
        percentageChange,
      };
      state.expensesByCategory = expensesByCategory;
    });
  },

  importExpensesFromCSV: async (csvData) => {
    set((state: any) => {
      state.isLoadingExpenses = true;
    });

    try {
      // Mock CSV import - implement actual parsing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Parse CSV and add expenses
      // This is a simplified example
      const lines = csvData.split('\n').slice(1); // Skip header
      const importedExpenses: Expense[] = [];
      
      lines.forEach((line, index) => {
        const [amount, category, description, date] = line.split(',');
        if (amount && category && description && date) {
          importedExpenses.push({
            id: `imported_${Date.now()}_${index}`,
            amount: parseFloat(amount),
            category: category.trim(),
            description: description.trim(),
            date: new Date(date.trim()),
            tags: [],
            paymentMethod: 'card',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });

      set((state: any) => {
        state.expenses.push(...importedExpenses);
      });

      get().calculateMonthlySpending();
    } finally {
      set((state: any) => {
        state.isLoadingExpenses = false;
      });
    }
  },

  syncExpensesWithCloud: async () => {
    // Mock cloud sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Implement actual cloud sync logic
  },
});
