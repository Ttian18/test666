# Environment Variables Setup

## 📁 **Why You Need Three .env Files**

Your project requires **three separate .env files** because each serves a different purpose:

### **1. Root `.env`** (Docker Compose Configuration)
- **Purpose**: Used by Docker Compose for container orchestration
- **Location**: `/Users/mutianzhang/Developer/test666/.env`
- **Contains**: Database URLs, API keys, Docker-specific variables

### **2. Server `.env`** (Backend Runtime Configuration)
- **Purpose**: Server-specific runtime configuration
- **Location**: `/Users/mutianzhang/Developer/test666/packages/server/.env`
- **Contains**: Server host/port, CORS settings, API keys, database connection

### **3. Client `.env`** (Frontend Build Configuration)
- **Purpose**: Vite build-time environment variables
- **Location**: `/Users/mutianzhang/Developer/test666/packages/client/.env`
- **Contains**: `VITE_*` prefixed variables for frontend build

## 🔧 **Current Configuration**

### **Root `.env`** (Docker Compose)
```env
# Database Configuration (Production - Neon)
DATABASE_URL="postgresql://neondb_owner:npg_zYJbHK4WaC5U@ep-wild-math-aepbbvt3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# JWT Configuration
JWT_SECRET="nextai-demo-jwt-secret-key-2024"

# API Keys
OPENAI_API_KEY=sk-proj-***
GOOGLE_PLACES_API_KEY=AIzaSyD***

# Server Configuration
NODE_ENV="production"
PORT=5001

# For Docker Compose - PostgreSQL (if using local DB)
POSTGRES_DB="nextai_finance"
POSTGRES_USER="nextai_user"
POSTGRES_PASSWORD="nextai_password"
```

### **Server `.env`** (Backend)
```env
# Server Configuration
PORT=5001
HOST=0.0.0.0
CORS_ORIGIN=*
NODE_ENV=development

# JWT Configuration
JWT_SECRET="nextai-demo-jwt-secret-key-2024"

# API Keys
OPENAI_API_KEY=sk-proj-***
GOOGLE_PLACES_API_KEY=AIzaSyD***

# Database Configuration
DATABASE_URL="postgresql://neondb_owner:npg_zYJbHK4WaC5U@ep-wild-math-aepbbvt3-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### **Client `.env`** (Frontend)
```env
# Backend API URL
VITE_API_URL=http://76.94.218.158:5001

# Environment
NODE_ENV=development
```

## 🚀 **Deployment Considerations**

### **For Production:**
- Update `VITE_API_URL` to your production server URL
- Set `NODE_ENV=production` in appropriate files
- Ensure all sensitive keys are properly secured

### **For Development:**
- Use `localhost` URLs for local development
- Set `NODE_ENV=development` for better debugging

## 🔒 **Security Notes**

- **Never commit .env files** to version control (already in .gitignore)
- **API keys are currently visible** - consider using environment variable injection for production
- **Database credentials** should be rotated regularly

## ✅ **Changes Made**

1. **Fixed duplicate DATABASE_URL** in root .env
2. **Updated client API URL** to use correct server IP (76.94.218.158:5001)
3. **Added JWT_SECRET** to server .env for consistency
4. **Organized and commented** all configurations
5. **Removed conflicting entries** between files

## 🔄 **When to Update**

- **Server IP changes**: Update `VITE_API_URL` in client .env
- **Database migration**: Update `DATABASE_URL` in root and server .env
- **API key rotation**: Update keys in root and server .env
- **Environment changes**: Update `NODE_ENV` appropriately
