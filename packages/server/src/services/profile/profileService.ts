import { PrismaClient } from "@prisma/client";

const prisma = global.prisma || new PrismaClient();

export interface BasicInfo {
  name: string;
  email: string;
  avatar?: {
    url: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
    fileSize: number;
    mimeType: string;
  };
  phone?: {
    countryCode: string;
    number: string;
    isVerified: boolean;
    verifiedAt?: Date;
  };
  dateOfBirth?: {
    year: number;
    month: number;
    day: number;
    showAge: boolean;
    showBirthday: boolean;
  };
  gender?: {
    value: "male" | "female" | "non_binary" | "prefer_not_to_say";
    isPublic: boolean;
  };
  location?: {
    country: { code: string; name: string };
    state?: { code: string; name: string };
    city: { name: string; coordinates?: { lat: number; lng: number } };
    zipCode?: string;
    timezone: string;
    isPublic: boolean;
  };
  language: {
    primary: string;
    secondary?: string[];
  };
  bio?: {
    content: string;
    lastUpdated: Date;
    isPublic: boolean;
  };
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  profession?: {
    title: string;
    company?: string;
    industry?: string;
    isPublic: boolean;
  };
}

export interface DietaryPreferences {
  restrictions: {
    dietary: Array<{
      type:
        | "vegan"
        | "vegetarian"
        | "pescatarian"
        | "keto"
        | "paleo"
        | "mediterranean";
      strictness: "strict" | "mostly" | "flexible";
      startDate?: Date;
      reason?: string;
    }>;
    allergies: Array<{
      allergen: string;
      severity: "mild" | "moderate" | "severe" | "life_threatening";
      symptoms?: string[];
      confirmedBy: "self_reported" | "doctor_diagnosed";
      diagnosedDate?: Date;
    }>;
    intolerances: Array<{
      substance: string;
      symptoms: string[];
      severity: "mild" | "moderate" | "severe";
    }>;
  };
  tastes: {
    spiceTolerance: {
      level: 0 | 1 | 2 | 3 | 4 | 5;
      preferredTypes: string[];
      avoidedTypes: string[];
    };
    sweetness: {
      preference: "low" | "medium" | "high";
      avoidArtificialSweeteners: boolean;
    };
    saltiness: {
      preference: "low" | "medium" | "high";
      needLowSodium: boolean;
    };
    sourness: { preference: "dislike" | "neutral" | "like" | "love" };
    bitterness: { preference: "dislike" | "neutral" | "like" | "love" };
    umami: {
      preference: "dislike" | "neutral" | "like" | "love";
      favoriteUmamiSources: string[];
    };
  };
  cuisines: {
    preferred: Array<{
      cuisine: string;
      subTypes?: string[];
      preference: 1 | 2 | 3 | 4 | 5;
      experienceLevel: "beginner" | "intermediate" | "expert";
    }>;
    avoided: Array<{ cuisine: string; reason: string }>;
    wantToTry: string[];
  };
  nutrition: {
    dailyGoals: {
      calories?: {
        target: number;
        range: { min: number; max: number };
        calculatedBy: "manual" | "bmr_calculator" | "nutritionist";
      };
      macros: {
        protein: { grams: number; percentage: number };
        carbs: { grams: number; percentage: number };
        fat: { grams: number; percentage: number };
        fiber: { grams: number };
      };
      micronutrients: Array<{
        vitamin: string;
        targetAmount: number;
        unit: string;
        importance: "critical" | "important" | "nice_to_have";
      }>;
    };
    healthGoals: {
      primary:
        | "weight_loss"
        | "weight_gain"
        | "muscle_gain"
        | "maintenance"
        | "heart_health"
        | "diabetes_management";
      secondary: string[];
      targetDate?: Date;
      currentProgress?: number;
    };
    medicalConditions: Array<{
      condition: string;
      dietaryRequirements: string[];
      doctorRecommended: boolean;
    }>;
  };
  mealPatterns: {
    schedule: {
      breakfast: {
        time: string;
        preferred: boolean;
        typical_calories?: number;
      };
      lunch: { time: string; preferred: boolean; typical_calories?: number };
      dinner: { time: string; preferred: boolean; typical_calories?: number };
      snacks: {
        times: string[];
        frequency: "never" | "rarely" | "sometimes" | "daily";
        typical_calories?: number;
      };
    };
    eatingStyle: {
      mealsPerDay: number;
      intermittentFasting: {
        practiced: boolean;
        type?: "16:8" | "18:6" | "20:4" | "24h" | "custom";
        eatingWindow?: { start: string; end: string };
      };
      portionControl: {
        awareness: "low" | "medium" | "high";
        preferredPortionSize: "small" | "medium" | "large";
        usePortionControlTools: boolean;
      };
    };
    socialEating: {
      frequency: "never" | "rarely" | "sometimes" | "often" | "daily";
      challenges: string[];
      strategies: string[];
    };
  };
  ingredients: {
    favorites: Array<{
      ingredient: string;
      category:
        | "protein"
        | "vegetable"
        | "fruit"
        | "grain"
        | "dairy"
        | "spice"
        | "other";
      preference: 1 | 2 | 3 | 4 | 5;
      cookingMethods: string[];
    }>;
    dislikes: Array<{
      ingredient: string;
      reason: "taste" | "texture" | "smell" | "cultural" | "health" | "other";
      severity: "mild_dislike" | "strong_dislike" | "cannot_eat";
    }>;
    seasonal: {
      spring: string[];
      summer: string[];
      autumn: string[];
      winter: string[];
    };
  };
  cookingBehavior: {
    skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
    frequency: "never" | "rarely" | "sometimes" | "often" | "daily";
    preferredMethods: string[];
    kitchenEquipment: {
      basic: string[];
      advanced: string[];
      missing: string[];
    };
    timeConstraints: {
      weekdayMealPrepTime: number;
      weekendMealPrepTime: number;
      preferQuickMeals: boolean;
    };
  };
}

