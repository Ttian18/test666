# Restaurant Search History CRUD API Documentation

This document provides comprehensive documentation for the Restaurant Search History CRUD (Create, Read, Update, Delete) API endpoints.

## Base URL

```
/api/restaurants/search-history
```

## Authentication

All endpoints require authentication via the `x-auth-token` header.

## API Endpoints

### 1. CREATE (Create Search History)

#### Automatic Creation

Search history is automatically created when users perform restaurant searches through the recommendation service. No manual creation endpoint is provided as it's handled internally.

**Triggered by:** `POST /api/restaurants` (restaurant recommendations)

---

### 2. READ (Retrieve Search History)

#### 2.1 Get All Search History

```http
GET /api/restaurants/search-history
```

**Query Parameters:**

- `limit` (optional): Number of results per page (default: 20, max: 100)
- `offset` (optional): Number of results to skip (default: 0)
- `days` (optional): Number of days to look back (default: 30)

**Response:**

```json
{
  "success": true,
  "data": {
    "searchHistory": [
      {
        "id": 1,
        "search_query": "restaurants in San Francisco",
        "location": "San Francisco",
        "result_count": 5,
        "created_at": "2024-01-20T10:30:00Z",
        "updated_at": "2024-01-20T10:30:00Z"
      }
    ],
    "stats": {
      "totalSearches": 25,
      "uniqueQueries": 20,
      "mostSearchedLocation": "San Francisco",
      "lastSearchDate": "2024-01-20T10:30:00Z"
    },
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 25
    }
  }
}
```

#### 2.2 Get Specific Search History Details

```http
GET /api/restaurants/search-history/:id
```

**Path Parameters:**

