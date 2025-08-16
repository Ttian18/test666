#!/bin/bash

echo "🔍 Network Connectivity Test"
echo "=========================="

# Get network IP
NETWORK_IP="192.168.50.174"

echo "🌐 Testing connectivity to $NETWORK_IP..."

# Test if the IP is reachable
echo "📡 Testing basic connectivity..."
if ping -c 1 $NETWORK_IP > /dev/null 2>&1; then
    echo "✅ Basic connectivity: OK"
else
    echo "❌ Basic connectivity: FAILED"
fi

# Test frontend port
echo "🌐 Testing frontend (port 3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://$NETWORK_IP:3000 | grep -q "200"; then
    echo "✅ Frontend (3000): OK"
else
    echo "❌ Frontend (3000): FAILED"
fi

# Test backend port
echo "🔧 Testing backend (port 5001)..."
if curl -s -o /dev/null -w "%{http_code}" http://$NETWORK_IP:5001 | grep -q "404\|200"; then
    echo "✅ Backend (5001): OK"
else
    echo "❌ Backend (5001): FAILED"
fi

echo ""
echo "📋 Troubleshooting steps:"
echo "1. Make sure both servers are running: npm run dev"
echo "2. Try accessing from another device: http://$NETWORK_IP:3000"
echo "3. Check if your device is on the same network"
echo "4. Try disabling any VPN or proxy"
echo "5. Check if your router blocks local network traffic" 