export interface FinancialSettings {
  monthlyIncome?: number;
  incomeSource: "salary" | "freelance" | "business" | "investment" | "other";
  currency: string;
  monthlyBudget?: number;
  budgetCategories: {
    dining: number;
    groceries: number;
    entertainment: number;
    transportation: number;
    other: number;
  };
  savingsGoals: Array<{
    targetAmount?: number;
    targetDate?: Date;
    purpose: string;
    monthlyTarget?: number;
  }>;
  priceRangePreference: "budget" | "mid_range" | "premium" | "luxury";
  paymentMethods: string[];
  showIncomeInReports: boolean;
  shareFinancialData: boolean;
}

export interface NotificationSettings {
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  types: {
    budgetAlerts: boolean;
    expenseReminders: boolean;
    savingsGoalUpdates: boolean;
    unusualSpending: boolean;
    restaurantRecommendations: boolean;
    menuAnalysis: boolean;
    specialOffers: boolean;
    accountSecurity: boolean;
    productUpdates: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  timing: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    timezone: string;
    weeklyReportDay: number;
    monthlyReportDate: number;
  };
  frequency: {
    budgetAlerts: "immediate" | "daily" | "weekly";
    recommendations: "real_time" | "daily_digest" | "weekly_digest";
    reports: "weekly" | "monthly" | "quarterly";
  };
}

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private";
  showRealName: boolean;
  showLocation: boolean;
  showAge: boolean;
  dataCollection: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
    thirdPartySharing: boolean;
  };
  activityVisibility: {
    transactions: "private" | "friends" | "public";
    recommendations: "private" | "friends" | "public";
    reviews: "private" | "friends" | "public";
  };
  searchable: {
    byEmail: boolean;
    byPhone: boolean;
    byName: boolean;
  };
  dataRetention: "1year" | "2years" | "5years" | "forever";
  autoDeleteInactive: boolean;
  allowMessages: "everyone" | "friends" | "none";
  allowNotifications: "everyone" | "friends" | "none";
  twoFactorAuth: {
    enabled: boolean;
    method: "sms" | "email" | "authenticator";
    backupCodes: string[];
  };
}

export class ProfileService {
  // 获取用户完整资料
  static async getUserProfile(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        basicInfo: this.extractBasicInfo(user),
        dietaryPreferences: this.extractDietaryPreferences(user.profile),
        financialSettings: this.extractFinancialSettings(user.profile),
        notificationSettings: this.extractNotificationSettings(user.profile),
        privacySettings: this.extractPrivacySettings(user.profile),
        completionPercentage: user.profile?.completionPercentage || 0,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }

