# PagePilot API Structure

## Overview
The PagePilot API has been restructured with proper separation of concerns and authentication. The API now supports both regular users and administrators with different access levels.

## Authentication
- JWT-based authentication
- Role-based access control (user/admin)
- Protected routes require valid JWT tokens

## API Endpoints

### User Authentication (`/api/v1/users`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user info (protected)

### Content Generation (`/api/v1/content`)
- `POST /generate-post` - Generate AI content (protected)
- `POST /upload-image` - Upload image to Cloudinary (protected)

### Facebook Integration (`/api/v1/facebook`)
- `GET /login` - Get Facebook OAuth URL
- `GET /login/callback` - Handle Facebook OAuth callback
- `GET /pages` - Get user's Facebook pages
- `POST /post` - Create Facebook post (protected)
- `POST /schedule` - Schedule Facebook post (protected)
- `GET /comments/:postId` - Get post comments (protected)
- `POST /reply` - Reply to comment (protected)

### Lead Management (`/api/v1/leads`)
- `POST /` - Create new lead
- `GET /` - Get all leads

### Admin Management (`/api/v1/admin`)
- `POST /register` - Register admin
- `POST /login` - Login admin
- `GET /users` - Get all users (admin only)
- `PUT /users/:id` - Update user role (admin only)
- `DELETE /users/:id` - Delete user (admin only)
- `GET /leads` - Get all leads (admin only)

## Authentication Flow

### User Registration/Login
1. User registers with email/password
2. System creates user with "user" role
3. JWT token returned for authentication

### Admin Registration/Login
1. Admin registers with email/password
2. System creates user with "admin" role
3. JWT token returned for authentication

### Protected Routes
- Include `Authorization: Bearer <token>` header
- Token contains user ID, email, and role
- Middleware validates token and sets user context

## Role-Based Access Control

### User Role
- Can generate content
- Can upload images
- Can manage Facebook posts
- Cannot access admin functions

### Admin Role
- All user permissions
- Can manage users (view, update, delete)
- Can view all leads
- Can access admin dashboard

## Services Architecture

### Authentication Service
- User registration/login
- JWT token management
- Role-based access control

### Content Service
- AI content generation using Gemini
- Image generation with Imagen
- Cloudinary integration

### Facebook Service
- OAuth flow management
- Page management
- Post creation and scheduling
- Comment management

### Admin Service
- User management
- Lead management
- System administration

## Database Schema

### User Model
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      String   @default("user") // "user" or "admin"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Lead Model
```prisma
model Lead {
  id        Int      @default(autoincrement())
  name      String
  email     String   @unique
  url       String?
  message   String?
  createdAt DateTime @default(now())
}
```

## Environment Variables
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - PostgreSQL connection string
- `FB_APP_ID` - Facebook App ID
- `FB_APP_SECRET` - Facebook App Secret
- `FB_API_URL` - Facebook API base URL
- Google Cloud credentials for AI services
- Cloudinary credentials for image storage

## Error Handling
- Consistent error response format
- HTTP status codes for different error types
- Detailed error messages for debugging
- Rate limiting and quota management

## Security Features
- Password hashing with bcrypt
- JWT token expiration
- Role-based route protection
- Input validation and sanitization
