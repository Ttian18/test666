#!/bin/bash

echo "🧪 Testing NextAI Server Docker Deployment..."

# Change to docker directory
cd "$(dirname "$0")"

# Function to wait for Docker
wait_for_docker() {
    echo "⏳ Waiting for Docker to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker info > /dev/null 2>&1; then
            echo "✅ Docker is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - Docker not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ Docker failed to start after $max_attempts attempts"
    echo "Please start Docker Desktop manually and try again"
    return 1
}

# Function to test server health
test_server_health() {
    echo "🏥 Testing server health..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:5001/health > /dev/null 2>&1; then
            echo "✅ Server is healthy!"
            echo "📊 Health check response:"
            curl -s http://localhost:5001/health | jq . 2>/dev/null || curl -s http://localhost:5001/health
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - Server not ready yet..."
        sleep 3
        attempt=$((attempt + 1))
    done
    
    echo "❌ Server failed to respond after $max_attempts attempts"
    return 1
}

# Main deployment test
main() {
    # Wait for Docker
    if ! wait_for_docker; then
        exit 1
    fi
    
    # Check .env file
    if [ ! -f ../.env ]; then
        echo "❌ .env file not found!"
        exit 1
    fi
    
    echo "✅ .env file found"
    
    # Start the container
    echo "🚀 Starting NextAI server container..."
    docker-compose up --build -d
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start container"
        exit 1
    fi
    
    echo "✅ Container started successfully"
    
    # Test server health
    if ! test_server_health; then
        echo "❌ Server health check failed"
        echo "📋 Container logs:"
        docker-compose logs --tail=20
        exit 1
    fi
    
    # Show final status
    echo ""
    echo "🎉 Deployment Test Successful!"
    echo ""
    echo "📋 Container Status:"
    docker-compose ps
    echo ""
    echo "🌐 Your server is running at:"
    echo "   Backend API: http://localhost:5001"
    echo "   Health Check: http://localhost:5001/health"
    echo ""
    echo "📝 Useful commands:"
    echo "   docker-compose logs -f     # View live logs"
    echo "   docker-compose down        # Stop server"
    echo "   docker-compose ps          # Check status"
    echo ""
    echo "🧪 Quick API test:"
    echo "   curl http://localhost:5001/health"
}

# Run main function
main