  // 更新基本信息
  static async updateBasicInfo(userId: number, basicInfo: Partial<BasicInfo>) {
    try {
      const updateData: any = {};

      if (basicInfo.name) updateData.name = basicInfo.name;
      if (basicInfo.phone) {
        updateData.phone = `${basicInfo.phone.countryCode}${basicInfo.phone.number}`;
        updateData.isPhoneVerified = basicInfo.phone.isVerified;
      }
      if (basicInfo.dateOfBirth) {
        updateData.dateOfBirth = new Date(
          basicInfo.dateOfBirth.year,
          basicInfo.dateOfBirth.month - 1,
          basicInfo.dateOfBirth.day
        );
      }
      if (basicInfo.gender) updateData.gender = basicInfo.gender.value;
      if (basicInfo.location) {
        updateData.location = JSON.stringify(basicInfo.location);
      }
      if (basicInfo.language) {
        updateData.language = basicInfo.language.primary;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      // 更新完成度
      await this.updateCompletionPercentage(userId);

      return { success: true };
    } catch (error) {
      console.error("Error updating basic info:", error);
      throw new Error("Failed to update basic info");
    }
  }

  // 更新饮食偏好
  static async updateDietaryPreferences(
    userId: number,
    preferences: Partial<DietaryPreferences>
  ) {
    try {
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          dietaryRestrictions:
            preferences.restrictions?.dietary?.map((d) => d.type) || [],
          allergies:
            preferences.restrictions?.allergies?.map((a) => a.allergen) || [],
          cuisinePreferences:
            preferences.cuisines?.preferred?.map((c) => c.cuisine) || [],
          spiceTolerance: preferences.tastes?.spiceTolerance?.level?.toString(),
          mealTiming: preferences.mealPatterns
            ? JSON.stringify(preferences.mealPatterns)
            : null,
        },
        create: {
          userId,
          dietaryRestrictions:
            preferences.restrictions?.dietary?.map((d) => d.type) || [],
          allergies:
            preferences.restrictions?.allergies?.map((a) => a.allergen) || [],
          cuisinePreferences:
            preferences.cuisines?.preferred?.map((c) => c.cuisine) || [],
          spiceTolerance: preferences.tastes?.spiceTolerance?.level?.toString(),
          mealTiming: preferences.mealPatterns
            ? JSON.stringify(preferences.mealPatterns)
            : null,
        },
      });

