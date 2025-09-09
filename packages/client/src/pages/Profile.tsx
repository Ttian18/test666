import { useState, useEffect } from "react";
import {
  User,
  Settings,
  Edit,
  Save,
  ArrowLeft,
  Utensils,
  Heart,
  Leaf,
  Coffee,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import {
  getUserProfile,
  createOrUpdateProfile,
  type UserProfile,
} from "@/lib/profileApi";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Jason Li",
    email: "JL@example.com",
    monthlyBudget: "2000",
    income: "3500",
    savingsGoal: "5000",
    deadline: "2024-12-31",
  });

  // Dining preferences state
  const [diningPreferences, setDiningPreferences] = useState<UserProfile>({});
  const [isDiningEditing, setIsDiningEditing] = useState(false);

  // Available dining style options
  const diningStyleOptions = [
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
      id: "glutenfree",
      label: "Gluten-Free",
      icon: Heart,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "dairyfree",
      label: "Dairy-Free",
      icon: Heart,
      color: "bg-blue-100 text-blue-800",
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
      icon: Coffee,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  // Price range options
  const priceRangeOptions = [
    { value: "budget", label: "Budget ($)" },
    { value: "moderate", label: "Moderate ($$)" },
    { value: "upscale", label: "Upscale ($$$)" },
    { value: "luxury", label: "Luxury ($$$$)" },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      const parsedData = JSON.parse(saved);
      setProfileData((prev) => ({
        ...prev,
        monthlyBudget: parsedData.monthlyBudget || prev.monthlyBudget,
        income: parsedData.income || prev.income,
        savingsGoal: parsedData.savingsGoal || prev.savingsGoal,
        deadline: parsedData.deadline || prev.deadline,
      }));
    }

    // Load dining preferences from backend if authenticated
    if (isAuthenticated) {
      loadDiningPreferences();
    }
  }, [isAuthenticated]);

  const loadDiningPreferences = async () => {
    try {
      const profile = await getUserProfile();
      setDiningPreferences(profile);
    } catch (error) {
      console.error("Failed to load dining preferences:", error);
      // Continue with empty preferences
    }
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully",
    });
  };

  const handleDiningSave = async () => {
    try {
      setIsLoading(true);
      await createOrUpdateProfile({
        lifestylePreferences: {
          diningStyle:
            diningPreferences.lifestylePreferences?.diningStyle || [],
          priceRange: diningPreferences.lifestylePreferences?.priceRange,
        },
        expensePreferences: {
          cuisineTypes:
            diningPreferences.expensePreferences?.cuisineTypes || [],
        },
      });

      setIsDiningEditing(false);
      toast({
        title: "Dining Preferences Updated",
        description: "Your dining preferences have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save dining preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDiningStyle = (style: string) => {
    const currentStyles =
      diningPreferences.lifestylePreferences?.diningStyle || [];
    const newStyles = currentStyles.includes(style)
      ? currentStyles.filter((s) => s !== style)
      : [...currentStyles, style];

    setDiningPreferences((prev) => ({
      ...prev,
      lifestylePreferences: {
        ...prev.lifestylePreferences,
        diningStyle: newStyles,
      },
    }));
  };

  const handlePriceRangeChange = (priceRange: string) => {
    setDiningPreferences((prev) => ({
      ...prev,
      lifestylePreferences: {
        ...prev.lifestylePreferences,
        priceRange,
      },
    }));
  };

  const addCuisineType = (cuisine: string) => {
    if (!cuisine.trim()) return;

    const currentCuisines =
      diningPreferences.expensePreferences?.cuisineTypes || [];
    if (!currentCuisines.includes(cuisine.trim())) {
      setDiningPreferences((prev) => ({
        ...prev,
        expensePreferences: {
          ...prev.expensePreferences,
          cuisineTypes: [...currentCuisines, cuisine.trim()],
        },
      }));
    }
  };

  const removeCuisineType = (cuisine: string) => {
    const currentCuisines =
      diningPreferences.expensePreferences?.cuisineTypes || [];
    setDiningPreferences((prev) => ({
      ...prev,
      expensePreferences: {
        ...prev.expensePreferences,
        cuisineTypes: currentCuisines.filter((c) => c !== cuisine),
      },
    }));
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-primary p-6 text-white">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/home")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-white/80">Manage your account settings</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-xl font-semibold bg-gradient-primary text-white">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="font-semibold text-lg"
                      />
                      <Input
                        value={profileData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        type="email"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold">
                        {profileData.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {profileData.email}
                      </p>
                    </>
                  )}
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="icon"
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                >
                  {isEditing ? <Save size={18} /> : <Edit size={18} />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dining Preferences */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils size={20} className="text-primary" />
                Dining Preferences
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Set your dietary preferences and dining style for personalized
                recommendations
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dietary Preferences */}
              <div>
                <Label className="text-base font-medium">
                  Dietary Preferences
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select your dietary restrictions and preferences
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {diningStyleOptions.map((option) => {
                    const isSelected =
                      diningPreferences.lifestylePreferences?.diningStyle?.includes(
                        option.id
                      );
                    return (
                      <Button
                        key={option.id}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`justify-start ${
                          isSelected ? option.color : ""
                        }`}
                        onClick={() => toggleDiningStyle(option.id)}
                        disabled={!isDiningEditing}
                      >
                        <option.icon size={16} className="mr-2" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label className="text-base font-medium">
                  Preferred Price Range
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose your preferred dining budget range
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priceRangeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        diningPreferences.lifestylePreferences?.priceRange ===
                        option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePriceRangeChange(option.value)}
                      disabled={!isDiningEditing}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Cuisine Types */}
              <div>
                <Label className="text-base font-medium">
                  Favorite Cuisines
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Add your favorite cuisine types for better recommendations
                </p>

                {/* Display current cuisine types */}
                {diningPreferences.expensePreferences?.cuisineTypes &&
                  diningPreferences.expensePreferences.cuisineTypes.length >
                    0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {diningPreferences.expensePreferences.cuisineTypes.map(
                        (cuisine) => (
                          <Badge
                            key={cuisine}
                            variant="secondary"
                            className="text-sm"
                          >
                            {cuisine}
                            {isDiningEditing && (
                              <button
                                onClick={() => removeCuisineType(cuisine)}
                                className="ml-2 text-muted-foreground hover:text-foreground"
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        )
                      )}
                    </div>
                  )}

                {/* Add new cuisine type */}
                {isDiningEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add cuisine type (e.g., Italian, Japanese)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          addCuisineType(target.value);
                          target.value = "";
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        addCuisineType(input.value);
                        input.value = "";
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Edit/Save Buttons */}
              <div className="flex justify-end gap-3">
                {isDiningEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDiningEditing(false);
                        // Reset to original values
                        loadDiningPreferences();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleDiningSave} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setIsDiningEditing(true)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Preferences
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Financial Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget">Monthly Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={profileData.monthlyBudget}
                    onChange={(e) =>
                      handleInputChange("monthlyBudget", e.target.value)
                    }
                    disabled={!isEditing}
                    className={isEditing ? "" : "bg-muted"}
                  />
                </div>
                <div>
                  <Label htmlFor="income">Monthly Income</Label>
                  <Input
                    id="income"
                    type="number"
                    value={profileData.income}
                    onChange={(e) =>
                      handleInputChange("income", e.target.value)
                    }
                    disabled={!isEditing}
                    className={isEditing ? "" : "bg-muted"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="savings">Savings Goal</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={profileData.savingsGoal}
                    onChange={(e) =>
                      handleInputChange("savingsGoal", e.target.value)
                    }
                    disabled={!isEditing}
                    className={isEditing ? "" : "bg-muted"}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={profileData.deadline}
                    onChange={(e) =>
                      handleInputChange("deadline", e.target.value)
                    }
                    disabled={!isEditing}
                    className={isEditing ? "" : "bg-muted"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  Savings Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">
                  {(
                    ((parseInt(profileData.income) -
                      parseInt(profileData.monthlyBudget)) /
                      parseInt(profileData.income)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-muted-foreground">
                  $
                  {parseInt(profileData.income) -
                    parseInt(profileData.monthlyBudget)}
                  /month
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">23%</p>
                <p className="text-xs text-muted-foreground">
                  ${Math.round(parseInt(profileData.savingsGoal) * 0.23)} saved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Account Actions */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/questionnaire")}
              >
                <User size={18} className="mr-2" />
                Retake Questionnaire
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/reports")}
              >
                <Settings size={18} className="mr-2" />
                Export Data
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Settings size={18} className="mr-2" />
                Reset All Data
              </Button>
            </CardContent>
          </Card>

          <div className="pb-20">{/* Spacer for bottom navigation */}</div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