- `id`: Search history record ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "search_query": "restaurants in San Francisco",
    "location": "San Francisco",
    "search_results": [
      {
        "name": "Restaurant Name",
        "address": "123 Main St",
        "rating": 4.5,
        "cuisine": "Italian"
      }
    ],
    "result_count": 5,
    "user_preferences": {
      "name": "John Doe",
      "monthlyBudget": 2000
    },
    "created_at": "2024-01-20T10:30:00Z",
    "updated_at": "2024-01-20T10:30:00Z"
  }
}
```

#### 2.3 Search Within Search History

```http
POST /api/restaurants/search-history/search
```

**Request Body:**

```json
{
  "searchTerm": "pizza",
  "limit": 20,
  "offset": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "searchResults": [
      {
        "id": 1,
        "search_query": "pizza restaurants in NYC",
        "location": "NYC",
        "result_count": 3,
        "created_at": "2024-01-20T10:30:00Z",
        "updated_at": "2024-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 1
    }
  }
}
```

#### 2.4 Get Search History by Date Range

```http
POST /api/restaurants/search-history/date-range
```

**Request Body:**

```json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "limit": 20,
  "offset": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "searchHistory": [
      {
        "id": 1,
        "search_query": "restaurants in San Francisco",
        "location": "San Francisco",
        "result_count": 5,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 1
    }
  }
}
```

---

### 3. UPDATE (Update Search History)

#### 3.1 Update Specific Search History

```http
PUT /api/restaurants/search-history/:id
```

**Path Parameters:**

- `id`: Search history record ID

**Request Body:**

```json
{
  "search_query": "updated search query",
  "location": "updated location",
  "search_results": [...],
  "result_count": 10,
  "user_preferences": {...}
}
```

**Response:**

```json
{
  "success": true,
  "message": "Search history updated successfully",
  "data": {
    "id": 1,
    "search_query": "updated search query",
    "location": "updated location",
    "result_count": 10,
    "created_at": "2024-01-20T10:30:00Z",
    "updated_at": "2024-01-20T11:00:00Z"
  }
}
```

---

### 4. DELETE (Delete Search History)

#### 4.1 Delete Specific Search History

```http
DELETE /api/restaurants/search-history/:id
```

**Path Parameters:**

- `id`: Search history record ID

**Response:**

```json
{
  "success": true,
  "message": "Search history deleted successfully"
}
```

#### 4.2 Bulk Delete Search History

```http
POST /api/restaurants/search-history/bulk-delete
```

**Request Body:**

```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Deleted 5 search history records",
  "deletedCount": 5
}
```

#### 4.3 Delete All User's Search History

```http
DELETE /api/restaurants/search-history
```

**Response:**

```json
{
  "success": true,
  "message": "Deleted 25 search history records",
  "deletedCount": 25
}
```

---

## Error Responses

### Authentication Errors

```json
{
  "error": "Authentication required",
  "code": "AUTHENTICATION_REQUIRED"
}
```

```json
{
  "error": "Invalid authentication token",
  "code": "INVALID_TOKEN"
}
```

### Validation Errors

```json
{
  "error": "Invalid parameters",
  "code": "INVALID_PARAMETERS",
  "details": [
    {
      "field": "searchTerm",
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

### Not Found Errors

```json
{
  "error": "Search history not found",
  "code": "NOT_FOUND"
}
```

### Access Denied Errors

```json
{
  "error": "Access denied",
  "code": "ACCESS_DENIED"
}
```

### Server Errors

```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## Frontend Service Methods

### RestaurantService Class Methods

#### Get Search History

```typescript
static async getSearchHistory(
  token: string,
  options?: {
    limit?: number;
    offset?: number;
    days?: number;
  }
): Promise<SearchHistoryResponse>
```

#### Get Search History Details

```typescript
static async getSearchHistoryDetails(
  id: number,
  token: string
): Promise<SearchHistoryDetails>
```

#### Update Search History

```typescript
static async updateSearchHistory(
  id: number,
  updateData: {
    search_query?: string;
    location?: string;
    search_results?: any[];
    result_count?: number;
    user_preferences?: any;
  },
  token: string
): Promise<UpdatedSearchHistory>
```

#### Search in History

```typescript
static async searchInHistory(
  searchTerm: string,
  token: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<SearchResults>
```

#### Get Search History by Date Range

```typescript
static async getSearchHistoryByDateRange(
  startDate: string,
  endDate: string,
  token: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<SearchHistoryResponse>
```

#### Delete Search History

```typescript
static async deleteSearchHistory(
  id: number,
  token: string
): Promise<void>
```

#### Bulk Delete Search History

```typescript
static async bulkDeleteSearchHistory(
  ids: number[],
  token: string
): Promise<{ deletedCount: number }>
```

#### Delete All Search History

```typescript
static async deleteAllSearchHistory(
  token: string
): Promise<{ deletedCount: number }>
```

---

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

### Indexes

- `restaurant_search_history_user_id_idx` on `user_id`
- `restaurant_search_history_created_at_idx` on `created_at`
- `restaurant_search_history_search_query_idx` on `search_query`

### Foreign Keys

- `restaurant_search_history_user_id_fkey` references `User(id)` ON DELETE CASCADE

---

## Usage Examples

### Frontend Integration

#### 1. Fetch Search History

```typescript
const { token } = useAuthContext();
const [searchHistory, setSearchHistory] = useState([]);

useEffect(() => {
  const fetchHistory = async () => {
    try {
      const response = await RestaurantService.getSearchHistory(token, {
        limit: 20,
        days: 30,
      });
      setSearchHistory(response.searchHistory);
    } catch (error) {
      console.error("Failed to fetch search history:", error);
    }
  };

  fetchHistory();
}, [token]);
```

#### 2. Update Search History

```typescript
const updateSearch = async (id: number, newQuery: string) => {
  try {
    await RestaurantService.updateSearchHistory(
      id,
      {
        search_query: newQuery,
      },
      token
    );
    // Refresh the list
    fetchSearchHistory();
  } catch (error) {
    console.error("Failed to update search history:", error);
  }
};
```

#### 3. Bulk Delete

```typescript
const bulkDelete = async (selectedIds: number[]) => {
  try {
    const result = await RestaurantService.bulkDeleteSearchHistory(
      selectedIds,
      token
    );
    console.log(`Deleted ${result.deletedCount} records`);
    // Refresh the list
    fetchSearchHistory();
  } catch (error) {
    console.error("Failed to bulk delete:", error);
  }
};
```

#### 4. Search in History

```typescript
const searchInHistory = async (searchTerm: string) => {
  try {
    const results = await RestaurantService.searchInHistory(searchTerm, token);
    setSearchHistory(results.searchResults);
  } catch (error) {
    console.error("Failed to search in history:", error);
  }
};
```

---

## Features

### ✅ Complete CRUD Operations

- **Create**: Automatic creation during restaurant searches
- **Read**: Multiple read operations with filtering and pagination
- **Update**: Update search queries, locations, and other fields
- **Delete**: Individual, bulk, and complete deletion

### ✅ Advanced Query Features

- Search within search history
- Filter by date range
- Pagination support
- Sorting options
- User-specific data isolation

### ✅ Security Features

- User authentication required
- User ownership validation
- Input validation and sanitization
- SQL injection prevention

### ✅ Performance Features

- Database indexes for optimal queries
- Pagination to handle large datasets
- Asynchronous operations
- Caching considerations

### ✅ Frontend Features

- Modern React components
- Real-time updates
- Bulk operations UI
- Export functionality
- Responsive design

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use to prevent abuse.

## Caching

Search history is stored in the database. Consider implementing Redis caching for frequently accessed data in high-traffic scenarios.

## Monitoring

Monitor the following metrics:

- Search history creation rate
- API response times
- Error rates
- Database query performance
- User engagement with search history features
