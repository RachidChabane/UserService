# User Microservice

A microservice that handles user management with Auth0 integration for authentication and authorization.

## Features

- User profile management
- Role-based access control (user/admin roles)
- Auth0 integration for authentication
- Automatic user provisioning on first login
- MongoDB for data persistence

## Technical Choices

Our User Microservice leverages Auth0 for identity management while maintaining a dedicated user database in MongoDB for application-specific data and authorization. This separation of concerns follows industry best practices - Auth0 excels at secure authentication (including password management, MFA, and social logins), while our service focuses on authorization, user preferences, and business logic. By using JWT validation with Express middleware, we create a stateless authentication system that scales horizontally without shared session storage.

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Auth0 for authentication
- JWT token validation

## Authentication Flow

This service uses Auth0 for authentication with the following flow:

1. **User Registration/Login**:

   - Users register and login through Auth0
   - Auth0 issues JWT tokens to authenticated users

2. **API Access**:

   - Frontend app includes the JWT token in requests
   - The microservice validates the token with Auth0
   - On first access, users are automatically created in the database

3. **Token Refresh**:
   - Frontend applications handle token refresh with Auth0

### Use Cases and Utilization Flow

[![](https://mermaid.ink/img/pako:eNrdVk1v2zgQ_SsEgQI2oE1kObZjHbrI2skii6YI6mQLFL4w0kgmKpFaiorjBvnvO6RkxR-S1Usv9UGwyDePHL43I77SQIZAfZrDfwWIAOacxYqlS0HwlzGlecAzJjR5zEEdj94oKTSI8HjmqtArt5lmAeqZB3A8eSdFLOd_LUU59eED-QIxz7VimktBbhK5LmcUBJqo-Knnua5DvKF5jEb9cvKz1EDkMyi7mLNl9dvIDOqPjx-3qfhklvDgO1nwWJDHrMRsJxFnEzNkIbfb0LLMdRtA7llc5WbHMcSs4JM5z7OEbXDzO9uIpEr3tlHRL4qnlOt9LBeRJD1IGU8cPLc8X0sV9veXqsJnChieQoGchAWBLITex71nWyfyxDDrNdcrTOk7iKPE30MWWirYRVkH1KJ9kjFvVssbWaHw4XWqdcjSIpOF_bxIJWuXRIlFdWgTKAhBaM6SvFGDf1nCQ6NCK_BXinB1f0uuggDyvFEJK8LQPAZulxIHVKR3w1WuyQNPod-iTQXPFHIGGkISoR8LBUf57PQDn_x9_UDOWcbPjW_z8xSOTmIHfhj8XB33P2tNUh6GCazZdsH9sK0-oHi02WXfNUPN-2DmCc_LBTq3kW9EYAbuTm6hPlszTOAFizz_swRWU4e8n2VZzRHWcniScrf2UXDsESeJ7Q4CG9PIu2tSlFCUxKhsxJNmPd_r6F3_wCJ0k1OxnMqvj7ZOm7FkWycHdvVc--iyazvfkU3vQZkixxZpGuxpcxouZXjR-r-9LW-4CEuhnzZV57ydn7RRZQ5rZS5iG9y5q3slbZ-ozvWn7Kcgz6TI26z3mNme-3jbZLXy0L5AhCSrxr44rI3WfZ_YZ-t9XeFbOXb9kmE7z_sn2vccTGXgeRlk2NLt689YaTsB6xJIejkWHxqcIaDf_lGxB1ZHdX5M2pF7qs1wmIui6s4HQYinDk1B4TUlxIvlqxleUr2CFJbUx78hRKxI9JIuxRtCMQW5QHdSX6sCHFpYAat76P7gdchxn9SP8EuKg3hn_CZljcFX6r_SF-qPLr2z8cVk5A2mE288GnsO3VB_MjgbTgYjz51Ox-50OBm9OfSHjXfPLicXU_yNB-Px1L0cjB0Kdq278nZsL8kOVbKIV_XysTIJlmsrTBvUzNyzqH_x9j_EDsNl?type=png)](https://mermaid.live/edit#pako:eNrdVk1v2zgQ_SsEgQI2oE1kObZjHbrI2skii6YI6mQLFL4w0kgmKpFaiorjBvnvO6RkxR-S1Usv9UGwyDePHL43I77SQIZAfZrDfwWIAOacxYqlS0HwlzGlecAzJjR5zEEdj94oKTSI8HjmqtArt5lmAeqZB3A8eSdFLOd_LUU59eED-QIxz7VimktBbhK5LmcUBJqo-Knnua5DvKF5jEb9cvKz1EDkMyi7mLNl9dvIDOqPjx-3qfhklvDgO1nwWJDHrMRsJxFnEzNkIbfb0LLMdRtA7llc5WbHMcSs4JM5z7OEbXDzO9uIpEr3tlHRL4qnlOt9LBeRJD1IGU8cPLc8X0sV9veXqsJnChieQoGchAWBLITex71nWyfyxDDrNdcrTOk7iKPE30MWWirYRVkH1KJ9kjFvVssbWaHw4XWqdcjSIpOF_bxIJWuXRIlFdWgTKAhBaM6SvFGDf1nCQ6NCK_BXinB1f0uuggDyvFEJK8LQPAZulxIHVKR3w1WuyQNPod-iTQXPFHIGGkISoR8LBUf57PQDn_x9_UDOWcbPjW_z8xSOTmIHfhj8XB33P2tNUh6GCazZdsH9sK0-oHi02WXfNUPN-2DmCc_LBTq3kW9EYAbuTm6hPlszTOAFizz_swRWU4e8n2VZzRHWcniScrf2UXDsESeJ7Q4CG9PIu2tSlFCUxKhsxJNmPd_r6F3_wCJ0k1OxnMqvj7ZOm7FkWycHdvVc--iyazvfkU3vQZkixxZpGuxpcxouZXjR-r-9LW-4CEuhnzZV57ydn7RRZQ5rZS5iG9y5q3slbZ-ozvWn7Kcgz6TI26z3mNme-3jbZLXy0L5AhCSrxr44rI3WfZ_YZ-t9XeFbOXb9kmE7z_sn2vccTGXgeRlk2NLt689YaTsB6xJIejkWHxqcIaDf_lGxB1ZHdX5M2pF7qs1wmIui6s4HQYinDk1B4TUlxIvlqxleUr2CFJbUx78hRKxI9JIuxRtCMQW5QHdSX6sCHFpYAat76P7gdchxn9SP8EuKg3hn_CZljcFX6r_SF-qPLr2z8cVk5A2mE288GnsO3VB_MjgbTgYjz51Ox-50OBm9OfSHjXfPLicXU_yNB-Px1L0cjB0Kdq278nZsL8kOVbKIV_XysTIJlmsrTBvUzNyzqH_x9j_EDsNl)

## Data Model

### User Data in MongoDB

MongoDB stores the following user-related data in the User collection:

1. **User Identity**:

   - `auth0Id`: The unique identifier from Auth0 (e.g., "auth0|123456")
   - `email`: User's email address
   - `displayName`: User's display name (optional)

2. **Authorization Information**:

   - `role`: User role (either "user" or "admin")

3. **Metadata**:
   - `createdAt`: When the user record was first created
   - `updatedAt`: When the user record was last updated
   - `_id`: MongoDB's internal document ID (exposed as `id` in API responses)

Example document:

```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "auth0Id": "auth0|123456789",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "user",
  "createdAt": "2025-03-26T10:00:00.000Z",
  "updatedAt": "2025-03-26T10:30:00.000Z"
}
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or remote)
- Auth0 account with API and Application set up

## Environment Setup

Create a `.env` file in the root directory with the following configuration:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/concert_tickets
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://api.concert-tickets.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
LOG_LEVEL=info
```

## Installation

```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Seed the database with initial data
npm run seed

# Build the application
npm run build
```

## Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Public Endpoints

- `GET /health` - Health check endpoint

### Protected Endpoints (require authentication)

- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/me` - Update current user's profile

### Admin Endpoints (require admin role)

- `GET /api/users` - List all users (with pagination)
- `GET /api/users/:id` - Get a specific user by ID

## Testing the API

### Obtaining a Token

```bash
curl --request POST \
  --url 'https://just-ticket.eu.auth0.com/oauth/token' \
  --header 'content-type: application/json' \
  --data '{
    "client_id": "your-client-id",
    "client_secret": "your-client-secret",
    "audience": "https://api.concert-tickets.com",
    "grant_type": "client_credentials"
  }'
```

### Using the Token

```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Get current user (auth required)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users/me

# Update user profile
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"New Name"}' \
  http://localhost:3000/api/users/me
```

## Testing Script

```bash
chmod +x src/scripts/auth-db-test.sh

./src/scripts/auth-db-test.sh
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Check TypeScript compilation
npm run build
```

## Database Management

```bash
# Setup the database (create indexes)
npm run db:setup

# Seed the database with initial users
npm run seed

# Reset the database (setup + seed)
npm run db:reset
```
