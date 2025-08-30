# NextAI Finance App

A comprehensive AI-powered finance and restaurant recommendation application built with React, Node.js, and modern AI technologies.

## 🚀 Features

### Restaurant Recommendations

- **Location-based Recommendations**: Get personalized restaurant suggestions based on your location using Google Places API
- **AI-Powered Analysis**: Uses OpenAI GPT-4 and LangChain for intelligent restaurant discovery
- **Menu Analysis with History**: Upload menu images to get budget-friendly recommendations with user history tracking
- **Social Media Integration**: Analyze restaurant social media content for insights (Zhongcao)
- **Legacy Menu Analysis**: Public menu analysis with caching (no authentication required)

### Financial Management

- **User-Aware Transaction System**: All transactions scoped to authenticated users
- **Receipt Processing**: Upload receipt images for automatic transaction categorization
- **Bulk Upload**: Process multiple receipts at once
- **Transaction Tracking**: Comprehensive transaction management with categories and notes
- **Voucher System**: Digital voucher management with status tracking
- **Financial Analytics**: Generate personalized insights and statistics from your spending data
- **Cross-User Security**: Complete data isolation between users

### AI Capabilities

- **Image Recognition**: Extract information from restaurant photos and receipts
- **Natural Language Processing**: Analyze descriptions and social media content
- **Recommendation Engine**: AI-powered suggestions based on preferences and budget
- **Google Places Integration**: Real-time location data and place information

## 🏗️ Architecture

This is a monorepo containing three main packages:

```
nextai-finance-app-monorepo/
├── packages/
│   ├── client/          # React frontend application
│   ├── server/          # Node.js/Express backend API
│   └── common/          # Shared utilities and types
├── package.json         # Root package configuration
└── README.md           # This file
```

### Frontend (Client)

- **Framework**: React 18 with Vite
- **UI**: Custom CSS with modern design
- **Features**: File upload, real-time updates, responsive design

### Backend (Server)

- **Framework**: Express.js with ES modules
- **Database**: PostgreSQL with Prisma ORM
- **AI Services**: OpenAI API (GPT-4, GPT-4o-mini), LangChain, Google Places API
- **Authentication**: JWT-based authentication with user-aware security
- **File Processing**: Multer for file uploads, Sharp for image processing
- **User Isolation**: Complete data separation and access control

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** database
- **Git**

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nextai-finance-app-monorepo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `packages/server/` directory:

   ```env
   PORT=5001
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

4. **Set up the database**

   ```bash
   cd packages/server
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Set up frontend environment**

   Create a `.env` file in the `packages/client/` directory:

   ```env
   VITE_BACKEND_URL=http://localhost:5001
   ```

## 🚀 Development

### Starting the Development Servers

From the root directory, run:

```bash
npm run dev
```

This will start both the frontend and backend servers concurrently:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5001

### Individual Package Development

You can also run packages individually:

**Frontend only:**

```bash
npm run dev --workspace=client
```

**Backend only:**

```bash
npm run dev --workspace=server
```

### Database Management

**Generate Prisma client:**

```bash
cd packages/server
npx prisma generate
```

**Run database migrations:**

```bash
cd packages/server
npx prisma db push
```

**Seed the database:**

```bash
cd packages/server
npm run seed
```

**Open Prisma Studio:**

```bash
cd packages/server
npx prisma studio
```

## 📁 Project Structure

### Client Package (`packages/client/`)

```
client/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   ├── index.css            # Global styles
│   ├── services/            # API service functions
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── dist/                    # Build output
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Client dependencies
```

### Server Package (`packages/server/`)

```
server/
├── src/
│   ├── config/              # Application configuration
│   ├── models/              # Database models and Prisma schema
│   ├── routes/              # API route handlers
│   │   ├── auth/            # Authentication routes
│   │   ├── restaurant/      # Restaurant-related routes
│   │   └── transaction/     # Transaction management routes
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   └── types/               # Type definitions
├── uploads/                 # File upload directory
├── server.js                # Express server entry point
├── seed.js                  # Database seeding script
└── package.json             # Server dependencies
```

## 🔧 API Endpoints

