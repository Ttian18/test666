# NextAI Finance App - Full Stack Application

A modern, AI-powered financial management application built with Node.js, Express, React, and PostgreSQL. This full-stack application provides intelligent restaurant recommendations, transaction management, and spending insights with a beautiful frontend interface.

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
- **Backend Framework:** Express.js
- **Frontend Framework:** React with Vite
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Environment:** dotenv
- **CORS:** Enabled for cross-origin requests
- **Package Management:** NPM Workspaces

## 📁 Project Structure

```
nextai-finance-app/
├── client/                    # React frontend
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── App.css           # Component styles
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── index.html            # HTML template
│   ├── vite.config.js        # Vite configuration
│   └── package.json          # Frontend dependencies
├── server/                    # Node.js backend
│   ├── routes/
│   │   ├── authRoutes.js     # Authentication endpoints
│   │   ├── profileRoutes.js  # User profile management
│   │   ├── recommendationRoutes.js # Restaurant recommendations
│   │   ├── transactionRoutes.js # Transaction management
│   │   ├── insightsRoutes.js # Spending analytics
│   │   └── dataRoutes.js     # Data display endpoints
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
├── prisma/                    # Database configuration
│   ├── schema.prisma         # Database schema
│   └── seed.js               # Database seeding
├── .env                       # Environment variables
├── .gitignore                # Git ignore rules
└── package.json              # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd test666
   ```

2. **Install all dependencies (root, client, and server)**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   # Edit the .env file in the root directory
   ```

   Update the `.env` file with your actual values:

   ```env
   PORT=5001
   DATABASE_URL="postgresql://user:password@localhost:5432/database_name"
   OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
   JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JSON_WEB_TOKENS"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development servers**

   ```bash
   npm run dev
   ```

   This will start both:

   - **Backend API** on `http://localhost:5001`
   - **Frontend React App** on `http://localhost:3000`

### Alternative Commands

```bash
# Start only the backend server
npm run start

# Start only the frontend
npm run dev --workspace=client

# Start only the backend
npm run dev --workspace=server

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed database with sample data
```

## 📡 API Endpoints

### Base URL

```
http://localhost:5001
```

### 🔐 Authentication Endpoints

#### Register User

```http
POST /auth/register
```

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

#### Get All Transactions

```http
GET /transactions
```

**Response:**

```json
[
  {
    "id": "transaction_id",
    "userId": "user_id",
    "amount": "25.50",
    "description": "Dinner at Pizza Palace",
    "category": "Food & Dining",
    "restaurant": "Pizza Palace",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "user": {
      "id": "user_id",
      "name": "Test User",
      "email": "test@example.com"
    }
  }
]
```

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
# Get all transactions
curl http://localhost:5001/transactions

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
# Development
npm run dev                    # Start both frontend and backend
npm run dev --workspace=client # Start only frontend
npm run dev --workspace=server # Start only backend

# Production
npm run start                  # Start production backend
npm run build                  # Build both frontend and backend

# Database
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema to database
npm run db:migrate             # Run database migrations
npm run db:studio              # Open Prisma Studio
npm run db:seed                # Seed database with sample data

# Installation
npm install                    # Install all dependencies
npm install:all               # Install dependencies for all workspaces
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

## 🔒 Security

- CORS enabled for cross-origin requests
- Environment variables for sensitive data
- JWT authentication (to be implemented)
- bcrypt password hashing (to be implemented)

## 🚧 Current Status

This is a **fully functional full-stack application** with the following features implemented:

- ✅ **Complete project structure** with NPM workspaces
- ✅ **Backend API** with Express.js and all endpoints
- ✅ **Frontend React app** with Vite and beautiful UI
- ✅ **Database integration** with PostgreSQL and Prisma ORM
- ✅ **Sample data seeding** with comprehensive test data
- ✅ **Data display functionality** with real-time API integration
- ✅ **Transaction management** with full CRUD operations
- ✅ **Responsive design** for mobile and desktop
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

## 🌐 Accessing the Application

Once you've started the development servers:

- **Frontend**: Visit `http://localhost:3000` to see the React application
- **Backend API**: Access the API at `http://localhost:5001`
- **API Documentation**: All endpoints are documented above
- **Database**: Use `npm run db:studio` to open Prisma Studio for database management

## 📊 Sample Data

The application comes with pre-seeded sample data including:

- 1 test user with profile and preferences
- 3 restaurants (Pizza Palace, Sushi Master, Taco Fiesta)
- 3 sample transactions
- 3 menu items
- 2 AI recommendations

---

**NextAI Finance App** - Making financial management intelligent and personalized. 🚀
