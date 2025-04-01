#!/bin/bash
# Quick Setup and Test Script for User Microservice

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlpDYUs1UGRlOHk5eVBubi1JRmdiWSJ9.eyJpc3MiOiJodHRwczovL2p1c3QtdGlja2V0LmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJqUE9SWFpCSGJxWjJJOUhPWkN3dXBXRmRqTEpkRlAxc0BjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9hcGkuY29uY2VydC10aWNrZXRzLmNvbSIsImlhdCI6MTc0Mjk5MTE0NiwiZXhwIjoxNzQzMDc3NTQ2LCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMiLCJhenAiOiJqUE9SWFpCSGJxWjJJOUhPWkN3dXBXRmRqTEpkRlAxcyJ9.E2003lC-g9D404JcsNPFfibviJrw5Gslrgehk9X3GXBNVEmQdteVlUhtZmsHtgKgANbR8lG8tS-BWkK3Axup9I2iDc_ssIBSvuJFTmTIBki-d8OJ0cBnm3igCTeTPal5dnioCLLAehB1tjTKEwtJT08a5MNTrowIWrUpqANoWLBF9hdU8mfHJjOuUlMToZkqcJBoaB6rAJwrIwx1Hn4mVFbWooxjiZn0T9QVt-21VTNelTfn8Mw2lUmj7cRFYBvkdK60egPEgwjuAVwsftsia-eszCMelc5teFpYKduIt2cQKhFkx3HQLn37GgZH9vvnvJH2g9dtAJ2tj1w3wiIs5A"

echo -e "${BLUE}======= USER MICROSERVICE QUICK TEST =======${NC}"

# 1. Check if MongoDB is running
echo -e "\n${YELLOW}Checking if MongoDB is running...${NC}"
if pgrep -x mongod >/dev/null; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${RED}✗ MongoDB is not running${NC}"
    echo -e "Starting MongoDB..."
    
    # Try to start MongoDB (adjust command as needed for your system)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew services start mongodb-community || echo -e "${RED}Failed to start MongoDB. Please start it manually.${NC}"
    else
        # Linux
        sudo systemctl start mongod || echo -e "${RED}Failed to start MongoDB. Please start it manually.${NC}"
    fi
fi

# 2. Check if application is running
echo -e "\n${YELLOW}Checking if application is running...${NC}"
if curl -s http://localhost:3001/health >/dev/null; then
    echo -e "${GREEN}✓ Application is running${NC}"
else
    echo -e "${RED}✗ Application is not running${NC}"
    echo -e "Starting application in a new terminal..."
    
    # Try to start the application in a new terminal window
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e 'tell app "Terminal" to do script "cd $(pwd) && npm run dev"'
    else
        # Linux
        gnome-terminal -- bash -c "cd $(pwd) && npm run dev; exec bash" || xterm -e "cd $(pwd) && npm run dev" || echo -e "${RED}Failed to start application. Please start it manually.${NC}"
    fi
    
    # Wait for application to start
    echo "Waiting for application to start..."
    for i in {1..10}; do
        if curl -s http://localhost:3001/health >/dev/null; then
            echo -e "${GREEN}✓ Application started successfully${NC}"
            break
        fi
        
        if [ $i -eq 10 ]; then
            echo -e "${RED}✗ Application failed to start within the timeout period${NC}"
            echo "Please start the application manually with: npm run dev"
            exit 1
        fi
        
        sleep 2
    done
fi

# 3. Run database setup and seed if needed
echo -e "\n${YELLOW}Do you want to setup/reset the database? (y/n)${NC}"
read -r setup_db

if [[ $setup_db == "y" || $setup_db == "Y" ]]; then
    echo "Setting up database..."
    npm run db:setup
    
    echo "Seeding database..."
    npm run seed
fi

# 4. Test health endpoint
echo -e "\n${YELLOW}Testing health endpoint...${NC}"
health_response=$(curl -s http://localhost:3001/health)
echo "Response: $health_response"

if [[ "$health_response" == *"\"status\":\"ok\""* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

# 5. Test authentication with token
echo -e "\n${YELLOW}Testing authentication with token...${NC}"
user_response=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/users/me)
echo "Response: $user_response"

if [[ "$user_response" == *"\"status\":\"success\""* ]]; then
    echo -e "${GREEN}✓ Authentication successful${NC}"
    
    # Extract user ID
    user_id=$(echo $user_response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "User ID: $user_id"
    
    # Test update user
    echo -e "\n${YELLOW}Testing update user...${NC}"
    update_name="Test User $(date +%s)"
    update_response=$(curl -s -X PUT \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"displayName\":\"$update_name\"}" \
      http://localhost:3001/api/users/me)
    echo "Response: $update_response"
    
    if [[ "$update_response" == *"\"status\":\"success\""* ]]; then
        echo -e "${GREEN}✓ Update user successful${NC}"
    else
        echo -e "${RED}✗ Update user failed${NC}"
    fi
else
    echo -e "${RED}✗ Authentication failed${NC}"
    
    # Additional debugging info
    if [[ "$user_response" == *"\"status\":\"error\""* ]]; then
        error_msg=$(echo $user_response | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}Error: $error_msg${NC}"
        
        # Check for audience mismatch
        if [[ "$user_response" == *"audience invalid"* ]]; then
            echo -e "${YELLOW}There seems to be an audience mismatch.${NC}"
            echo "1. Check your Auth0 API audience: https://api.concert-tickets.com"
            echo "2. Check your application's AUTH0_AUDIENCE environment variable"
            echo "3. Make sure they match exactly"
        fi
    fi
fi

echo -e "\n${BLUE}======= TESTING COMPLETE =======${NC}"
echo -e "For more comprehensive testing, use the api-test-script.sh"