Below is a detailed list of all available API endpoints for developers.

---

### Authentication (`/auth`)

#### **`POST /register`**

Registers a new user.

- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "a-strong-password"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "User registered successfully",
    "userId": 1,
    "token": "jwt.token.string"
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If email or password are invalid.
  - `409 Conflict`: If the email is already registered.

---

#### **`POST /login`**

Logs in an existing user.

- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "a-strong-password"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Login successful",
    "userId": 1,
    "token": "jwt.token.string",
    "profileComplete": true
  }
  ```
- **Error Responses**:
  - `401 Unauthorized`: If credentials are invalid.

---

#### **`POST /profile`**

Creates or updates a user's profile.

- **Authentication**: **Required** (`x-auth-token` header)
- **Request Body**:
  ```json
  {
    "monthlyBudget": 2000,
    "monthlyIncome": 5000,
    "expensePreferences": {
      "categories": {
        "Food": 0.4,
        "Transport": 0.2,
        "Shopping": 0.2,
        "Utilities": 0.1,
        "Other": 0.1
      }
    },
    "savingsGoals": {
      "goalAmount": 10000,
      "targetDate": "2026-12-31"
    },
    "lifestylePreferences": {
      "diningStyle": "Casual",
      "hobbies": ["Reading", "Hiking"]
    }
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Profile saved successfully",
    "profileId": "some-uuid",
    "profileComplete": true
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If required profile fields are missing. Example:
    ```json
    {
      "message": "Missing required profile fields: monthlyBudget, monthlyIncome"
    }
    ```

---

#### **`GET /profile`**

Retrieves the authenticated user's profile.

- **Authentication**: **Required** (`x-auth-token` header)
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": "some-uuid",
    "userId": 1,
    "name": "John Doe",
    "preferences": {
      "cuisine": ["Italian", "Japanese"],
      "diningStyle": "Casual"
    },
    "budget": { "min": 20, "max": 50 }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: If the user does not have a profile.

---

### Transactions (`/transactions`)

#### **`GET /`**

Retrieves a list of transactions for the authenticated user.

- **Authentication**: **Required**
- **Query Parameters**:
  - `category` (string, optional): Filter by category.
  - `startDate` (string, optional): ISO 8601 date.
  - `endDate` (string, optional): ISO 8601 date.
  - `limit` (number, optional): Number of records to return.
  - `offset` (number, optional): Number of records to skip.
- **Success Response (`200 OK`)**:
  ```json
  {
    "transactions": [
      {
        "id": 1,
        "user_id": 1,
        "amount": 50.0,
        "category": "Food",
        "date": "2023-10-27T12:00:00.000Z",
        "merchant": "Restaurant"
      }
    ],
    "count": 1,
    "userId": 1
  }
  ```

---

#### **`POST /`**

Creates a new manual transaction.

- **Authentication**: **Required**
- **Request Body**:
  ```json
  {
    "amount": 75.5,
    "category": "Shopping",
    "date": "2023-10-28",
    "merchant": "Mall",
    "source": "manual"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Transaction created successfully",
    "transaction": { ... } // Transaction object
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If required fields are missing. Example:
    ```json
    {
      "error": "Missing required field: source"
    }
    ```

---

#### **`GET /:id`**

Retrieves a single transaction by its ID.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Success Response (`200 OK`)**:
  ```json
  {
    "transaction": { ... } // Transaction object
  }
  ```
- **Error Responses**:
  - `404 Not Found`: If transaction with that ID doesn't exist or doesn't belong to the user.

---

#### **`PUT /:id`**

Updates a transaction.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Request Body**: Any subset of transaction fields.
  ```json
  {
    "amount": 85.0,
    "category": "Food",
    "merchant": "Updated Restaurant Name"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Transaction updated successfully",
    "transaction": { ... } // Updated transaction object
  }
  ```

---

#### **`DELETE /:id`**

Deletes a transaction.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Transaction deleted successfully"
  }
  ```

---

#### **`GET /stats`**

Retrieves statistics for the user's transactions.

- **Authentication**: **Required**
- **Query Parameters**:
  - `startDate` (string, optional)
  - `endDate` (string, optional)
- **Success Response (`200 OK`)**:
  ```json
  {
    "stats": {
      "totalTransactions": 10,
      "totalSpent": 1234.56,
      "averageTransaction": 123.45
    }
  }
  ```

---

#### **`GET /categories`**

Retrieves a list of all available transaction categories.

- **Authentication**: None
- **Success Response (`200 OK`)**:
  ```json
  {
    "categories": ["Food", "Transport", "Shopping", ...]
  }
  ```

---

### Vouchers (`/transactions/vouchers`)

#### **`POST /upload`**

Uploads a single receipt image for processing.

- **Authentication**: **Required**
- **Request Body**: `multipart/form-data` with a single file field named `receipt`.
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Receipt uploaded and processed successfully",
    "voucher": { ... },
    "transaction": { ... },
    "parsedData": { ... }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: If no file is uploaded or the file type is invalid.
  - `422 Unprocessable Entity`: If the AI successfully processes the image but cannot find the required fields (e.g., merchant, total_amount).
  - `500 Internal Server Error`: If an unexpected error occurs during processing, such as a failure to communicate with the AI service.

---

#### **`POST /bulk-upload`**

Uploads multiple receipt images (up to 10) for processing.

- **Authentication**: **Required**
- **Request Body**: `multipart/form-data` with a file field named `receipts`.
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Processed 9 receipts successfully, 1 failed",
    "summary": { "successful": 9, "failed": 1, "total": 10 },
    "results": [ ... ],
    "errors": [ ... ]
  }
  ```

---

### Restaurant & Menu Analysis (`/restaurants`)

#### **`GET /`**

Get personalized restaurant recommendations based on location.

- **Authentication**: **Optional** (personalized if authenticated)
- **Query Parameters**:
  - `location` (string, required): Location to search for restaurants
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Personalized restaurant recommendations",
    "location": "downtown Los Angeles",
    "personalized": true,
    "recommendations": [
      {
        "name": "Bestia",
        "address": "2121 E 7th Pl, Los Angeles, CA 90021",
        "phone": "(213) 514-5724",
        "website": "bestiala.com",
        "googleMapsLink": "https://www.google.com/maps/...",
        "reason": "Great for seafood lovers like you",
        "cuisine": "Italian",
        "priceRange": "$$$",
        "rating": "4.5"
      }
    ]
  }
  ```

