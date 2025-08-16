#!/bin/bash

# Get the local network IP address
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🌐 Network IP detected: $NETWORK_IP"
echo "🚀 Starting development servers for network access..."
echo "📱 Frontend will be available at: http://$NETWORK_IP:3000"
echo "🔧 Backend will be available at: http://$NETWORK_IP:5001"
echo ""

# Set environment variable for Vite to use network IP for backend
export VITE_BACKEND_URL="http://$NETWORK_IP:5001"

# Start both servers
npm run dev 