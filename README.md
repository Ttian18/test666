# NextAI Finance App - Backend API

A modern, AI-powered financial management application backend built with Node.js, Express, and PostgreSQL. This API provides intelligent restaurantfecommendations, transaction management, and spending insights.

## 🚀 Features

- **🔐 User Authentication** - Secure registration and login with JWT
- **👤 Profile Management** - User profile creation and retrieval
- **🍽️ AI Restaurant Recommendations** - Personalized dining suggestions
- **📊 Transaction Management** - AI-powered receipt recognition and transaction tracking
- **📈 Spending Insights** - Financial analytics and spending summaries
- **🤖 Social Proof Integration** - Community-driven recommendations
- **📋 Menu Analysis** - AI-powered menu item analysis

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Environment:** dotenv
- **CORS:** Enabled for cross-origin requests

## 📁 Project Structure

```
server/
├── routes/
│   ├── authRoutes.js          # Authentication endpoints
│   ├── profileRoutes.js       # User profile management
│   ├── recommendationRoutes.js # Restaurant recommendations
│   ├── transactionRoutes.js   # Transaction management
│   └── insightsRoutes.js      # Spending analytics
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── server.js                  # Main server file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (optional for current version)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd test666
   ```

2. **Navigate to server directory**

   ```bash
   cd server
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Configure environment variables**

   ```bash
   # Copy and edit the .env file
   cp .env.example .env
   ```

   Update the `.env` file with your actual values:

   ```env
   PORT=5001
   DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JSON_WEB_TOKENS"
   ```

5. **Start the server**

   ```bash
   # Start backend only
   npm run dev --workspace=server

   # Or start both frontend and backend together (root package.json)
   npm run dev
   ```

```

 The server will start on `http://localhost:5001`

## 📡 API Endpoints

### Base URL