---

#### **`POST /menu-analysis`**

Analyzes a menu image and provides budget-based recommendations with user history tracking.

- **Authentication**: **Required** (`x-auth-token` header)
- **Request Body**: `multipart/form-data` with fields:
  - `image` (file): The menu image.
  - `budget` (number): The budget for the meal.
  - `userNote` (string, optional): Additional notes for the AI.
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Menu analysis completed successfully",
    "cached": false,
    "menuInfo": {
      "currency": "$",
      "items": [
        {
          "name": "THE GREEK ANGEL",
          "price": 24.95,
          "description": "spaghettini, tomato sauce, fresh herbs",
          "category": "Pasta"
        }
      ]
    },
    "recommendation": { ... }
  }
  ```

---

#### **`GET /menu-analysis/history`**

Get user's menu analysis history.

- **Authentication**: **Required**
- **Query Parameters**:
  - `limit` (number, optional): Number of records to return (default: 50)
  - `offset` (number, optional): Number of records to skip (default: 0)
  - `includeUser` (boolean, optional): Include user data in response
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Menu analysis history retrieved successfully",
    "analyses": [ ... ],
    "count": 10
  }
  ```

---

#### **`GET /menu-analysis/history/:id`**

Get specific menu analysis by ID.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Menu analysis retrieved successfully",
    "analysis": { ... }
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Menu analysis not found or access denied

---

#### **`PUT /menu-analysis/history/:id`**

Update menu analysis notes or budget.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Request Body**:
  ```json
  {
    "userNote": "Updated note about this menu analysis",
    "budget": 30
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Menu analysis updated successfully",
    "analysis": { ... }
  }
  ```

---

#### **`DELETE /menu-analysis/history/:id`**

Delete menu analysis from history.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Success Response (`204 No Content`)**

