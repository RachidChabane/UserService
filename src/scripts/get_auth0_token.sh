#!/bin/bash

# Auth0 credentials
AUTH0_DOMAIN="just-ticket.eu.auth0.com"
CLIENT_ID="zllDbMrUbIwc06JLsxr8ETvZjxX7UxxE"
CLIENT_SECRET="pGY6qfB_EDrhxZs3Xjp6MvCE6lsfbrX4UWwYaopE4jckOsMV0k4OMHsr95Wr6gLL"    # Update with your client secret
AUDIENCE="https://justicket"

# Get token from Auth0
response=$(curl -s --request POST \
  --url "https://${AUTH0_DOMAIN}/oauth/token" \
  --header 'content-type: application/json' \
  --data "{
    \"client_id\":\"${CLIENT_ID}\",
    \"client_secret\":\"${CLIENT_SECRET}\",
    \"audience\":\"${AUDIENCE}\",
    \"grant_type\":\"client_credentials\"
}")

# Display the full response for debugging
echo "Full response:"
echo "$response"

# Export the token for use in other commands
export TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//g')
export BASE_URL="http://localhost:3000"

echo ""
echo "TOKEN and BASE_URL variables are now set in your environment"
echo "Try this command to test:"
echo "curl -X GET \"\$BASE_URL/health\""
echo ""
echo "And this to test an authenticated endpoint:"
echo "curl -X GET \"\$BASE_URL/api/users/me\" -H \"Authorization: Bearer \$TOKEN\""