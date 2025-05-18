# Template Database & API Service

This service provides:

1. PostgreSQL database integration
2. RESTful API for user data and connections
3. Authentication middleware using Clerk
4. Matching algorithms for connection recommendations

## Setup

### Prerequisites

- Node.js (>= 18.x)
- PostgreSQL (>= 14.x)
- Clerk account with API keys

### Installation

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your PostgreSQL connection details and Clerk API keys.

4. Create the database:

   ```bash
   createdb template
   ```

5. Initialize the database (tables will be created automatically on first run).

### Development

Start the development server:

```bash
yarn dev
```

The API will be available at <http://localhost:3030>, and API documentation at <http://localhost:3030/api-docs>.

## Database Schema

### Users

Stores user profile information, synced with Clerk authentication:

- Basic profile: name, email, profile image
- Professional details: job title, company, industry
- Skills and interests
- Location and contact information

### Connections

Manages relationships between users:

- Connection requests with status (pending, accepted, rejected, blocked)
- Match scores calculated using similarity algorithms
- Notes and metadata for each connection

## API Endpoints

### User Endpoints

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/search` - Search users by criteria
- `GET /api/users/recommendations` - Get recommended connections

### Connection Endpoints

- `POST /api/connections` - Create connection request
- `GET /api/connections` - Get all user connections
- `GET /api/connections/pending` - Get pending connection requests
- `GET /api/connections/:id` - Get connection details
- `POST /api/connections/:id/accept` - Accept connection request
- `POST /api/connections/:id/reject` - Reject connection request

## Matching Algorithm

The API includes a recommendation engine that uses several factors to calculate match scores:

1. Skills similarity (40% weight)
2. Interest overlap (30% weight)
3. Industry match (20% weight)
4. Location proximity (10% weight)

Scores range from 0-100, with higher scores indicating stronger potential connections.

## Authentication

All API endpoints use Clerk for authentication. Include a valid JWT in the Authorization header:

```sh
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The API automatically syncs user data from Clerk on first authentication.
