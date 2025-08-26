import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ExpenseSlice, createExpenseSlice } from './slices/expenseSlice';
import { BudgetSlice, createBudgetSlice } from './slices/budgetSlice';
import { RecommendationSlice, createRecommendationSlice } from './slices/recommendationSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';

// Combined store type
export type AppStore = AuthSlice & ExpenseSlice & BudgetSlice & RecommendationSlice & SettingsSlice;

// Create the combined store with all slices
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createAuthSlice(...args),
        ...createExpenseSlice(...args),
        ...createBudgetSlice(...args),
        ...createRecommendationSlice(...args),
        ...createSettingsSlice(...args),
      })),
      {
        name: 'meal-mint-store',
        // Only persist certain slices
        partialize: (state) => ({
          // Auth - only persist basic user data, not tokens (they're handled separately)
          user: state.user,
          isOnboardingComplete: state.isOnboardingComplete,
          
          // Budget settings
          monthlyBudget: state.monthlyBudget,
          savingsGoal: state.savingsGoal,
          budgetCategories: state.budgetCategories,
          
          // Preferences
          theme: state.theme,
          currency: state.currency,
          notificationSettings: state.notificationSettings,
          
          // Don't persist sensitive data, temporary states, or computed values
        }),
      }
    ),
    {
      name: 'meal-mint-store',
    }
  )
);

// Selectors for better performance
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}));

export const useExpenses = () => useAppStore((state) => ({
  expenses: state.expenses,
  recentExpenses: state.recentExpenses,
  expensesByCategory: state.expensesByCategory,
  monthlySpending: state.monthlySpending,
  addExpense: state.addExpense,
  updateExpense: state.updateExpense,
  deleteExpense: state.deleteExpense,
  getExpensesByDateRange: state.getExpensesByDateRange,
}));

export const useBudget = () => useAppStore((state) => ({
  monthlyBudget: state.monthlyBudget,
  savingsGoal: state.savingsGoal,
  budgetCategories: state.budgetCategories,
  budgetProgress: state.budgetProgress,
  remainingBudget: state.remainingBudget,
  setBudget: state.setBudget,
  updateBudgetCategory: state.updateBudgetCategory,
  setSavingsGoal: state.setSavingsGoal,
}));

export const useRecommendations = () => useAppStore((state) => ({
  dailyRecommendations: state.dailyRecommendations,
  restaurantRecommendations: state.restaurantRecommendations,
  isLoadingRecommendations: state.isLoadingRecommendations,
  fetchDailyRecommendations: state.fetchDailyRecommendations,
  fetchRestaurantRecommendations: state.fetchRestaurantRecommendations,
  updateRecommendationPreferences: state.updateRecommendationPreferences,
}));

export const useSettings = () => useAppStore((state) => ({
  theme: state.theme,
  currency: state.currency,
  notificationSettings: state.notificationSettings,
  updateTheme: state.updateTheme,
  updateCurrency: state.updateCurrency,
  updateNotificationSettings: state.updateNotificationSettings,
}));
