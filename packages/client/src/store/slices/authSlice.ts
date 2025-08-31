import { StateCreator } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  preferences: {
    dietaryRestrictions: string[];
    cuisinePreferences: string[];
    maxCaloriesPerMeal: number;
    allergies: string[];
  };
}

export interface AuthSlice {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const createAuthSlice: StateCreator<
  any,
  any,
  any,
  AuthSlice
> = (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isOnboardingComplete: false,

  // Actions
  login: async (email: string, password: string) => {
    set((state: any) => {
      state.isLoading = true;
    });

    try {
      // Mock login - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@mealmint.ai' && password === 'demo123') {
        const user: User = {
          id: 'demo-user-123',
          email,
          name: email.split('@')[0],
          avatar: undefined,
          createdAt: new Date(),
          preferences: {
            dietaryRestrictions: [],
            cuisinePreferences: ['Italian', 'Asian'],
            maxCaloriesPerMeal: 800,
            allergies: [],
          },
        };

        set((state: any) => {
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.isOnboardingComplete = true;
        });

        return { success: true };
      } else {
        set((state: any) => {
          state.isLoading = false;
        });
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      set((state: any) => {
        state.isLoading = false;
      });
      return { success: false, error: 'Login failed' };
    }
  },

  logout: () => {
    set((state: any) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isOnboardingComplete = false;
    });
  },

  updateUser: (userData: Partial<User>) => {
    set((state: any) => {
      if (state.user) {
        state.user = { ...state.user, ...userData };
      }
    });
  },

  setOnboardingComplete: (complete: boolean) => {
    set((state: any) => {
      state.isOnboardingComplete = complete;
    });
  },

  setLoading: (loading: boolean) => {
    set((state: any) => {
      state.isLoading = loading;
    });
  },
});
