import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Utensils, Heart, Leaf, Star, Coffee } from "lucide-react";

interface DietaryPreferencesSectionProps {
  profile: any;
  onUpdate: (data: any) => void;
}

const DietaryPreferencesSection: React.FC<DietaryPreferencesSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    profile?.dietaryPreferences?.restrictions?.dietary?.map(
      (d: any) => d.type
    ) || []
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    profile?.dietaryPreferences?.restrictions?.allergies?.map(
      (a: any) => a.allergen
    ) || []
  );
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    profile?.dietaryPreferences?.cuisines?.preferred?.map(
      (c: any) => c.cuisine
    ) || []
  );
  const [spiceLevel, setSpiceLevel] = useState(
    profile?.dietaryPreferences?.tastes?.spiceTolerance?.level || 0
  );

  const dietaryOptions = [
    {
      id: "vegan",
      label: "Vegan",
      icon: Leaf,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "vegetarian",
      label: "Vegetarian",
      icon: Leaf,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "pescatarian",
      label: "Pescatarian",
      icon: Utensils,
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      id: "keto",
      label: "Keto",
      icon: Coffee,
      color: "bg-orange-100 text-orange-800",
    },
    {
      id: "paleo",
      label: "Paleo",
      icon: Heart,
      color: "bg-red-100 text-red-800",
    },
    {
      id: "halal",
      label: "Halal",
      icon: Star,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "kosher",
      label: "Kosher",
      icon: Star,
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const allergyOptions = [
    { id: "nuts", label: "Nuts", severity: "high" },
    { id: "shellfish", label: "Shellfish", severity: "high" },
    { id: "dairy", label: "Dairy", severity: "medium" },
    { id: "eggs", label: "Eggs", severity: "medium" },
    { id: "soy", label: "Soy", severity: "medium" },
    { id: "gluten", label: "Gluten", severity: "medium" },
    { id: "fish", label: "Fish", severity: "medium" },
    { id: "sesame", label: "Sesame", severity: "low" },
  ];

  const cuisineOptions = [
    { id: "chinese", label: "Chinese", flag: "🇨🇳" },
    { id: "italian", label: "Italian", flag: "🇮🇹" },
    { id: "japanese", label: "Japanese", flag: "🇯🇵" },
    { id: "korean", label: "Korean", flag: "🇰🇷" },
    { id: "thai", label: "Thai", flag: "🇹🇭" },
    { id: "indian", label: "Indian", flag: "🇮🇳" },
    { id: "mexican", label: "Mexican", flag: "🇲🇽" },
    { id: "french", label: "French", flag: "🇫🇷" },
    { id: "american", label: "American", flag: "🇺🇸" },
    { id: "mediterranean", label: "Mediterranean", flag: "🫒" },
  ];

  const toggleRestriction = (id: string) => {
    const newRestrictions = selectedRestrictions.includes(id)
      ? selectedRestrictions.filter((r) => r !== id)
      : [...selectedRestrictions, id];

    setSelectedRestrictions(newRestrictions);
    onUpdate({
      restrictions: {
        dietary: newRestrictions.map((type) => ({
          type,
          strictness: "flexible",
          startDate: new Date(),
          reason: "",
        })),
      },
    });
  };

  const toggleAllergy = (id: string) => {
    const newAllergies = selectedAllergies.includes(id)
      ? selectedAllergies.filter((a) => a !== id)
      : [...selectedAllergies, id];

    setSelectedAllergies(newAllergies);
    onUpdate({
      restrictions: {
        allergies: newAllergies.map((allergen) => ({
          allergen,
          severity: "mild",
          confirmedBy: "self_reported",
        })),
      },
    });
  };

  const toggleCuisine = (id: string) => {
    const newCuisines = selectedCuisines.includes(id)
      ? selectedCuisines.filter((c) => c !== id)
      : [...selectedCuisines, id];

    setSelectedCuisines(newCuisines);
    onUpdate({
      cuisines: {
        preferred: newCuisines.map((cuisine) => ({
          cuisine,
          preference: 3,
          experienceLevel: "intermediate",
        })),
      },
    });
  };

  const handleSpiceLevelChange = (value: number[]) => {
    const level = value[0];
    setSpiceLevel(level);
    onUpdate({
      tastes: {
        spiceTolerance: {
          level,
          preferredTypes: [],
          avoidedTypes: [],
        },
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          Dietary Preferences
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dietary restrictions */}
        <div>
          <Label>Dietary Restrictions</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {dietaryOptions.map((option) => (
              <Badge
                key={option.id}
                variant={
                  selectedRestrictions.includes(option.id)
                    ? "default"
                    : "outline"
                }
                className={`cursor-pointer justify-center ${option.color}`}
                onClick={() => toggleRestriction(option.id)}
              >
                <option.icon className="w-4 h-4 mr-1" />
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Allergy information */}
        <div>
          <Label className="text-red-600">Allergy Information *Important</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {allergyOptions.map((option) => (
              <Badge
                key={option.id}
                variant={
                  selectedAllergies.includes(option.id)
                    ? "destructive"
                    : "outline"
                }
                className="cursor-pointer justify-center"
                onClick={() => toggleAllergy(option.id)}
              >
                {option.label}
                {option.severity === "high" && " ⚠️"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Cuisine preferences */}
        <div>
          <Label>Favorite Cuisines</Label>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
            {cuisineOptions.map((cuisine) => (
              <div
                key={cuisine.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCuisines.includes(cuisine.id)
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => toggleCuisine(cuisine.id)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{cuisine.flag}</div>
                  <div className="text-sm font-medium">{cuisine.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Taste preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Spice Tolerance</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={[spiceLevel]}
                onValueChange={handleSpiceLevelChange}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No Spice</span>
                <span>Extra Hot</span>
              </div>
              <div className="text-center">
                <Badge variant="outline">
                  Current:{" "}
                  {spiceLevel === 0
                    ? "No Spice"
                    : spiceLevel === 1
                    ? "Mild"
                    : spiceLevel === 2
                    ? "Moderate"
                    : spiceLevel === 3
                    ? "Medium Hot"
                    : spiceLevel === 4
                    ? "Hot"
                    : "Extra Hot"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label>Sweetness Preference</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                {["low", "medium", "high"].map((level) => (
                  <Button
                    key={level}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onUpdate({
                        tastes: {
                          sweetness: {
                            preference: level as any,
                            avoidArtificialSweeteners: false,
                          },
                        },
                      })
                    }
                  >
                    {level === "low"
                      ? "Low Sugar"
                      : level === "medium"
                      ? "Medium"
                      : "High Sugar"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition goals */}
        <div>
          <Label>Nutrition Goals</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <Label className="text-sm">Daily Calories</Label>
              <input
                type="number"
                placeholder="2000"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    nutrition: {
                      dailyGoals: {
                        calories: {
                          target: parseInt(e.target.value) || 0,
                          range: { min: 0, max: 0 },
                          calculatedBy: "manual",
                        },
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Protein (g)</Label>
              <input
                type="number"
                placeholder="150"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    nutrition: {
                      dailyGoals: {
                        macros: {
                          protein: {
                            grams: parseInt(e.target.value) || 0,
                            percentage: 0,
                          },
                          carbs: { grams: 0, percentage: 0 },
                          fat: { grams: 0, percentage: 0 },
                          fiber: 0,
                        },
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Carbohydrates (g)</Label>
              <input
                type="number"
                placeholder="250"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    nutrition: {
                      dailyGoals: {
                        macros: {
                          protein: { grams: 0, percentage: 0 },
                          carbs: {
                            grams: parseInt(e.target.value) || 0,
                            percentage: 0,
                          },
                          fat: { grams: 0, percentage: 0 },
                          fiber: 0,
                        },
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Fat (g)</Label>
              <input
                type="number"
                placeholder="80"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    nutrition: {
                      dailyGoals: {
                        macros: {
                          protein: { grams: 0, percentage: 0 },
                          carbs: { grams: 0, percentage: 0 },
                          fat: {
                            grams: parseInt(e.target.value) || 0,
                            percentage: 0,
                          },
                          fiber: 0,
                        },
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Meal times */}
        <div>
          <Label>Meal Times</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label className="text-sm">Breakfast</Label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    mealPatterns: {
                      schedule: {
                        breakfast: { time: e.target.value, preferred: true },
                        lunch: { time: "12:00", preferred: true },
                        dinner: { time: "18:00", preferred: true },
                        snacks: { times: [], frequency: "sometimes" },
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Lunch</Label>
              <input
                type="time"
                defaultValue="12:00"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    mealPatterns: {
                      schedule: {
                        breakfast: { time: "08:00", preferred: true },
                        lunch: { time: e.target.value, preferred: true },
                        dinner: { time: "18:00", preferred: true },
                        snacks: { times: [], frequency: "sometimes" },
                      },
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Dinner</Label>
              <input
                type="time"
                defaultValue="18:00"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    mealPatterns: {
                      schedule: {
                        breakfast: { time: "08:00", preferred: true },
                        lunch: { time: "12:00", preferred: true },
                        dinner: { time: e.target.value, preferred: true },
                        snacks: { times: [], frequency: "sometimes" },
                      },
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DietaryPreferencesSection;
