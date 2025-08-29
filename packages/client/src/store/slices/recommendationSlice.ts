import { StateCreator } from 'zustand';

export interface MealRecommendation {
  id: string;
  restaurantName: string;
  dishName: string;
  price: number;
  rating: number;
  cuisine: string;
  estimatedDeliveryTime: number;
  dietaryTags: string[];
  ingredients: string[];
  nutritionInfo: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  matchScore: number; // How well it matches user preferences (0-100)
  reasonForRecommendation: string[];
  imageUrl?: string;
  restaurantLocation: {
    address: string;
    distance: number;
  };
}

export interface RestaurantRecommendation {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  distance: number;
  estimatedDeliveryTime: number;
  popularDishes: string[];
  averageMealPrice: number;
  dietaryOptions: string[];
  matchScore: number;
  imageUrl?: string;
  address: string;
  phone?: string;
  website?: string;
}

export interface RecommendationPreferences {
  maxPrice: number;
  preferredCuisines: string[];
  dietaryRestrictions: string[];
  maxDeliveryTime: number;
  maxDistance: number;
  allergies: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'any';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';
}

export interface RecommendationSlice {
  // State
  dailyRecommendations: MealRecommendation[];
  restaurantRecommendations: RestaurantRecommendation[];
  recommendationPreferences: RecommendationPreferences;
  isLoadingRecommendations: boolean;
  lastUpdated: Date | null;
  
  // Actions
  fetchDailyRecommendations: () => Promise<void>;
  fetchRestaurantRecommendations: (location?: string) => Promise<void>;
  updateRecommendationPreferences: (preferences: Partial<RecommendationPreferences>) => void;
  saveRecommendation: (recommendationId: string) => void;
  dismissRecommendation: (recommendationId: string) => void;
  refreshRecommendations: () => Promise<void>;
}

export const createRecommendationSlice: StateCreator<
  any,
  any,
  any,
  RecommendationSlice
