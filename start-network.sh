#!/bin/bash

# Use specific network IP address
NETWORK_IP="192.168.50.174"

echo "🌐 Using network IP: $NETWORK_IP"
echo "🚀 Starting development servers for network access..."
echo "📱 Frontend will be available at: http://$NETWORK_IP:3000"
echo "🔧 Backend will be available at: http://$NETWORK_IP:5001"
echo ""

# Set environment variable for Vite to use network IP for backend
export VITE_BACKEND_URL="http://$NETWORK_IP:5001"

# Start both servers
npm run dev 