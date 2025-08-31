# Location-Based Restaurant Recommendations

This document describes the implementation of the location-based restaurant recommendations feature using the backend `/restaurant` endpoint.

## Overview

The feature allows users to search for restaurant recommendations by location. It leverages the existing backend API to provide personalized restaurant suggestions based on user preferences and location.

## Implementation Details

### Files Modified/Created

1. **`src/services/restaurantService.ts`** - New service file for API calls
2. **`src/pages/Recommendations.tsx`** - Updated to implement location-based search

### API Integration

The feature uses the following backend endpoint:

- **GET** `/restaurant?location={location}` - Returns restaurant recommendations for a given location

#### Request Headers

- `Content-Type: application/json`
- `x-auth-token: {token}` (optional, for personalized recommendations)

#### Response Format

The API returns data matching the `GetRestaurantRecommendationsResponse` schema:

```typescript
{
  query: string;
  answer: Recommendation[];
  rawAnswer: string;
}
```

Where each `Recommendation` contains:

- `name`: Restaurant name
- `address`: Full street address
- `phone`: Phone number (optional)
- `website`: Website URL (optional)
- `googleMapsLink`: Google Maps link (optional)
- `reason`: Why this restaurant is recommended
- `recommendation`: Specific recommendation or tip
- `cuisine`: Type of cuisine (optional)
- `priceRange`: Price range (optional)
- `rating`: Average rating (optional)
- `hours`: Operating hours (optional)
- `specialFeatures`: Special features (optional)

### Features

1. **Location Search**: Users can enter any location (city, neighborhood, address)
2. **Real-time Search**: Press Enter or click Search button to get recommendations
3. **Loading States**: Shows loading spinner during API calls
4. **Error Handling**: Displays user-friendly error messages
5. **Restaurant Cards**: Each restaurant is displayed in a card with:
   - Restaurant name and cuisine type
   - Address and contact information
   - Rating and operating hours
   - Special features
   - AI-generated recommendation reason
   - Action buttons (Google Maps, Call, Website)

### User Experience

1. **Search Interface**: Clean, intuitive search bar with location input
2. **Results Display**: Grid layout showing restaurant cards
3. **Interactive Elements**:
   - Click to open Google Maps
   - Click to call restaurant
   - Click to visit website
4. **Responsive Design**: Works on mobile and desktop
5. **Toast Notifications**: Success and error feedback

### Authentication

- The feature works for both authenticated and unauthenticated users
- Authenticated users get personalized recommendations based on their profile
- Unauthenticated users get general recommendations

### Error Handling

- Network errors are caught and displayed to the user
- Invalid locations show appropriate error messages
- Empty results are handled gracefully with helpful messaging

## Usage

1. Navigate to the Recommendations page
2. Enter a location in the search bar
3. Press Enter or click Search
4. Browse the recommended restaurants
5. Use the action buttons to interact with restaurants

## Dependencies

- `@your-project/schema` - For TypeScript types
- `lucide-react` - For icons
- `@/components/ui/*` - For UI components
- `@/contexts/AuthContext` - For authentication

## Future Enhancements

1. **Caching**: Cache results to improve performance
2. **Filters**: Add cuisine, price range, and rating filters
3. **Favorites**: Allow users to save favorite restaurants
4. **Reviews**: Display user reviews and ratings
5. **Map Integration**: Show restaurants on an interactive map

