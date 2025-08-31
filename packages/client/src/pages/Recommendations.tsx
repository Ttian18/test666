import { useState } from "react";
import {
  MapPin,
  Star,
  Clock,
  DollarSign,
  Phone,
  Globe,
  Navigation,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import TopNavigation from "@/components/TopNavigation";
import RestaurantService from "@/services/restaurantService";
import { Recommendation } from "@your-project/schema";
import { toast } from "@/components/ui/use-toast";

const Recommendations = () => {
  const { token } = useAuthContext();
  const [location, setLocation] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description:
          "Please enter a location to get restaurant recommendations",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await RestaurantService.getRestaurantRecommendations(
        location,
        token || undefined
      );
      setRecommendations(response.answer);

      toast({
        title: "Recommendations Found",
        description: `Found ${response.answer.length} restaurants in ${location}`,
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
    <div className="page-background-recommendations">
      <TopNavigation />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Restaurant Recommendations
          </h1>
          <p className="text-muted-foreground">
            Discover great restaurants near you with AI-powered recommendations
          </p>
        </div>

        {/* Location Search */}
        <Card className="themed-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Find Restaurants Near You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter city, neighborhood, or address..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !location.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter a location to get personalized restaurant recommendations
              based on your preferences
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
              <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
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
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RestaurantCardProps {
  restaurant: Recommendation;
  onOpenMaps: (link: string) => void;
  onCall: (phone: string) => void;
  onVisitWebsite: (website: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onOpenMaps,
  onCall,
  onVisitWebsite,
}) => {
  return (
    <Card className="themed-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="space-y-2">
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
