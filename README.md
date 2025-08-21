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

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Restaurant Recommendations

- `GET /restaurants/recommendations` - Get location-based recommendations
- `POST /restaurants/social-upload` - Analyze social media content
- `POST /restaurants/menu-analysis` - Analyze menu images
- `GET /restaurants/zhongcao` - Get saved recommendations

### Transactions

- `POST /transactions/upload` - Upload receipt image
- `POST /transactions/bulk-upload` - Upload multiple receipts
- `GET /transactions/vouchers` - Get user vouchers
- `GET /transactions/list` - Get transaction list
- `PUT /transactions/vouchers/:id` - Update voucher
- `DELETE /transactions/vouchers/:id` - Delete voucher

### Health Check

- `GET /health` - Server health status

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
