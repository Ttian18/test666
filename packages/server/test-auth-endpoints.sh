#!/bin/bash

# Authentication Endpoints Testing Script
# This script tests all authentication endpoints with curl

BASE_URL="http://localhost:5001"
API_BASE="$BASE_URL/api"

echo "🧪 Testing Authentication Endpoints"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local headers="$4"
    local expected_status="$5"
    local description="$6"
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" $headers "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" $headers -H "Content-Type: application/json" -d "$data" "$endpoint")
    fi
    
    # Split response and status code
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ SUCCESS (Status: $status_code)${NC}"
    else
        echo -e "${RED}❌ FAILED (Expected: $expected_status, Got: $status_code)${NC}"
    fi
    
    echo "Response: $response_body"
    echo ""
    
    # Return the response for chaining tests
    echo "$response_body"
}

# Variables for storing tokens and user data
USER_TOKEN=""
USER_ID=""

echo "📝 1. TESTING USER REGISTRATION"
echo "==============================="

# Test user registration
REGISTER_DATA='{
  "email": "test@example.com",
  "password": "TestPassword123!",
  "firstName": "John",
  "lastName": "Doe"
}'

register_response=$(test_endpoint "POST" "$API_BASE/auth/register" "$REGISTER_DATA" "" "201" "User Registration")

# Extract token and user ID from registration response
if echo "$register_response" | grep -q "token"; then
    USER_TOKEN=$(echo "$register_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$register_response" | grep -o '"userId":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}📋 Extracted Token: ${USER_TOKEN:0:20}...${NC}"
    echo -e "${GREEN}📋 Extracted User ID: $USER_ID${NC}"
fi

echo ""
echo "🔐 2. TESTING USER LOGIN"
echo "========================"

# Test user login
LOGIN_DATA='{
  "email": "test@example.com",
  "password": "TestPassword123!"
}'

login_response=$(test_endpoint "POST" "$API_BASE/auth/login" "$LOGIN_DATA" "" "200" "User Login")

# Update token from login response
if echo "$login_response" | grep -q "token"; then
    USER_TOKEN=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}📋 Updated Token: ${USER_TOKEN:0:20}...${NC}"
fi

echo ""
echo "✅ 3. TESTING TOKEN VALIDATION"
echo "==============================="

# Test token validation
test_endpoint "GET" "$API_BASE/auth/validate" "" "-H \"x-auth-token: $USER_TOKEN\"" "200" "Token Validation"

echo ""
echo "👤 4. TESTING PROFILE ENDPOINTS"
echo "================================"

# Test profile creation
PROFILE_DATA='{
  "monthlyBudget": 2000,
  "monthlyIncome": 5000,
  "expensePreferences": ["restaurants", "entertainment"],
  "savingsGoals": ["vacation", "emergency_fund"],
  "lifestylePreferences": {
    "diningStyle": "casual",
    "cuisineTypes": ["italian", "asian"]
  }
}'

test_endpoint "POST" "$API_BASE/auth/profile" "$PROFILE_DATA" "-H \"x-auth-token: $USER_TOKEN\"" "201" "Profile Creation"

# Test profile retrieval
test_endpoint "GET" "$API_BASE/auth/profile" "" "-H \"x-auth-token: $USER_TOKEN\"" "200" "Profile Retrieval"

echo ""
echo "🛡️ 5. TESTING BLACKLIST MANAGEMENT"
echo "==================================="

# Test blacklist stats
test_endpoint "GET" "$API_BASE/auth/blacklist/stats" "" "-H \"x-auth-token: $USER_TOKEN\"" "200" "Blacklist Statistics"

# Test manual cleanup
test_endpoint "POST" "$API_BASE/auth/blacklist/cleanup" "" "-H \"x-auth-token: $USER_TOKEN\"" "200" "Manual Cleanup"

echo ""
echo "🚪 6. TESTING USER LOGOUT"
echo "========================="

# Test user logout
LOGOUT_DATA="{\"token\": \"$USER_TOKEN\"}"
test_endpoint "POST" "$API_BASE/auth/logout" "$LOGOUT_DATA" "-H \"x-auth-token: $USER_TOKEN\"" "200" "User Logout"

echo ""
echo "❌ 7. TESTING INVALID TOKEN SCENARIOS"
echo "====================================="

# Test with invalid token
test_endpoint "GET" "$API_BASE/auth/validate" "" "-H \"x-auth-token: invalid_token_123\"" "401" "Invalid Token Validation"

# Test without token
test_endpoint "GET" "$API_BASE/auth/validate" "" "" "401" "Missing Token Validation"

echo ""
echo "🔄 8. TESTING DUPLICATE REGISTRATION"
echo "===================================="

# Test duplicate registration (should fail)
test_endpoint "POST" "$API_BASE/auth/register" "$REGISTER_DATA" "" "409" "Duplicate Registration"

echo ""
echo "🔐 9. TESTING LOGIN WITH WRONG PASSWORD"
echo "======================================="

# Test login with wrong password
WRONG_LOGIN_DATA='{
  "email": "test@example.com",
  "password": "WrongPassword123!"
}'

test_endpoint "POST" "$API_BASE/auth/login" "$WRONG_LOGIN_DATA" "" "401" "Wrong Password Login"

echo ""
echo "📧 10. TESTING LOGIN WITH NON-EXISTENT USER"
echo "==========================================="

# Test login with non-existent user
NONEXISTENT_LOGIN_DATA='{
  "email": "nonexistent@example.com",
  "password": "SomePassword123!"
}'

test_endpoint "POST" "$API_BASE/auth/login" "$NONEXISTENT_LOGIN_DATA" "" "401" "Non-existent User Login"

echo ""
echo "🎉 AUTHENTICATION ENDPOINT TESTING COMPLETED!"
echo "=============================================="
echo ""
echo "Summary of tested endpoints:"
echo "✅ POST /api/auth/register - User registration"
echo "✅ POST /api/auth/login - User login"
echo "✅ GET /api/auth/validate - Token validation"
echo "✅ POST /api/auth/profile - Profile creation/update"
echo "✅ GET /api/auth/profile - Profile retrieval"
echo "✅ GET /api/auth/blacklist/stats - Blacklist statistics"
echo "✅ POST /api/auth/blacklist/cleanup - Manual cleanup"
echo "✅ POST /api/auth/logout - User logout"
echo "✅ Error scenarios (invalid tokens, duplicate registration, wrong passwords)"
echo ""
echo "🎯 All authentication flows have been tested!"
