# Poke Battle Backend

This is the backend server for the Poke Battle application. It uses JSON Server to provide a RESTful API for the frontend.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Start the production server:
```bash
npm start
```

## API Endpoints

The server provides the following endpoints:
- GET /pokemon - Get all pokemon
- GET /pokemon/:id - Get a specific pokemon
- GET /battles - Get all battles
- POST /battles - Create a new battle
- PUT /battles/:id - Update a battle
- DELETE /battles/:id - Delete a battle

## Deployment

This server is deployed on Render. The production URL is: https://poke-battle-backend.onrender.com 