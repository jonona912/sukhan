1. Project Architecture: 
project/
├── src/
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth, validation, error handling
│   ├── services/        # Database operations
│   ├── utils/           # Helpers, validators
│   └── config/          # Database, JWT configs
├── tests/               # Unit and integration tests
├── .env                 # Environment variables
└── server.js            # Entry point


2. Essential API Endpoints
Auth:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout

Posts:
  GET /api/posts (paginated feed)
  POST /api/posts (create)
  DELETE /api/posts/:id

Likes:
  POST /api/posts/:id/like
  DELETE /api/posts/:id/unlike
  POST /api/comments/:id/like
  DELETE /api/comments/:id/unlike

Comments:
  GET /api/posts/:id/comments
  POST /api/posts/:id/comments (create)
  DELETE /api/comments/:id

Users:
  GET /api/users/:id (profile)
  PUT /api/users/:id (update profile)