      await this.updateCompletionPercentage(userId);
      return { success: true };
    } catch (error) {
      console.error("Error updating dietary preferences:", error);
      throw new Error("Failed to update dietary preferences");
    }
  }

  // 更新财务设置
  static async updateFinancialSettings(
    userId: number,
    settings: Partial<FinancialSettings>
  ) {
    try {
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          monthlyIncome: settings.monthlyIncome,
          monthlyBudget: settings.monthlyBudget,
          currency: settings.currency,
          budgetAllocation: settings.budgetCategories
            ? JSON.stringify(settings.budgetCategories)
            : null,
        },
        create: {
          userId,
          monthlyIncome: settings.monthlyIncome,
          monthlyBudget: settings.monthlyBudget,
          currency: settings.currency,
          budgetAllocation: settings.budgetCategories
            ? JSON.stringify(settings.budgetCategories)
            : null,
        },
      });

      await this.updateCompletionPercentage(userId);
      return { success: true };
    } catch (error) {
      console.error("Error updating financial settings:", error);
      throw new Error("Failed to update financial settings");
    }
  }

  // 更新通知设置
  static async updateNotificationSettings(
    userId: number,
    settings: Partial<NotificationSettings>
  ) {
    try {
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          emailNotifications: settings.channels?.email,
          pushNotifications: settings.channels?.push,
          smsNotifications: settings.channels?.sms,
        },
        create: {
          userId,
          emailNotifications: settings.channels?.email ?? true,
          pushNotifications: settings.channels?.push ?? true,
          smsNotifications: settings.channels?.sms ?? false,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating notification settings:", error);
      throw new Error("Failed to update notification settings");
    }
  }

  // 更新隐私设置
  static async updatePrivacySettings(
    userId: number,
    settings: Partial<PrivacySettings>
  ) {
    try {
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          profileVisibility: settings.profileVisibility,
          dataSharing: settings.dataCollection?.personalization,
          analyticsOptIn: settings.dataCollection?.analytics,
        },
        create: {
          userId,
          profileVisibility: settings.profileVisibility || "private",
          dataSharing: settings.dataCollection?.personalization ?? false,
          analyticsOptIn: settings.dataCollection?.analytics ?? false,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      throw new Error("Failed to update privacy settings");
    }
  }

  // 上传头像
  static async uploadAvatar(userId: number, file: Express.Multer.File) {
    try {
      // 验证文件类型和大小
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new Error("Invalid file type");
      }

      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        throw new Error("File too large");
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const extension = file.originalname.split(".").pop();
      const filename = `avatar_${userId}_${timestamp}.${extension}`;

      // 这里应该上传到云存储服务（如AWS S3, Cloudinary等）
      // 暂时返回模拟URL
      const avatarUrl = `/uploads/avatars/${filename}`;

      await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
      });

      return { avatarUrl };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw new Error("Failed to upload avatar");
    }
  }

  // 计算资料完成度
  private static async updateCompletionPercentage(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) return;

      let completion = 0;
      const totalFields = 10;

      // 基本信息 (30%)
      if (user.name) completion += 3;
      if (user.phone) completion += 3;
      if (user.dateOfBirth) completion += 2;
      if (user.gender) completion += 2;
      if (user.location) completion += 2;
      if (user.avatar) completion += 2;

      // 饮食偏好 (25%)
      if (user.profile?.dietaryRestrictions?.length) completion += 5;
      if (user.profile?.allergies?.length) completion += 5;
      if (user.profile?.cuisinePreferences?.length) completion += 5;
      if (user.profile?.spiceTolerance) completion += 5;
      if (user.profile?.mealTiming) completion += 5;

      // 财务信息 (25%)
      if (user.profile?.monthlyIncome) completion += 8;
      if (user.profile?.monthlyBudget) completion += 8;
      if (user.profile?.budgetAllocation) completion += 9;

      // 其他设置 (20%)
      if (user.profile?.emailNotifications !== null) completion += 5;
      if (user.profile?.pushNotifications !== null) completion += 5;
      if (user.profile?.profileVisibility) completion += 5;
      if (user.profile?.dataSharing !== null) completion += 5;

      const percentage = Math.min(100, Math.round(completion));
      const isComplete = percentage >= 80;

      await prisma.user.update({
        where: { id: userId },
        data: { profileComplete: isComplete },
      });

      if (user.profile) {
        await prisma.userProfile.update({
          where: { userId },
          data: { completionPercentage: percentage },
        });
      } else {
        await prisma.userProfile.create({
          data: {
            userId,
            completionPercentage: percentage,
          },
        });
      }
    } catch (error) {
      console.error("Error updating completion percentage:", error);
    }
  }

  // 提取基本信息的辅助方法
  private static extractBasicInfo(user: any): BasicInfo {
    return {
      name: user.name || "",
      email: user.email,
      avatar: user.avatar
        ? {
            url: user.avatar,
            uploadedAt: new Date(),
            fileSize: 0,
            mimeType: "image/jpeg",
          }
        : undefined,
      phone: user.phone
        ? {
            countryCode: user.phone.substring(0, 3),
            number: user.phone.substring(3),
            isVerified: user.isPhoneVerified,
            verifiedAt: user.isPhoneVerified ? new Date() : undefined,
          }
        : undefined,
      dateOfBirth: user.dateOfBirth
        ? {
            year: user.dateOfBirth.getFullYear(),
            month: user.dateOfBirth.getMonth() + 1,
            day: user.dateOfBirth.getDate(),
            showAge: true,
            showBirthday: true,
          }
        : undefined,
      gender: user.gender
        ? {
            value: user.gender as any,
            isPublic: false,
          }
        : undefined,
      location: user.location ? JSON.parse(user.location) : undefined,
      language: {
        primary: user.language || "en",
        secondary: [],
      },
      bio: undefined,
      socialLinks: undefined,
      profession: undefined,
    };
  }

  private static extractDietaryPreferences(profile: any): DietaryPreferences {
    return {
      restrictions: {
        dietary: (profile?.dietaryRestrictions || []).map((type: string) => ({
          type: type as any,
          strictness: "flexible" as const,
          startDate: new Date(),
          reason: "",
        })),
        allergies: (profile?.allergies || []).map((allergen: string) => ({
          allergen,
          severity: "mild" as const,
          confirmedBy: "self_reported" as const,
        })),
        intolerances: [],
      },
      tastes: {
        spiceTolerance: {
          level: parseInt(profile?.spiceTolerance || "0") as any,
          preferredTypes: [],
          avoidedTypes: [],
        },
        sweetness: {
          preference: "medium" as const,
          avoidArtificialSweeteners: false,
        },
        saltiness: { preference: "medium" as const, needLowSodium: false },
        sourness: { preference: "neutral" as const },
        bitterness: { preference: "neutral" as const },
        umami: { preference: "like" as const, favoriteUmamiSources: [] },
      },
      cuisines: {
        preferred: (profile?.cuisinePreferences || []).map(
          (cuisine: string) => ({
            cuisine,
            preference: 3 as const,
            experienceLevel: "intermediate" as const,
          })
        ),
        avoided: [],
        wantToTry: [],
      },
      nutrition: {
        dailyGoals: {
          macros: {
            protein: { grams: 0, percentage: 0 },
            carbs: { grams: 0, percentage: 0 },
            fat: { grams: 0, percentage: 0 },
            fiber: 0,
          },
          micronutrients: [],
        },
        healthGoals: {
          primary: "maintenance" as const,
          secondary: [],
        },
        medicalConditions: [],
      },
      mealPatterns: {
        schedule: {
          breakfast: { time: "08:00", preferred: true },
          lunch: { time: "12:00", preferred: true },
          dinner: { time: "18:00", preferred: true },
          snacks: { times: [], frequency: "sometimes" as const },
        },
        eatingStyle: {
          mealsPerDay: 3,
          intermittentFasting: { practiced: false },
          portionControl: {
            awareness: "medium" as const,
            preferredPortionSize: "medium" as const,
            usePortionControlTools: false,
          },
        },
        socialEating: {
          frequency: "sometimes" as const,
          challenges: [],
          strategies: [],
        },
      },
      ingredients: {
        favorites: [],
        dislikes: [],
        seasonal: { spring: [], summer: [], autumn: [], winter: [] },
      },
      cookingBehavior: {
        skillLevel: "intermediate" as const,
        frequency: "sometimes" as const,
        preferredMethods: [],
        kitchenEquipment: { basic: [], advanced: [], missing: [] },
        timeConstraints: {
          weekdayMealPrepTime: 30,
          weekendMealPrepTime: 60,
          preferQuickMeals: true,
        },
      },
    };
  }

  private static extractFinancialSettings(profile: any): FinancialSettings {
    return {
      monthlyIncome: profile?.monthlyIncome,
      incomeSource: "salary" as const,
      currency: profile?.currency || "USD",
      monthlyBudget: profile?.monthlyBudget,
      budgetCategories: profile?.budgetAllocation
        ? JSON.parse(profile.budgetAllocation)
        : {
            dining: 0,
            groceries: 0,
            entertainment: 0,
            transportation: 0,
            other: 0,
          },
      savingsGoals: [],
      priceRangePreference: "mid_range" as const,
      paymentMethods: [],
      showIncomeInReports: false,
      shareFinancialData: profile?.dataSharing || false,
    };
  }

  private static extractNotificationSettings(
    profile: any
  ): NotificationSettings {
    return {
      channels: {
        email: profile?.emailNotifications ?? true,
        push: profile?.pushNotifications ?? true,
        sms: profile?.smsNotifications ?? false,
        inApp: true,
      },
      types: {
        budgetAlerts: true,
        expenseReminders: true,
        savingsGoalUpdates: true,
        unusualSpending: true,
        restaurantRecommendations: true,
        menuAnalysis: true,
        specialOffers: true,
        accountSecurity: true,
        productUpdates: true,
        weeklyReports: true,
        monthlyReports: true,
      },
      timing: {
        quietHours: { enabled: false, start: "22:00", end: "08:00" },
        timezone: "Asia/Shanghai",
        weeklyReportDay: 0,
        monthlyReportDate: 1,
      },
      frequency: {
        budgetAlerts: "daily" as const,
        recommendations: "daily_digest" as const,
        reports: "monthly" as const,
      },
    };
  }

  private static extractPrivacySettings(profile: any): PrivacySettings {
    return {
      profileVisibility: profile?.profileVisibility || "private",
      showRealName: false,
      showLocation: false,
      showAge: false,
      dataCollection: {
        analytics: profile?.analyticsOptIn || false,
        personalization: profile?.dataSharing || false,
        marketing: false,
        thirdPartySharing: false,
      },
      activityVisibility: {
        transactions: "private" as const,
        recommendations: "private" as const,
        reviews: "private" as const,
      },
      searchable: {
        byEmail: false,
        byPhone: false,
        byName: false,
      },
      dataRetention: "2years" as const,
      autoDeleteInactive: false,
      allowMessages: "friends" as const,
      allowNotifications: "friends" as const,
      twoFactorAuth: {
        enabled: false,
        method: "email" as const,
        backupCodes: [],
      },
    };
  }
}
