#!/bin/bash

echo "🚀 Testing Frontend Deployment"
echo "==============================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_service() {
    local service_name=$1
    local url=$2
    local expected_pattern=$3
    
    echo -n "Testing $service_name... "
    
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" "$url")
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        if [[ "$body" =~ $expected_pattern ]]; then
            echo -e "${GREEN}✅ PASS${NC}"
            return 0
        else
            echo -e "${RED}❌ FAIL (Wrong content)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL (HTTP $http_status)${NC}"
        return 1
    fi
}

# Main tests
echo "1. Testing Backend Health Check"
test_service "Backend" "https://20241202.xyz/api/health" "OK"
backend_status=$?

echo "2. Testing Frontend Access"
test_service "Frontend" "https://20241202.xyz" "BudgetMate"
frontend_status=$?

echo "3. Testing Frontend Static Assets"
# Get actual CSS filename from the HTML
CSS_FILE=$(curl -s "https://20241202.xyz" | grep -o 'assets/[^"]*\.css' | head -1)
if [ -n "$CSS_FILE" ]; then
    test_service "Frontend CSS" "https://20241202.xyz/$CSS_FILE" ".*"
    css_status=$?
else
    echo -n "Testing Frontend CSS... "
    echo -e "${RED}❌ FAIL (CSS file not found in HTML)${NC}"
    css_status=1
fi

echo "4. Testing Backend API Endpoint"
test_service "Categories API" "https://20241202.xyz/api/transactions/categories" "categories"
api_status=$?

# Container status check
echo "5. Checking Container Status"
echo -n "Checking containers... "
running_containers=$(docker-compose -f docker/docker-compose.yml ps --services --filter "status=running" | wc -l)
if [ "$running_containers" -eq 2 ]; then
    echo -e "${GREEN}✅ PASS (Both containers running)${NC}"
    container_status=0
else
    echo -e "${RED}❌ FAIL (Expected 2 containers, found $running_containers)${NC}"
    container_status=1
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="

total_tests=5
passed_tests=$((5 - backend_status - frontend_status - css_status - api_status - container_status))

echo "Backend Health: $([ $backend_status -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "Frontend Access: $([ $frontend_status -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "Static Assets: $([ $css_status -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "API Endpoints: $([ $api_status -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"
echo "Container Status: $([ $container_status -eq 0 ] && echo -e "${GREEN}PASS${NC}" || echo -e "${RED}FAIL${NC}")"

echo ""
echo "Results: $passed_tests/$total_tests tests passed"

if [ $passed_tests -eq $total_tests ]; then
    echo -e "${GREEN}🎉 All tests passed! Frontend deployment successful!${NC}"
    echo ""
    echo "Access your application:"
    echo "🌐 Frontend: https://20241202.xyz"
    echo "⚡ Backend API: https://20241202.xyz/api"
    echo "📊 Health Check: https://20241202.xyz/api/health"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the deployment.${NC}"
    exit 1
fi
