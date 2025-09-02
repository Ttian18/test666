#!/bin/bash

# NextAI Finance App - Environment Setup Script
# This script copies example environment files to their proper locations

echo "🚀 Setting up environment files for NextAI Finance App..."

# Check if example files exist
if [ ! -f "env.example.root" ]; then
    echo "❌ Error: env.example.root not found!"
    exit 1
fi

if [ ! -f "packages/server/env.example.server" ]; then
    echo "❌ Error: packages/server/env.example.server not found!"
    exit 1
fi

if [ ! -f "packages/client/env.example.client" ]; then
    echo "❌ Error: packages/client/env.example.client not found!"
    exit 1
fi

# Copy example files
echo "📁 Copying root .env file..."
cp env.example.root .env

echo "📁 Copying server .env file..."
cp packages/server/env.example.server packages/server/.env

echo "📁 Copying client .env file..."
cp packages/client/env.example.client packages/client/.env

echo ""
echo "✅ Environment files created successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Edit .env with your database URL and API keys"
echo "2. Edit packages/server/.env with the same values"
echo "3. Edit packages/client/.env with your frontend API URL"
echo ""
echo "📚 Required API keys:"
echo "- OpenAI API key: https://platform.openai.com/api-keys"
echo "- Google Places API key: https://developers.google.com/maps/documentation/places/web-service/get-api-key"
echo "- Neon database URL: https://neon.tech/"
echo ""
echo "🚀 After setting up your API keys, run: npm run dev"