---

#### **`GET /menu-analysis/stats`**

Get user's menu analysis statistics.

- **Authentication**: **Required**
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Menu analysis statistics retrieved successfully",
    "stats": {
      "totalAnalyses": 15,
      "fallbackAnalyses": 2,
      "successfulAnalyses": 13,
      "averageBudget": 27.5,
      "recentAnalyses": 8,
      "successRate": "86.7"
    }
  }
  ```

---

#### **`POST /zhongcao/social-upload`**

Analyzes a restaurant image from social media to extract details.

- **Authentication**: **Required** (`x-auth-token` header)
- **Request Body**: `multipart/form-data` with a single file field named `image`.
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Image processed successfully",
    "result": { ... }, // The created database record
    "extractedInfo": { ... } // The raw data from AI
  }
  ```

---

#### **`GET /zhongcao`**

Get all zhongcao results for authenticated user.

- **Authentication**: **Required**
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 4,
      "restaurantName": "Sample Restaurant",
      "dishName": "Special Dish",
      "address": "123 Main St",
      "description": "Great restaurant experience",
      "socialMediaHandle": "@restaurant_handle",
      "createdAt": "2025-08-30T06:38:26.081Z"
    }
  ]
  ```

---

#### **`GET /zhongcao/:id`**

Get specific zhongcao result by ID.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "user_id": 4,
    "restaurantName": "Sample Restaurant",
    // ... other fields
  }
  ```
- **Error Responses**:
  - `404 Not Found`: Zhongcao result not found or access denied

---

#### **`PUT /zhongcao/:id`**

Update zhongcao result.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Request Body**:
  ```json
  {
    "restaurantName": "Updated Restaurant Name",
    "dishName": "Updated Dish Name",
    "address": "Updated Address",
    "description": "Updated description",
    "socialMediaHandle": "@updated_handle"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "user_id": 4,
    "restaurantName": "Updated Restaurant Name",
    // ... updated fields
  }
  ```

---

#### **`DELETE /zhongcao/:id`**

Delete zhongcao result.

- **Authentication**: **Required**
- **URL Parameters**: `id` (number)
- **Success Response (`204 No Content`)**

---

#### **Legacy Menu Analysis Endpoints (`/restaurants/recommendations`)**

*These endpoints provide menu analysis without authentication and user history tracking.*

#### **`POST /recommendations/recommend`**

Analyze menu image with caching (no authentication required).

- **Authentication**: **None**
- **Request Body**: `multipart/form-data` with fields:
  - `image` (file): The menu image
  - `budget` (number): The budget for the meal
  - `note` (string, optional): Additional notes
- **Success Response (`200 OK`)**:
  ```json
  {
    "menuInfo": { ... },
    "recommendation": { ... },
    "cached": false
  }
  ```

---

#### **`GET /recommendations/last`**

Get last cached recommendation.

- **Authentication**: **None**
- **Success Response (`200 OK`)**:
  ```json
  {
    "menuInfo": { ... },
    "recommendation": { ... },
    "budget": 25,
    "timestamp": "2025-08-30T06:38:26.081Z"
  }
  ```

---

#### **`POST /recommendations/rebudget`**

Re-recommend with new budget using cached menu.

- **Authentication**: **None**
- **Request Body**:
  ```json
  {
    "budget": 30,
    "note": "Updated budget preferences"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "menuInfo": { ... },
    "recommendation": { ... }
  }
  ```

---

### Financial Insights (`/transactions/insights`)

#### **`GET /insights/summary`**

Get spending summary for authenticated user.

- **Authentication**: **Required**
- **Query Parameters**:
  - `period` (string, optional): Time period (monthly, yearly, etc.)
  - `category` (string, optional): Filter by category
  - `startDate` (string, optional): Start date (ISO 8601)
  - `endDate` (string, optional): End date (ISO 8601)
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "userId": 4,
      "period": "monthly",
      "summary": {
        "totalTransactions": 9,
        "totalAmount": 721.76,
        "averageAmount": 80.20
      },
      "periodBreakdown": [ ... ]
    }
  }
  ```

---

#### **`GET /insights/categories`**

Get category analysis for authenticated user.

- **Authentication**: **Required**
- **Query Parameters**:
  - `startDate` (string, optional): Start date
  - `endDate` (string, optional): End date
  - `limit` (number, optional): Number of categories to return
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "categories": [ ... ],
      "totalAmount": 1234.56
    }
  }
  ```

