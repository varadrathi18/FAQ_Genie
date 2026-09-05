# FAQGenie Backend

This is the backend foundation for the FAQGenie project, providing an Express.js API and MongoDB database models. The architecture is simple, production-oriented, and designed to be expanded in future phases (e.g., adding authentication and feature APIs).

## Current Functionality

- Express application setup with essential middlewares (Helmet, CORS configured for `FRONTEND_URL`, Morgan).
- Centralized global error handling (including Mongoose validations, duplicate keys, and malformed JSON payloads) and 404 handling.
- Graceful server shutdown on `SIGINT` and `SIGTERM`.
- MongoDB connection using Mongoose.
- Database models: `User`, `Project`, `Generation`, and `FAQ` with indexes and data validation.
- Health check endpoint `/api/health` providing service and database connection status.

## Required Environment Variables

Create a `.env` file in the `backend` directory (do not commit it!) based on `.env.example`:

```env
PORT=5001
MONGODB_URI=
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

- **`PORT`**: The port the backend server runs on.
- **`MONGODB_URI`**: Your MongoDB connection string (e.g., local MongoDB or MongoDB Atlas URI).
- **`FRONTEND_URL`**: Used to configure CORS allowing the frontend application to securely communicate with the backend.
- **`NODE_ENV`**: Execution environment (`development` or `production`).

## Installation

```bash
cd backend
npm install
```

## Development

Run the server with `nodemon` for automatic restarts on file changes:

```bash
npm run dev
```

## Starting the Server (Production)

```bash
npm start
```

## API Endpoints

### Health Check

- **GET** `/api/health`
  - Response (200 OK):
    ```json
    {
      "status": "ok",
      "service": "faqgenie-backend",
      "database": "connected"
    }
    ```
  - Response (503 Service Unavailable) if MongoDB is disconnected.

## Database Models & Relationships

- **User**: Represents a user of the platform.
- **Project**: Represents a product/feature being worked on. A `User` has many `Project`s.
- **Generation**: Represents a specific FAQ generation/version for a project. A `Project` has many `Generation`s. It stores the input snapshot, SEO analysis, and publication details.
- **FAQ**: Represents a generated question and answer pair. A `Generation` has many `FAQ`s.
