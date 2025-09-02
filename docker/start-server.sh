#!/bin/bash

echo "🚀 Starting NextAI Finance App Server with Docker..."

# Change to docker directory
cd "$(dirname "$0")"

# Check if .env exists in parent directory
if [ ! -f ../.env ]; then
    echo "❌ .env file not found in project root!"
    echo "Please make sure you have a .env file with your configuration in the parent directory."
    exit 1
fi

# Verify required variables exist in .env
if ! grep -q "DATABASE_URL" ../.env; then
    echo "❌ DATABASE_URL not found in .env file!"
    exit 1
fi

if ! grep -q "OPENAI_API_KEY" ../.env; then
    echo "❌ OPENAI_API_KEY not found in .env file!"
    exit 1
fi

echo "✅ .env file found and verified"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop first, then run this script again."
    echo ""
    echo "To start Docker Desktop:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for it to fully start (Docker icon in menu bar should be stable)"
    echo "  3. Run this script again"
    exit 1
fi

echo "✅ Docker is running"

# Start the server container
echo "🐳 Building and starting NextAI server container..."
docker-compose up --build

echo "✅ Server started!"
echo "🔧 Backend API: http://localhost:5001"
echo "📊 Health check: http://localhost:5001/health"
echo ""
echo "📝 Useful commands:"
echo "  docker-compose logs -f     # View live logs"
echo "  docker-compose down        # Stop server"
echo "  docker-compose ps          # Check status"