---

#### **`GET /insights/merchants`**

Get merchant analysis for authenticated user.

- **Authentication**: **Required**
- **Query Parameters**: Same as categories
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "merchants": [ ... ],
      "totalAmount": 1234.56
    }
  }
  ```

---

#### **`GET /insights/trends`**

Get spending trends for authenticated user.

- **Authentication**: **Required**
- **Query Parameters**:
  - `period` (string, optional): Time period for trends
  - `periods` (number, optional): Number of periods to analyze
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "trends": [ ... ],
      "period": "monthly"
    }
  }
  ```

---

#### **`GET /insights/budget`**

Get budget analysis for authenticated user.

- **Authentication**: **Required**
- **Query Parameters**:
  - `monthlyBudget` (number, required): Monthly budget amount
  - `month` (string, optional): Specific month to analyze
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "budgetAnalysis": { ... },
      "monthlyBudget": 2000
    }
  }
  ```

---

#### **`GET /insights/dashboard`**

Get comprehensive dashboard data for authenticated user.

- **Authentication**: **Required**
- **Query Parameters**:
  - `monthlyBudget` (number, optional): Monthly budget for budget analysis
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": { ... },
      "topCategories": [ ... ],
      "trends": [ ... ],
      "budget": { ... }
    }
  }
  ```

## 🔐 Environment Variables

### Required Environment Variables

| Variable                | Description                    | Example            |
| ----------------------- | ------------------------------ | ------------------ |
| `PORT`                  | Server port number             | `5001`             |
| `OPENAI_API_KEY`        | OpenAI API key for AI features | `sk-...`           |
| `GOOGLE_PLACES_API_KEY` | Google Places API key          | `AIza...`          |
| `DATABASE_URL`          | PostgreSQL connection string   | `postgresql://...` |
| `JWT_SECRET`            | Secret for JWT token signing   | `your-secret-key`  |
| `NODE_ENV`              | Environment mode               | `development`      |

## 🧪 Testing

### API Testing with Postman

A comprehensive Postman collection is available at `/postman/NextAI_Finance_App.postman_collection.json` with all endpoints pre-configured:

1. **Import the collection** into Postman
2. **Set environment variables**:
   - `baseUrl`: `http://localhost:5001`
   - `authToken`: Your JWT token from login/register
3. **Test all endpoints** including:
   - Authentication (register, login, profile)
   - Transactions with full CRUD operations
   - Financial insights and analytics
   - Restaurant recommendations (with/without auth)
   - Menu analysis with history tracking
   - Zhongcao social media analysis
   - Legacy menu analysis endpoints

### Run Recommendation Tests

```bash
cd packages/server
npm run test:reco
```

### Run Unit Tests

```bash
cd packages/server
npm test
```

## 📦 Building for Production

### Build Frontend

```bash
cd packages/client
npm run build
```

### Start Production Server

```bash
cd packages/server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Add appropriate error handling
- Include comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include error messages, steps to reproduce, and environment details

## 🔄 Version History

- **v2.0.0** - **Major User-Aware Refactor**
  - ✅ Complete user-aware authentication system implemented
  - ✅ All transactions, menu analyses, and zhongcao results scoped to authenticated users
  - ✅ Menu analysis history tracking with full CRUD operations
  - ✅ Financial insights with user isolation and personalization
  - ✅ Enhanced error handling with proper HTTP status codes
  - ✅ Comprehensive API documentation and Postman collection
  - ✅ Cross-user security and data isolation
  - ✅ Database migrations for user relationships
  - ✅ Legacy endpoints maintained for backward compatibility

- **v1.0.0** - Initial release with restaurant recommendations and transaction management

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Google Places API for location services
- Prisma for database management
- React and Express.js communities

---

**Note**: Make sure to replace placeholder values (API keys, database URLs) with your actual credentials before running the application.