> = (set, get) => ({
  // Initial state
  dailyRecommendations: [
    {
      id: 'rec-1',
      restaurantName: 'Healthy Bowl Co.',
      dishName: 'Mediterranean Bowl + Green Smoothie',
      price: 18.5,
      rating: 4.7,
      cuisine: 'Mediterranean',
      estimatedDeliveryTime: 25,
      dietaryTags: ['Vegetarian', 'Gluten-Free Options'],
      ingredients: ['quinoa', 'chickpeas', 'cucumber', 'tomatoes', 'feta', 'olive oil'],
      nutritionInfo: {
        protein: 22,
        carbs: 45,
        fat: 18,
        fiber: 12,
      },
      matchScore: 95,
      reasonForRecommendation: [
        'Fits your $20 budget',
        'High protein content',
        'Mediterranean cuisine preference'
      ],
      restaurantLocation: {
        address: '123 Health St, Downtown',
        distance: 0.8,
      },
    },
  ],
  restaurantRecommendations: [
    {
      id: 'rest-1',
      name: 'Healthy Bowl Co.',
      cuisine: ['Mediterranean', 'Healthy'],
      rating: 4.7,
      priceRange: '$$',
      distance: 0.8,
      estimatedDeliveryTime: 25,
      popularDishes: ['Mediterranean Bowl', 'Protein Power Bowl', 'Green Goddess Salad'],
      averageMealPrice: 16.50,
      dietaryOptions: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      matchScore: 92,
      address: '123 Health St, Downtown',
      phone: '(555) 123-4567',
    },
  ],
  recommendationPreferences: {
    maxPrice: 25,
    preferredCuisines: ['Mediterranean', 'Asian', 'American'],
    dietaryRestrictions: [],

    maxDeliveryTime: 45,
    maxDistance: 5,
    allergies: [],
    spiceLevel: 'medium',
    mealType: 'any',
  },
  isLoadingRecommendations: false,
  lastUpdated: null,

  // Actions
  fetchDailyRecommendations: async () => {
    set((state: any) => {
      state.isLoadingRecommendations = true;
    });

    try {
      // Mock API call - replace with real recommendation service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { recommendationPreferences } = get();
      
      // Simulate AI-powered recommendations based on preferences
      const mockRecommendations: MealRecommendation[] = [
        {
          id: `rec_${Date.now()}_1`,
          restaurantName: 'AI Bistro',
          dishName: 'Smart Protein Bowl',
          price: Math.min(recommendationPreferences.maxPrice * 0.8, 22),
          rating: 4.8,
          cuisine: recommendationPreferences.preferredCuisines[0] || 'Fusion',
          estimatedDeliveryTime: Math.min(recommendationPreferences.maxDeliveryTime * 0.6, 30),
          dietaryTags: recommendationPreferences.dietaryRestrictions,
          ingredients: ['quinoa', 'grilled chicken', 'avocado', 'kale'],
          nutritionInfo: {
            protein: 35,
            carbs: 42,
            fat: 16,
            fiber: 8,
          },
          matchScore: 96,
          reasonForRecommendation: [
            'Perfect for your budget',
            'Matches dietary preferences',
            'Optimal protein content',
            'AI-optimized nutrition'
          ],
          restaurantLocation: {
            address: '456 AI Ave, Tech District',
            distance: 1.2,
          },
        },
        {
          id: `rec_${Date.now()}_2`,
          restaurantName: 'Green Machine',
          dishName: 'Plant Power Wrap',
          price: Math.min(recommendationPreferences.maxPrice * 0.6, 15),
          rating: 4.6,
          cuisine: 'Vegan',
          estimatedDeliveryTime: Math.min(recommendationPreferences.maxDeliveryTime * 0.5, 20),
          dietaryTags: ['Vegan', 'Organic'],
          ingredients: ['spinach tortilla', 'hummus', 'roasted vegetables', 'sprouts'],
          nutritionInfo: {
            protein: 18,
            carbs: 38,
            fat: 12,
            fiber: 14,
          },
          matchScore: 88,
          reasonForRecommendation: [
            'Eco-friendly choice',
            'High fiber content',
            'Quick delivery',
            'Budget-friendly'
          ],
          restaurantLocation: {
            address: '789 Green St, Eco District',
            distance: 0.5,
          },
        },
      ];

      set((state: any) => {
        state.dailyRecommendations = mockRecommendations;
        state.lastUpdated = new Date();
        state.isLoadingRecommendations = false;
      });
    } catch (error) {
      set((state: any) => {
        state.isLoadingRecommendations = false;
      });
      console.error('Failed to fetch recommendations:', error);
    }
  },

  fetchRestaurantRecommendations: async (location) => {
    set((state: any) => {
      state.isLoadingRecommendations = true;
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { recommendationPreferences } = get();
      
      const mockRestaurants: RestaurantRecommendation[] = [
        {
          id: `rest_${Date.now()}_1`,
          name: 'Smart Eats AI',
          cuisine: ['Fusion', 'Healthy'],
          rating: 4.9,
          priceRange: '$$',
          distance: 1.1,
          estimatedDeliveryTime: 28,
          popularDishes: ['AI Bowl', 'Neural Network Salad', 'Data Driven Sandwich'],
          averageMealPrice: recommendationPreferences.maxPrice * 0.75,
          dietaryOptions: ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free'],
          matchScore: 94,
          address: '101 Innovation Blvd',
          phone: '(555) 987-6543',
          website: 'smarteats.ai',
        },
        {
          id: `rest_${Date.now()}_2`,
          name: 'Budget Bites',
          cuisine: ['American', 'Comfort'],
          rating: 4.3,
          priceRange: '$',
          distance: 0.7,
          estimatedDeliveryTime: 35,
          popularDishes: ['Classic Burger', 'Loaded Fries', 'Chicken Wrap'],
          averageMealPrice: recommendationPreferences.maxPrice * 0.5,
          dietaryOptions: ['Vegetarian Options'],
          matchScore: 79,
          address: '234 Value St',
          phone: '(555) 456-7890',
        },
      ];

      set((state: any) => {
        state.restaurantRecommendations = mockRestaurants;
        state.isLoadingRecommendations = false;
      });
    } catch (error) {
      set((state: any) => {
        state.isLoadingRecommendations = false;
      });
      console.error('Failed to fetch restaurant recommendations:', error);
    }
  },

  updateRecommendationPreferences: (preferences) => {
    set((state: any) => {
      state.recommendationPreferences = {
        ...state.recommendationPreferences,
        ...preferences,
      };
    });
    
    // Refresh recommendations when preferences change
    get().refreshRecommendations();
  },

  saveRecommendation: (recommendationId) => {
    // Mock save to favorites
    console.log('Saved recommendation:', recommendationId);
    // In a real app, this would save to user's favorites
  },

  dismissRecommendation: (recommendationId) => {
    set((state: any) => {
      state.dailyRecommendations = state.dailyRecommendations.filter(
        (rec: MealRecommendation) => rec.id !== recommendationId
      );
    });
  },

  refreshRecommendations: async () => {
    await Promise.all([
      get().fetchDailyRecommendations(),
      get().fetchRestaurantRecommendations(),
    ]);
  },
});
