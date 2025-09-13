# Restaurant Search History Feature

This document describes the restaurant search history feature that has been implemented to store and manage user search queries and results.

## Overview

The restaurant search history feature allows users to:

- View their past restaurant searches
- Access detailed search results from previous queries
- Manage their search history (delete individual or all records)
- View search statistics and analytics

## Database Schema

### RestaurantSearchHistory Table

```sql
CREATE TABLE "restaurant_search_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "search_query" TEXT NOT NULL,
    "location" TEXT,
    "search_results" JSONB NOT NULL,
    "result_count" INTEGER NOT NULL DEFAULT 0,
    "user_preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "restaurant_search_history_pkey" PRIMARY KEY ("id")
);
```

## API Endpoints

### Get Search History

- **GET** `/api/restaurants/search-history`
- **Query Parameters:**
  - `limit` (optional): Number of results per page (default: 20, max: 100)
  - `offset` (optional): Number of results to skip (default: 0)
  - `days` (optional): Number of days to look back (default: 30)
- **Response:** List of search history items with pagination and statistics

### Get Search History Details

- **GET** `/api/restaurants/search-history/:id`
- **Response:** Full search details including complete results

### Delete Search History

- **DELETE** `/api/restaurants/search-history/:id`
- **Response:** Success confirmation

### Delete All Search History

- **DELETE** `/api/restaurants/search-history`
- **Response:** Number of deleted records

## Frontend Components

### SearchHistory Page

- **Route:** `/search-history`
- **Features:**
  - Search history list with filtering
  - Search statistics dashboard
  - Individual search details modal
  - Delete functionality (individual and bulk)

### Integration with Recommendations Page

- Added "Search History" button in the recommendations page header
- Seamless navigation between search and history views

## Implementation Details

### Backend Services

1. **RestaurantSearchHistory Entity** (`packages/server/src/models/entities/RestaurantSearchHistory.ts`)

   - CRUD operations for search history
   - Query methods for filtering and pagination
   - Statistics calculation methods

2. **Recommendation Service Integration** (`packages/server/src/services/restaurant/recommendationService.ts`)

   - Automatically saves search history after each recommendation
   - Duplicate detection (prevents saving similar searches within 1 hour)
   - Location extraction from search queries

3. **API Routes** (`packages/server/src/routes/restaurant/searchHistoryRoutes.ts`)
   - RESTful endpoints for search history management
   - Authentication and authorization
   - Input validation using Zod schemas

### Frontend Services

1. **RestaurantService Extensions** (`packages/client/src/services/restaurantService.ts`)

   - `getSearchHistory()` - Fetch paginated search history
   - `getSearchHistoryDetails()` - Get full search details
   - `deleteSearchHistory()` - Delete specific search
   - `deleteAllSearchHistory()` - Delete all user searches

2. **SearchHistory Page** (`packages/client/src/pages/SearchHistory.tsx`)
   - Modern React component with TypeScript
   - Real-time filtering and search
   - Responsive design with mobile support
   - Statistics dashboard

## Features

### Search History Management

- **Automatic Saving:** Every restaurant search is automatically saved
- **Duplicate Prevention:** Similar searches within 1 hour are not duplicated
- **Location Extraction:** Automatically extracts location from search queries
- **User Preferences:** Stores user data used for personalization

### Search Statistics

- Total number of searches
- Number of unique queries
- Most searched location
- Last search date

### Filtering and Search

- Filter by time period (7, 30, 90, 365 days)
- Search within queries and locations
- Pagination support
- Results per page configuration

### Data Privacy

- Users can only access their own search history
- Individual and bulk delete options
- Secure API endpoints with authentication

## Usage

### For Users

1. Navigate to the Restaurant Recommendations page
2. Perform searches as usual - they will be automatically saved
3. Click "Search History" button to view past searches
4. Use filters to find specific searches
5. Click "View Details" to see full search results
6. Delete individual searches or clear all history

### For Developers

1. The feature is automatically enabled for all authenticated users
2. Search history is saved asynchronously to avoid affecting response times
3. Database indexes are created for optimal query performance
4. All API endpoints include proper error handling and validation

## Database Migration

To apply the database changes:

```bash
# Generate Prisma client
npx prisma generate

# Apply migration (if using Prisma migrations)
npx prisma migrate deploy

# Or reset database (development only)
npx prisma db push
```

## Configuration

### Environment Variables

No additional environment variables are required. The feature uses existing database and authentication configurations.

### Performance Considerations

- Database indexes are created for optimal query performance
- Search history is saved asynchronously to avoid blocking responses
- Pagination is implemented to handle large datasets
- Duplicate detection reduces unnecessary data storage

## Future Enhancements

Potential improvements for future versions:

1. **Search Analytics:** More detailed analytics and insights
2. **Export Functionality:** Export search history to CSV/PDF
3. **Search Suggestions:** Suggest searches based on history
4. **Favorites:** Allow users to mark favorite searches
5. **Search Sharing:** Share search results with others
6. **Advanced Filtering:** Filter by cuisine, price range, etc.
7. **Search Trends:** Show search trends over time
