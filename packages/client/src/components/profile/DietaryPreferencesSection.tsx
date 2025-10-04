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
      label: "纯素食",
      icon: Leaf,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "vegetarian",
      label: "素食",
      icon: Leaf,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "pescatarian",
      label: "鱼素",
      icon: Utensils,
      color: "bg-cyan-100 text-cyan-800",
    },
    {
      id: "keto",
      label: "生酮饮食",
      icon: Coffee,
      color: "bg-orange-100 text-orange-800",
    },
    {
      id: "paleo",
      label: "原始人饮食",
      icon: Heart,
      color: "bg-red-100 text-red-800",
    },
    {
      id: "halal",
      label: "清真",
      icon: Star,
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "kosher",
      label: "犹太洁食",
      icon: Star,
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const allergyOptions = [
    { id: "nuts", label: "坚果", severity: "high" },
    { id: "shellfish", label: "贝类海鲜", severity: "high" },
    { id: "dairy", label: "乳制品", severity: "medium" },
    { id: "eggs", label: "鸡蛋", severity: "medium" },
    { id: "soy", label: "大豆", severity: "medium" },
    { id: "gluten", label: "麸质", severity: "medium" },
    { id: "fish", label: "鱼类", severity: "medium" },
    { id: "sesame", label: "芝麻", severity: "low" },
  ];

  const cuisineOptions = [
    { id: "chinese", label: "中式", flag: "🇨🇳" },
    { id: "italian", label: "意式", flag: "🇮🇹" },
    { id: "japanese", label: "日式", flag: "🇯🇵" },
    { id: "korean", label: "韩式", flag: "🇰🇷" },
    { id: "thai", label: "泰式", flag: "🇹🇭" },
    { id: "indian", label: "印式", flag: "🇮🇳" },
    { id: "mexican", label: "墨西哥", flag: "🇲🇽" },
    { id: "french", label: "法式", flag: "🇫🇷" },
    { id: "american", label: "美式", flag: "🇺🇸" },
    { id: "mediterranean", label: "地中海", flag: "🫒" },
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
          饮食偏好
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 饮食限制 */}
        <div>
          <Label>饮食限制</Label>
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

        {/* 过敏信息 */}
        <div>
          <Label className="text-red-600">过敏信息 *重要</Label>
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

        {/* 菜系偏好 */}
        <div>
          <Label>喜欢的菜系</Label>
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

        {/* 口味偏好 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>辣度承受</Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={[spiceLevel]}
                onValueChange={handleSpiceLevelChange}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>不能吃辣</span>
                <span>超级辣</span>
              </div>
              <div className="text-center">
                <Badge variant="outline">
                  当前:{" "}
                  {spiceLevel === 0
                    ? "不能吃辣"
                    : spiceLevel === 1
                    ? "微辣"
                    : spiceLevel === 2
                    ? "轻度辣"
                    : spiceLevel === 3
                    ? "中度辣"
                    : spiceLevel === 4
                    ? "重度辣"
                    : "超级辣"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label>甜度偏好</Label>
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
                      ? "低糖"
                      : level === "medium"
                      ? "中等"
                      : "高糖"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 营养目标 */}
        <div>
          <Label>营养目标</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <Label className="text-sm">每日卡路里</Label>
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
              <Label className="text-sm">蛋白质 (g)</Label>
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
              <Label className="text-sm">碳水化合物 (g)</Label>
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
              <Label className="text-sm">脂肪 (g)</Label>
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

        {/* 用餐时间 */}
        <div>
          <Label>用餐时间</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label className="text-sm">早餐</Label>
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
              <Label className="text-sm">午餐</Label>
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
              <Label className="text-sm">晚餐</Label>
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
