import { useState } from "react";
import { Utensils, MapPin, Camera, DollarSign, Zap, Heart, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TopNavigation from "@/components/TopNavigation";

const Recommendations = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [budget, setBudget] = useState("");
  const [calorieLimit, setCalorieLimit] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const preferenceOptions = [
    { id: "vegan", label: "Vegan", icon: Leaf },
    { id: "spicy", label: "Spicy", icon: Zap },
    { id: "healthy", label: "Healthy", icon: Heart },
    { id: "quick", label: "Quick Serve", icon: Zap },
  ];

  const sampleRecommendations = [
    {
      name: "Mediterranean Bowl",
      restaurant: "Healthy Bites",
      price: "$12.50",
      calories: "420 cal",
      description: "Fresh quinoa, grilled chicken, olives, and feta",
      tags: ["Healthy", "Protein-rich"],
      matchScore: 95,
    },
    {
      name: "Veggie Burger",
      restaurant: "Green Garden",
      price: "$11.00",
      calories: "380 cal",
      description: "Plant-based patty with avocado and sweet potato fries",
      tags: ["Vegan", "Healthy"],
      matchScore: 88,
    },
    {
      name: "Chicken Caesar Salad",
      restaurant: "Fresh Market",
      price: "$10.75",
      calories: "350 cal",
      description: "Grilled chicken, romaine, parmesan, croutons",
      tags: ["Healthy", "Low-carb"],
      matchScore: 82,
    },
  ];

  const togglePreference = (prefId: string) => {
    setPreferences(prev => 
      prev.includes(prefId) 
        ? prev.filter(p => p !== prefId)
        : [...prev, prefId]
    );
  };

  const handleGetRecommendations = () => {
    // Simulate AI analysis
    setRecommendations(sampleRecommendations);
  };

  return (
    <div className="page-background-recommendations">
      <TopNavigation />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Food Recommendations</h1>
          <p className="text-muted-foreground">Find budget-friendly meals that match your preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Selection */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Select Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy-bites">Healthy Bowl Co.</SelectItem>
                  <SelectItem value="green-garden">Pasta Palace</SelectItem>
                  <SelectItem value="fresh-market">Spice Garden</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-3">
                {[
                  { id: "healthy-bites", name: "Healthy Bowl Co.", cuisine: "Healthy", rating: 4.5, distance: "0.3 mi", price: "$$" },
                  { id: "pasta-palace", name: "Pasta Palace", cuisine: "Italian", rating: 4.3, distance: "0.5 mi", price: "$$$" },
                  { id: "spice-garden", name: "Spice Garden", cuisine: "Indian", rating: 4.7, distance: "0.8 mi", price: "$$" }
                ].map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedRestaurant === restaurant.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRestaurant(restaurant.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <span className="text-muted-foreground font-medium">{restaurant.price}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{restaurant.cuisine}</span>
                      <span>⭐ {restaurant.rating}</span>
                      <span>{restaurant.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upload Menu Photo */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera size={20} />
                Upload Menu Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Camera size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Take Photo of Menu</h3>
                <p className="text-muted-foreground mb-6">AI will analyze options for you</p>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences Input */}
        <Card className="themed-card mt-8">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget</Label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="budget"
                    placeholder="15.00"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="calories">Max Calories</Label>
                <Input
                  id="calories"
                  placeholder="500"
                  value={calorieLimit}
                  onChange={(e) => setCalorieLimit(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Dietary Preferences</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {preferenceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = preferences.includes(option.id);
                  
                  return (
                    <Button
                      key={option.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePreference(option.id)}
                      className={isSelected ? "bg-primary" : ""}
                    >
                      <Icon size={14} className="mr-1" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={handleGetRecommendations}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!selectedRestaurant}
            >
              Get AI Recommendations
            </Button>
          </CardContent>
        </Card>

        {/* Sample recommendation when restaurant is selected */}
        {selectedRestaurant === "healthy-bites" && (
          <div className="mt-8">
            <Card className="themed-card">
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">Mediterranean Bowl + Green Smoothie</h3>
                    <p className="text-muted-foreground">Healthy Bowl Co.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Perfect match for your health preferences and budget
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-primary">$18.5</p>
                    <p className="text-sm text-muted-foreground">520 cal</p>
                  </div>
                </div>
                <Button className="w-full mt-4">
                  Set as Today's Recommendation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations Results */}
        {recommendations.length > 0 && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-foreground">
              Perfect Matches for You
            </h3>
            
            {recommendations.map((item, index) => (
              <Card key={index} className="themed-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {item.matchScore}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.restaurant}
                      </p>
                      <p className="text-sm text-foreground">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-primary text-lg">{item.price}</p>
                      <p className="text-xs text-muted-foreground">{item.calories}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag: string, tagIndex: number) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button size="sm" className="w-full">
                    Select This Dish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;