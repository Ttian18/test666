# NextAI Finance App

A comprehensive AI-powered finance and restaurant recommendation application built with React, Node.js, and modern AI technologies.

## 🚀 Features

### Restaurant Recommendations

- **Location-based Recommendations**: Get personalized restaurant suggestions based on your location
- **AI-Powered Analysis**: Uses OpenAI and LangChain for intelligent restaurant analysis
- **Social Media Integration**: Analyze restaurant social media content for insights
- **Menu Analysis**: Upload menu images to get budget-friendly recommendations

### Financial Management

- **Receipt Processing**: Upload receipt images for automatic transaction categorization
- **Bulk Upload**: Process multiple receipts at once
- **Transaction Tracking**: Comprehensive transaction management with categories and notes
- **Voucher System**: Digital voucher management with status tracking
- **Financial Analytics**: Generate insights and statistics from your spending data

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
- **AI Services**: OpenAI API, LangChain, Google Places API
- **Authentication**: JWT-based authentication
- **File Processing**: Multer for file uploads, Sharp for image processing

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

#### **`POST /menu-analysis`**

Analyzes a menu image and provides budget-based recommendations.

- **Authentication**: Optional (`x-auth-token` header for user-specific context)
- **Request Body**: `multipart/form-data` with fields:
  - `image` (file): The menu image.
  - `budget` (number): The budget for the meal.
  - `userNote` (string, optional): Additional notes for the AI.
- **Success Response (`200 OK`)**:
  ```json
  {
    "message": "Menu analysis completed successfully",
    "cached": false,
    "menuInfo": { ... },
    "recommendation": { ... }
  }
  ```

---

#### **`POST /zhongcao/social-upload`**

Analyzes a restaurant image from social media to extract details.

- **Authentication**: None
- **Request Body**: `multipart/form-data` with a single file field named `image`.
- **Success Response (`201 Created`)**:
  ```json
  {
    "message": "Image processed successfully",
    "result": { ... }, // The created database record
    "extractedInfo": { ... } // The raw data from AI
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

### Run Recommendation Tests

```bash
cd packages/server
npm run test:reco
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

- **v1.0.0** - Initial release with restaurant recommendations and transaction management

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Google Places API for location services
- Prisma for database management
- React and Express.js communities

---

**Note**: Make sure to replace placeholder values (API keys, database URLs) with your actual credentials before running the application.
