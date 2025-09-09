import { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Phone,
  Globe,
  Navigation,
  Loader2,
  Search,
  ExternalLink,
  ChefHat,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import RestaurantService from "@/services/restaurantService";
import { Recommendation } from "schema";
import { toast } from "@/components/ui/use-toast";
import restaurantIcon from "@/assets/restaurant-icon.png";

const Recommendations = () => {
  const { token, user } = useAuthContext();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-populate location from user profile if available
  useEffect(() => {
    if (user?.profile?.preferences?.defaultLocation) {
      setLocation(user.profile.preferences.defaultLocation);
    }
  }, [user]);

  const buildUserData = () => {
    if (!user) return undefined;

    return {
      name: user.name,
      email: user.email,
      monthlyBudget: user.profile?.monthlyBudget || undefined,
      monthlyIncome: user.profile?.income || undefined,
      expensePreferences: {
        diningOut: user.profile?.preferences?.diningStyle || undefined,
        cuisineTypes:
          user.profile?.preferences?.cuisinePreferences || undefined,
      },
      lifestylePreferences: {
        diningStyle: user.profile?.preferences?.diningStyle || undefined,
        priceRange: user.profile?.preferences?.priceRange || undefined,
      },
    };
  };

  const handleSearch = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description:
          "Please log in to get personalized restaurant recommendations",
        variant: "destructive",
      });
      return;
    }

    const searchQuery = query.trim() || `restaurants in ${location.trim()}`;

    if (!searchQuery || (!query.trim() && !location.trim())) {
      toast({
        title: "Search Required",
        description: "Please enter a location or specific search query",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const userData = buildUserData();
      const response = await RestaurantService.getRestaurantRecommendations(
        searchQuery,
        token,
        userData
      );

      setRecommendations(response.answer);

      toast({
        title: "Recommendations Found",
        description: `Found ${response.answer.length} personalized restaurant recommendations`,
      });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to get recommendations",
        variant: "destructive",
      });
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLocationSearch = (quickLocation: string) => {
    setLocation(quickLocation);
    setQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const openGoogleMaps = (googleMapsLink: string) => {
    if (googleMapsLink) {
      window.open(googleMapsLink, "_blank");
    }
  };

  const callRestaurant = (phone: string) => {
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const visitWebsite = (website: string) => {
    if (website) {
      window.open(website, "_blank");
    }
  };

  return (
    <AppLayout>
      <div className="page-background-recommendations">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Restaurant Recommendations
            </h1>
            <p className="text-muted-foreground">
              Discover great restaurants near you with AI-powered
              recommendations
            </p>
          </div>

          {/* Search Section */}
          <Card className="themed-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search size={20} />
                Find Restaurants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Query Input */}
              <div>
                <Label
                  htmlFor="query"
                  className="text-base font-medium mb-2 block"
                >
                  What are you looking for?
                </Label>
                <Textarea
                  id="query"
                  placeholder="e.g., 'Best Italian restaurants in downtown San Francisco with outdoor seating' or 'Affordable sushi near Times Square'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* OR Separator */}
              <div className="flex items-center gap-4">
                <hr className="flex-1" />
                <span className="text-muted-foreground text-sm">OR</span>
                <hr className="flex-1" />
              </div>

              {/* Simple Location Search */}
              <div>
                <Label
                  htmlFor="location"
                  className="text-base font-medium mb-2 block"
                >
                  Search by location
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="location"
                    placeholder="Enter city, neighborhood, or address..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="min-w-[120px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search size={16} className="mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Location Buttons */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Quick locations:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "San Francisco, CA",
                    "New York, NY",
                    "Los Angeles, CA",
                    "Chicago, IL",
                    "Austin, TX",
                  ].map((quickLoc) => (
                    <Button
                      key={quickLoc}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLocationSearch(quickLoc)}
                      disabled={isLoading}
                    >
                      {quickLoc}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Get personalized restaurant recommendations powered by AI based
                on your profile and preferences
              </p>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2
                  size={48}
                  className="mx-auto mb-4 animate-spin text-primary"
                />
                <p className="text-lg font-medium">Finding restaurants...</p>
                <p className="text-muted-foreground">
                  This may take a few moments
                </p>
              </div>
            </div>
          )}

          {/* No Results */}
          {hasSearched && !isLoading && recommendations.length === 0 && (
            <Card className="themed-card">
              <CardContent className="py-12 text-center">
                <MapPin
                  size={48}
                  className="mx-auto mb-4 text-muted-foreground"
                />
                <h3 className="text-lg font-medium mb-2">
                  No restaurants found
                </h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any restaurants in "{location}". Try a
                  different location or check your spelling.
                </p>
                <Button onClick={() => setLocation("")}>
                  Try Another Location
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recommendations Results */}
          {!isLoading && recommendations.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Recommended Restaurants
                </h2>
                <Badge variant="secondary">
                  {recommendations.length} restaurants found
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((restaurant, index) => (
                  <RestaurantCard
                    key={index}
                    restaurant={restaurant}
                    onOpenMaps={openGoogleMaps}
                    onCall={callRestaurant}
                    onVisitWebsite={visitWebsite}
                    showIcon={index < 2}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

interface RestaurantCardProps {
  restaurant: Recommendation;
  onOpenMaps: (link: string) => void;
  onCall: (phone: string) => void;
  onVisitWebsite: (website: string) => void;
  showIcon?: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onOpenMaps,
  onCall,
  onVisitWebsite,
  showIcon = false,
}) => {
  return (
    <Card className="themed-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="relative">
        {showIcon && (
          <img
            src={restaurantIcon}
            alt="Restaurant"
            className="absolute top-4 right-4 w-8 h-8 opacity-70"
          />
        )}
        <div className={`space-y-2 ${showIcon ? "pr-12" : ""}`}>
          <CardTitle className="text-lg line-clamp-2">
            {restaurant.name}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {restaurant.cuisine && (
              <Badge variant="outline" className="text-xs">
                {restaurant.cuisine}
              </Badge>
            )}
            {restaurant.priceRange && (
              <div className="flex items-center gap-1">
                <DollarSign size={12} />
                <span className="text-xs">{restaurant.priceRange}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin
            size={16}
            className="text-muted-foreground mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-muted-foreground">{restaurant.address}</p>
        </div>

        {/* Rating and Hours */}
        <div className="flex items-center gap-4 text-sm">
          {restaurant.rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span>{restaurant.rating}</span>
            </div>
          )}
          {restaurant.hours && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="text-muted-foreground">{restaurant.hours}</span>
            </div>
          )}
        </div>

        {/* Special Features */}
        {restaurant.specialFeatures && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Features:
            </p>
            <p className="text-xs text-muted-foreground">
              {restaurant.specialFeatures}
            </p>
          </div>
        )}

        {/* Recommendation Reason */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Why we recommend:
          </p>
          <p className="text-sm text-muted-foreground">{restaurant.reason}</p>
        </div>

        {/* Specific Recommendation */}
        {restaurant.recommendation && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Tip:</p>
            <p className="text-sm text-muted-foreground">
              {restaurant.recommendation}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {restaurant.googleMapsLink && (
            <Button
              onClick={() => onOpenMaps(restaurant.googleMapsLink)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Navigation size={14} className="mr-2" />
              View on Google Maps
            </Button>
          )}

          <div className="flex gap-2">
            {restaurant.phone && (
              <Button
                onClick={() => onCall(restaurant.phone)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Phone size={14} className="mr-2" />
                Call
              </Button>
            )}

            {restaurant.website && (
              <Button
                onClick={() => onVisitWebsite(restaurant.website)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Globe size={14} className="mr-2" />
                Website
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Recommendations;