```

http://localhost:5001

````

### Zhongcao (Social Image Analysis) CRUD

```http
GET    /recommendations/zhongcao          # List all results (newest first)
GET    /recommendations/zhongcao/:id      # Get a single result
PUT    /recommendations/zhongcao/:id      # Update a result (requires restaurantName, description)
DELETE /recommendations/zhongcao/:id      # Delete a result
POST   /recommendations/social-upload     # Upload an image; analyzes + saves to DB and returns {result}
```

Validation and errors:
- 400 Invalid ID format when `:id` is not a positive number
- 400 Missing required fields for update
- 404 Record not found
- 500 Server error details

### Frontend Dev Proxy

The frontend (Vite on port 3000) proxies `/api` to the backend:

```
/api/*  → http://localhost:5001/*
```

So the UI calls, for example, `GET /api/recommendations/zhongcao`.

### Running without a real database (development)

You can run the backend against a mock in‑memory store by setting:

```bash
USE_MOCK_DB=true npm run dev --workspace=server
```

When `USE_MOCK_DB=true` or `DATABASE_URL` is absent, the server uses an in‑memory client for Zhongcao CRUD so the UI works without Postgres.

### UI Enhancements

The Saved Zhongcao Results table now features:
- Sticky header, zebra rows, hover highlight
- Pill badges for Dish, Address, Social
- Scrollable wrapper with custom scrollbars
- Inline edit and delete with better error messages

### 🔐 Authentication Endpoints

#### Register User

```http
POST /auth/register
````

**Response:**

```json
{
  "message": "Endpoint for user registration"
}
```

#### Login User

```http
POST /auth/login
```

**Response:**

```json
{
  "message": "Endpoint for user login"
}
```

### 👤 Profile Management

#### Create User Profile

```http
POST /profile
```

**Response:**

```json
{
  "message": "Endpoint to create a user profile"
}
```

#### Get User Profile

```http
GET /profile
```

**Response:**

```json
{
  "message": "Endpoint to get a user profile"
}
```

### 🍽️ Restaurant Recommendations

#### Get Personalized Recommendations

```http
GET /recommendations
```

**Response:**

```json
{
  "message": "Endpoint for personalized restaurant recommendations"
}
```

#### Upload Social Proof

```http
POST /recommendations/social-upload
```

**Response:**

```json
{
  "message": "Endpoint for social proof recommendations"
}
```

#### Analyze Menu

```http
POST /recommendations/menu-analysis
```

**Response:**

```json
{
  "message": "Endpoint for AI menu analysis"
}
```

### 💳 Transaction Management

#### Upload Receipt/Voucher

```http
POST /transactions/upload
```

**Response:**

```json
{
  "message": "Endpoint for AI voucher/receipt recognition"
}
```

#### Update Transaction

```http
PUT /transactions/:id
```

**Response:**

```json
{
  "message": "Endpoint to update transaction with id {id}"
}
```

### 📊 Spending Insights

#### Get Spending Summary

```http
GET /insights/summary
```

**Response:**

```json
{
  "message": "Endpoint for spending insights and summaries"
}
```

## 🧪 Testing Endpoints

You can test all endpoints using curl, Postman, or any HTTP client. Here are some example commands:

### Test Authentication

```bash
# Register user
curl -X POST http://localhost:5001/auth/register

# Login user
curl -X POST http://localhost:5001/auth/login
```

### Test Profile Management

```bash
# Create profile
curl -X POST http://localhost:5001/profile

# Get profile
curl http://localhost:5001/profile
```

### Test Recommendations

```bash
# Get recommendations
curl http://localhost:5001/recommendations

# Upload social proof
curl -X POST http://localhost:5001/recommendations/social-upload

# Analyze menu
curl -X POST http://localhost:5001/recommendations/menu-analysis
```

### Test Transactions

```bash
# Upload receipt
curl -X POST http://localhost:5001/transactions/upload

# Update transaction
curl -X PUT http://localhost:5001/transactions/123
```

### Test Insights

```bash
# Get spending summary
curl http://localhost:5001/insights/summary
```

## 🔧 Development

### Available Scripts

```bash
npm start          # Start the server
npm install        # Install dependencies
```

### Environment Variables

| Variable         | Description                    | Default  |
| ---------------- | ------------------------------ | -------- |
| `PORT`           | Server port                    | `5001`   |
| `DATABASE_URL`   | PostgreSQL connection string   | Required |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Required |
| `JWT_SECRET`     | Secret key for JWT tokens      | Required |

## 🏗️ Architecture

The backend follows a modular architecture:

- **Routes Layer** - Handles HTTP requests and responses
- **Middleware Layer** - CORS, JSON parsing, authentication
- **Server Layer** - Express app configuration and startup

## 🔄 Social Media Image Analysis Flow

The zhongcao feature provides AI-powered analysis of restaurant images from social media:

```mermaid
sequenceDiagram
    participant Frontend as 🖥️ Frontend
    participant Backend as Backend
    participant OpenAI as 🤖 OpenAI API

    Note over Frontend, OpenAI: Social Media Image Analysis Flow

    %% User uploads image
    Frontend->>Frontend: 📸 User selects image file
    Frontend->>Frontend: ✅ Validate file type (image/*)

    %% Frontend sends to backend
    Frontend->>Backend: POST /api/recommendations/social-upload
    Note right of Frontend: FormData with image file

    %% Backend processes image
    Backend->>Backend: 📤 Save image to /uploads/
    Backend->>Backend: 🔧 Convert image to base64
    Backend->>Backend: 📝 Create prompt with image

    %% Backend calls OpenAI
    Backend->>OpenAI: 🧠 Analyze image with structured output
    Note right of Backend: GPT-4o-mini with Zod schema:<br/>- restaurant_name<br/>- dish_name (nullable)<br/>- address (nullable)<br/>- description<br/>- social_media_handle (nullable)

    %% OpenAI returns results
    OpenAI-->>Backend: 📊 Structured restaurant data
    Backend->>Backend: 🗑️ Clean up uploaded file
    Backend-->>Frontend: JSON response with analysis

    %% Frontend displays results
    Frontend->>Frontend: 🎨 Update UI with results
    Note right of Frontend: Display:<br/>- Restaurant name<br/>- Address (if available)<br/>- Dish info (if available)<br/>- Description<br/>- Social media handle (if available)

    Frontend-->>Frontend: 📱 Show analysis results to user

    Note over Frontend, OpenAI: Error Handling Flow

    alt Error during processing
        Backend->>Backend: 🗑️ Cleanup file on error
        Backend-->>Frontend: ❌ Error response (500)
        Frontend-->>Frontend: ⚠️ Show error message to user
    end
```

### Key Features:

- **📸 Image Upload**: Support for PNG, JPG, and other image formats
- **🤖 AI Analysis**: GPT-4o-mini with structured output using Zod schema
- **📊 Structured Data**: Extracts restaurant name, address, dish info, description, and social media handles
- **🗑️ Auto Cleanup**: Automatic file cleanup after processing
- **🛡️ Error Handling**: Comprehensive error handling with user feedback

## 🔒 Security

- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- JWT authentication (to be implemented)
- bcrypt password hashing (to be implemented)

## 🚧 Current Status

This is a **skeleton implementation** with placeholder endpoints. The following features are ready for development:

- ✅ Project structure and routing
- ✅ Express server configuration
- ✅ CORS and middleware setup
- ✅ Environment variable configuration
- 🔄 Database integration (PostgreSQL)
- 🔄 JWT authentication implementation
- 🔄 AI features integration
- 🔄 File upload handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**NextAI Finance App** - Making financial management intelligent and personalized. 🚀
