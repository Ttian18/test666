import { StateCreator } from 'zustand';

export interface NotificationSettings {
  budgetAlerts: boolean;
  spendingReminders: boolean;
  mealRecommendations: boolean;
  weeklyReports: boolean;
  savingsGoalUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  personalizedAds: boolean;
  locationTracking: boolean;
  dataRetention: '1month' | '6months' | '1year' | '2years';
}

export interface AppSettings {
  language: string;
  timeZone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: 'US' | 'EU' | 'UK';
  autoSync: boolean;
  offlineMode: boolean;
  developerMode: boolean;
}

export interface SettingsSlice {
  // State
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  appSettings: AppSettings;
  
  // Actions
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateCurrency: (currency: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const defaultNotificationSettings: NotificationSettings = {
  budgetAlerts: true,
  spendingReminders: true,
  mealRecommendations: true,
  weeklyReports: true,
  savingsGoalUpdates: true,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
};

const defaultPrivacySettings: PrivacySettings = {
  shareAnalytics: false,
  personalizedAds: false,
  locationTracking: true,
  dataRetention: '1year',
};

const defaultAppSettings: AppSettings = {
  language: 'en',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  numberFormat: 'US',
  autoSync: true,
  offlineMode: false,
  developerMode: false,
};

export const createSettingsSlice: StateCreator<
  any,
  any,
  any,
  SettingsSlice
> = (set, get) => ({
  // Initial state
  theme: 'system',
  currency: 'USD',
  notificationSettings: defaultNotificationSettings,
  privacySettings: defaultPrivacySettings,
  appSettings: defaultAppSettings,

  // Actions
  updateTheme: (theme) => {
    set((state: any) => {
      state.theme = theme;
    });
    
    // Apply theme to document
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  },

  updateCurrency: (currency) => {
    set((state: any) => {
      state.currency = currency;
    });
  },

  updateNotificationSettings: (settings) => {
    set((state: any) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...settings,
      };
    });
  },

  updatePrivacySettings: (settings) => {
    set((state: any) => {
      state.privacySettings = {
        ...state.privacySettings,
        ...settings,
      };
    });
  },

  updateAppSettings: (settings) => {
    set((state: any) => {
      state.appSettings = {
        ...state.appSettings,
        ...settings,
      };
    });
  },

  resetToDefaults: () => {
    set((state: any) => {
      state.theme = 'system';
      state.currency = 'USD';
      state.notificationSettings = defaultNotificationSettings;
      state.privacySettings = defaultPrivacySettings;
      state.appSettings = defaultAppSettings;
    });
  },

  exportSettings: () => {
    const { theme, currency, notificationSettings, privacySettings, appSettings } = get();
    
    const settingsData = {
      theme,
      currency,
      notificationSettings,
      privacySettings,
      appSettings,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    return JSON.stringify(settingsData, null, 2);
  },

  importSettings: (settingsJson) => {
    try {
      const settingsData = JSON.parse(settingsJson);
      
      // Validate the imported data
      if (!settingsData.version || settingsData.version !== '1.0') {
        console.warn('Settings version mismatch');
        return false;
      }
      
      // Apply settings safely
      if (settingsData.theme) {
        get().updateTheme(settingsData.theme);
      }
      
      if (settingsData.currency) {
        get().updateCurrency(settingsData.currency);
      }
      
      if (settingsData.notificationSettings) {
        get().updateNotificationSettings(settingsData.notificationSettings);
      }
      
      if (settingsData.privacySettings) {
        get().updatePrivacySettings(settingsData.privacySettings);
      }
      
      if (settingsData.appSettings) {
        get().updateAppSettings(settingsData.appSettings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  },
});
