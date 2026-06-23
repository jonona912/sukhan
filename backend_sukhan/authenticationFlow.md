┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                                                                   │
│  User fills form: username, email, password, passwordConfirm    │
│  Clicks "Sign Up" button                                         │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP POST Request
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (Express Server)                       │
│                                                                   │
│  POST /api/auth/register                                         │
│  └─ authRoutes.js                                               │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              MIDDLEWARE - Validation Layer                       │
│  (src/middlewares/validation.js)                                │
│                                                                   │
│  ✓ Check username length (3-30 chars)                           │
│  ✓ Check email format                                           │
│  ✓ Check password length (min 6 chars)                          │
│  ✓ Check passwords match                                        │
│                                                                   │
│  If valid → Pass to controller                                  │
│  If invalid → Return 400 error                                  │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           CONTROLLER - Business Logic Layer                      │
│  (src/controllers/authController.js - register function)        │
│                                                                   │
│  1. Extract data from request body                              │
│  2. Check if user already exists in database                    │
│     └─ Query User model                                         │
│     └─ If exists → Return 409 error (conflict)                 │
│                                                                   │
│  3. Create new user object                                      │
│  4. Save to database (triggers password hashing)                │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                MODEL - Data Layer                                │
│  (src/models/User.js)                                           │
│                                                                   │
│  Before saving:                                                 │
│  └─ Pre-save hook triggers                                      │
│  └─ Hash password with bcryptjs (salt: 10)                      │
│  └─ Original password is replaced with hash                     │
│                                                                   │
│  Save user to database                                          │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE - MongoDB Atlas/Local                      │
│                                                                   │
│  User Collection:                                               │
│  {                                                              │
│    _id: "64a5f3e2c1b2a3d4e5f6g7h8",                            │
│    username: "john_doe",                                        │
│    email: "john@example.com",                                   │
│    password: "$2b$10$hashed_password_string...",                │
│    bio: "",                                                     │
│    profilePicture: "",                                          │
│    createdAt: "2024-06-01T10:30:00Z",                           │
│    updatedAt: "2024-06-01T10:30:00Z"                            │
│  }                                                              │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           CONTROLLER - Generate Response                         │
│  (back to authController.js)                                    │
│                                                                   │
│  1. Generate JWT Token with user ID                             │
│     └─ Token expires in 7 days                                  │
│                                                                   │
│  2. Create response object:                                     │
│     ├─ message: "User registered successfully"                  │
│     ├─ token: "eyJhbGciOiJIUzI1NiIs..."                        │
│     └─ user: { id, username, email }                            │
│                                                                   │
│  3. Send response with status 201 (Created)                     │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP Response (201 Created)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
│                                                                   │
│  Response received:                                             │
│  {                                                              │
│    "message": "User registered successfully",                   │
│    "token": "eyJhbGciOiJIUzI1NiIs...",                         │
│    "user": {                                                    │
│      "id": "64a5f3e2c1b2a3d4e5f6g7h8",                        │
│      "username": "john_doe",                                    │
│      "email": "john@example.com"                                │
│    }                                                            │
│  }                                                              │
│                                                                   │
│  Frontend:                                                      │
│  ✓ Stores token in localStorage                                │
│  ✓ Redirects to login or dashboard                             │
│  ✓ Shows success message                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