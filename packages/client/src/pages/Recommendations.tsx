import { useState, useEffect } from "react";
import {
  Utensils,
  MapPin,
  Camera,
  DollarSign,
  Zap,
  Heart,
  Leaf,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import TopNavigation from "@/components/TopNavigation";
import {
  recommendFromUpload,
  getLastRecommendation,
  clearCache,
  type Restaurant,
  type MenuRecommendation,
} from "@/lib/api";

const Recommendations = () => {
  const { toast } = useToast();

  // State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [budget, setBudget] = useState("");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] =
    useState<MenuRecommendation | null>(null);
  const [lastRecommendation, setLastRecommendation] =
    useState<MenuRecommendation | null>(null);

  // Dietary preference options - using backend default tags
  const preferenceOptions = [
    { id: "glutenfree", label: "Gluten-Free", icon: Heart },
    { id: "vegan", label: "Vegan", icon: Leaf },
    { id: "vegetarian", label: "Vegetarian", icon: Leaf },
    { id: "halal", label: "Halal", icon: Heart },
    { id: "kosher", label: "Kosher", icon: Heart },
  ];

  // Load restaurants on mount - simplified since we only need menu recommendations
  useEffect(() => {
    // Set some sample restaurant data for display purposes only
    setRestaurants([
      {
        id: "1",
        name: "Healthy Bowl Co.",
        address: "123 Main St, LA",
        rating: 4.5,
        priceLevel: 2,
      },
      {
        id: "2",
        name: "Pasta Palace",
        address: "456 Oak Ave, LA",
        rating: 4.3,
        priceLevel: 3,
      },
      {
        id: "3",
        name: "Spice Garden",
        address: "789 Pine St, LA",
        rating: 4.7,
        priceLevel: 2,
      },
    ]);
  }, []);

  // Load last recommendation on mount
  useEffect(() => {
    const loadLastRecommendation = async () => {
      try {
        const data = await getLastRecommendation();
        setLastRecommendation(data);
      } catch (error) {
        console.error("Failed to load last recommendation:", error);
      }
    };

    // Test backend connection
    const testBackendConnection = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
          }/health`
        );
        if (response.ok) {
          console.log("✅ Backend is accessible");
        } else {
          console.error("❌ Backend health check failed:", response.status);
        }
      } catch (error) {
        console.error("❌ Cannot connect to backend:", error.message);
      }
    };

    loadLastRecommendation();
    testBackendConnection();
  }, []);

  // File validation
  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 6 * 1024 * 1024; // 6MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WebP image",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 6MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      toast({
        title: "File selected successfully!",
        description: `${file.name} is ready for analysis`,
      });
    }
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    console.log("Camera capture triggered");

    // Check if we're on a mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (!isMobile) {
      toast({
        title: "Camera not available",
        description: "Please use 'Choose from Gallery' on desktop devices",
        variant: "destructive",
      });
      return;
    }

    // This will trigger the camera on mobile devices
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      console.log("File selected:", file);
      if (file && validateFile(file)) {
        setSelectedFile(file);
        toast({
          title: "Photo captured!",
          description: `${file.name} is ready for analysis`,
        });
      }
    };
    input.click();
  };

  // Toggle dietary preference
  const togglePreference = (prefId: string) => {
    setDietaryTags((prev) =>
      prev.includes(prefId)
        ? prev.filter((p) => p !== prefId)
        : [...prev, prefId]
    );
  };

  // Remove custom tag
  const removeCustomTag = (tagToRemove: string) => {
    setDietaryTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Get AI recommendations
  const handleGetRecommendations = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a menu photo first",
        variant: "destructive",
      });
      return;
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      toast({
        title: "Invalid budget",
        description: "Please enter a valid budget amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
                  budget: Number(budget),
          tags: dietaryTags.length > 0 ? dietaryTags : undefined,
      };

      console.log("Sending recommendation request with payload:", payload);
      console.log(
        "Selected file:",
        selectedFile?.name,
        selectedFile?.size,
        selectedFile?.type
      );

      const result = await recommendFromUpload(selectedFile, payload);
      console.log("Recommendation result:", result);
      console.log("Result structure:", {
        hasMenuInfo: !!result.menuInfo,
        hasRecommendation: !!result.recommendation,
        hasPicks: !!result.recommendation?.picks,
        picksLength: result.recommendation?.picks?.length || 0,
        keys: Object.keys(result || {}),
      });

      setRecommendation(result);

      toast({
        title: "Recommendations ready! 🎉",
        description: "AI has analyzed your menu and found the perfect dishes",
      });
    } catch (error: any) {
      console.error("Failed to get recommendations:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });

      toast({
        title: "Failed to get recommendations",
        description:
          error.response?.data?.message || error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    try {
      await clearCache();
      setLastRecommendation(null);
      setRecommendation(null);
      toast({
        title: "Cache cleared",
        description: "All cached recommendations have been removed",
      });
    } catch (error) {
      toast({
        title: "Failed to clear cache",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-background-recommendations">
      <TopNavigation />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Menu Recommendations
          </h1>
          <p className="text-muted-foreground">
            Upload a menu photo and get personalized dish recommendations
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${
                      import.meta.env.VITE_API_BASE_URL ||
                      "http://localhost:5001"
                    }/health`
                  );
                  if (response.ok) {
                    toast({
                      title: "✅ Backend Connected",
                      description: "Server is running and accessible",
                    });
                  } else {
                    toast({
                      title: "❌ Backend Error",
                      description: `Server returned ${response.status}`,
                      variant: "destructive",
                    });
                  }
                } catch (error) {
                  toast({
                    title: "❌ Connection Failed",
                    description: `Cannot connect to backend: ${error.message}`,
                    variant: "destructive",
                  });
                }
              }}
            >
              Test Backend Connection
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Restaurant Selection */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Select Restaurant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{restaurant.name}</h3>
                      <span className="text-muted-foreground font-medium">
                        {restaurant.priceLevel
                          ? "$".repeat(restaurant.priceLevel)
                          : "$$"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{restaurant.address}</span>
                      {restaurant.rating && <span>⭐ {restaurant.rating}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Middle Panel - Upload Menu Photo */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera size={20} />
                Upload Menu Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-medium">File selected</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Upload size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Upload Menu Photo
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        AI will analyze the menu for you
                      </p>
                      <div className="space-y-2">
                        <Button
                          onClick={handleCameraCapture}
                          className="w-full"
                        >
                          📷 Take Photo
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                            📁 Choose from Gallery
                          </label>
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports JPG, PNG, WebP • Max 6MB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Preferences */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Budget *</Label>
                <div className="relative">
                  <DollarSign
                    size={18}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    id="budget"
                    placeholder="25.00"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="pl-10"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>



              <div>
                <Label>Dietary Preferences</Label>
                <div className="space-y-3">
                  {/* Default tags */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Default Options:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {preferenceOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = dietaryTags.includes(option.id);

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

                  {/* Custom tags */}
                  {dietaryTags.filter(
                    (tag) => !preferenceOptions.find((opt) => opt.id === tag)
                  ).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Custom Tags:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dietaryTags
                          .filter(
                            (tag) =>
                              !preferenceOptions.find((opt) => opt.id === tag)
                          )
                          .map((tag) => (
                            <Button
                              key={tag}
                              variant="secondary"
                              size="sm"
                              onClick={() => removeCustomTag(tag)}
                              className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                            >
                              {tag}
                              <X size={12} className="ml-1" />
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Custom Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add custom tag (e.g., spicy, noChicken)"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && customTag.trim()) {
                        e.preventDefault();
                        if (!dietaryTags.includes(customTag.trim())) {
                          setDietaryTags([...dietaryTags, customTag.trim()]);
                          setCustomTag("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (
                        customTag.trim() &&
                        !dietaryTags.includes(customTag.trim())
                      ) {
                        setDietaryTags([...dietaryTags, customTag.trim()]);
                        setCustomTag("");
                      }
                    }}
                    disabled={
                      !customTag.trim() ||
                      dietaryTags.includes(customTag.trim())
                    }
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleGetRecommendations}
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!selectedFile || !budget || isLoading}
              >
                {isLoading ? (
                  <>
                    <Clock size={16} className="mr-2 animate-spin" />
                    Analyzing Menu...
                  </>
                ) : (
                  <>
                    <Zap size={16} className="mr-2" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Last Cached Recommendation */}
        {lastRecommendation &&
          lastRecommendation.recommendation &&
          !recommendation && (
            <Card className="themed-card mt-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} />
                    Last Cached Recommendation
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">From cache</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCache}
                    >
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Previous Recommendation
                      </h3>
                      <p className="text-muted-foreground">
                        Budget: $
                        {lastRecommendation.recommendation?.estimatedTotal || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {lastRecommendation.recommendation?.picks?.map(
                      (pick, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{pick.name}</p>

                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${pick.quantity > 1 ? `${pick.quantity}x` : ""}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {lastRecommendation.recommendation?.notes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {lastRecommendation.recommendation?.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* AI Recommendation Results */}
        {recommendation && recommendation.recommendation && (
          <Card className="themed-card mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Utensils size={20} />
                  AI Recommendations
                </CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={recommendation.cached ? "secondary" : "default"}
                  >
                    {recommendation.cached ? "From cache" : "Fresh"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCache}
                  >
                    Clear Cache
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    $
                    {recommendation.recommendation?.estimatedTotal ||
                      recommendation.recommendation?.total ||
                      0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {recommendation.recommendation?.items?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Items Selected
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {recommendation.recommendation?.relaxedHard && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        Recommendation Notes
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Some dietary constraints were relaxed due to limited
                        options
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Items */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg">Recommended Items</h4>

                {/* LLM Response Structure */}
                {recommendation.recommendation?.picks?.map((pick, index) => (
                  <div
                    key={`pick-${index}`}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{pick.name}</h5>
                        {pick.quantity > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {pick.quantity}x
                          </Badge>
                        )}
                      </div>
                      {pick.reason && (
                        <p className="text-sm text-muted-foreground">
                          {pick.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">

                    </div>
                  </div>
                ))}

                {/* Fallback Budget Service Structure */}
                {recommendation.recommendation?.items?.map((item, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{item.name}</h5>
                        {item.qty > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {item.qty}x
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground">
                        ${item.unit_price}
                      </p>
                      <p className="text-sm font-medium">${item.subtotal}</p>

                    </div>
                  </div>
                ))}
              </div>

              {/* Filtered Out Items */}
              {recommendation.recommendation?.filteredOut &&
                recommendation.recommendation.filteredOut.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-muted-foreground">
                      Filtered Out
                    </h4>
                    {recommendation.recommendation?.filteredOut?.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Fallback Display - Show raw data if structure is unexpected */}
        {recommendation && !recommendation.recommendation && (
          <Card className="themed-card mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle size={20} />
                Raw Recommendation Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The recommendation data has an unexpected structure. Here's
                  what was received:
                </p>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(recommendation, null, 2)}
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground">
                  This might indicate a backend response format issue.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
