# Production-Ready Authentication Guide

## Overview
This guide covers the production-ready authentication system implemented in PagePilot, including HTTP cookies, validation, rate limiting, and security features.

## Authentication Features

### 🔐 **Dual Token System**
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **HTTP-Only Cookies**: Secure token storage

### 🛡️ **Security Features**
- Password strength validation
- Email format validation
- Rate limiting on all endpoints
- XSS protection
- CSRF protection via SameSite cookies
- Request sanitization
- Security headers (Helmet.js)

### 🍪 **Cookie Configuration**
```javascript
// Access Token Cookie
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/"
}

// Refresh Token Cookie
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/"
}
```

## API Endpoints

### User Authentication
```bash
# Register User
POST /api/v1/users/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "user" // optional, defaults to "user"
}

# Login User
POST /api/v1/users/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# Refresh Tokens
POST /api/v1/users/refresh
# Uses refresh token from HTTP-only cookie

# Logout
POST /api/v1/users/logout
# Clears HTTP-only cookies

# Get Current User
GET /api/v1/users/me
Authorization: Bearer <access_token>
# OR uses HTTP-only cookie automatically
```

### Admin Authentication
```bash
# Register Admin
POST /api/v1/admin/register
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}

# Login Admin
POST /api/v1/admin/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}

# Admin Logout
POST /api/v1/admin/logout

# Admin Operations (require admin role)
GET /api/v1/admin/users
PUT /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
GET /api/v1/admin/leads
```

## Rate Limiting

### Authentication Endpoints
- **Limit**: 5 requests per 15 minutes per IP
- **Scope**: Registration and login attempts
- **Skip**: Successful requests

### Content Generation
- **Limit**: 20 requests per hour per IP
- **Scope**: AI content generation

### Facebook API
- **Limit**: 30 requests per 15 minutes per IP
- **Scope**: Facebook API calls

### Admin Operations
- **Limit**: 50 requests per 15 minutes per IP
- **Scope**: Admin management operations

### General API
- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: All other endpoints

## Input Validation

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Email Validation
- Valid email format
- Normalized (lowercase, trimmed)

### Content Generation Validation
- Topic: 3-200 characters
- Tone: casual, professional, funny, exciting, informative
- Length: short, medium, long
- Keywords: Array of strings
- Context: Max 500 characters

### Facebook Post Validation
- Page ID: Required
- Message: 1-2000 characters
- Access Token: Required
- Image URL: Valid URL (optional)
- Schedule Time: Unix timestamp, at least 1 minute in future

## Security Headers

### Content Security Policy
```javascript
{
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  fontSrc: ["'self'"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"],
  frameSrc: ["'none'"]
}
```

### CORS Configuration
```javascript
{
  origin: ['http://localhost:3000', 'https://pagespilot.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}
```

## Environment Variables

### Required Variables
```bash
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Facebook API
FB_APP_ID=your-facebook-app-id
FB_APP_SECRET=your-facebook-app-secret
FB_API_URL=https://graph.facebook.com/v19.0

# Google Cloud (for AI)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional Security
ADMIN_IP_WHITELIST=192.168.1.100,10.0.0.50
NODE_ENV=production
```

## Error Codes

### Authentication Errors
- `NO_TOKEN`: Access token required
- `TOKEN_EXPIRED`: Access token expired
- `INVALID_TOKEN`: Invalid access token
- `USER_NOT_FOUND`: User not found
- `NO_REFRESH_TOKEN`: Refresh token required
- `REFRESH_TOKEN_EXPIRED`: Refresh token expired
- `INVALID_REFRESH_TOKEN`: Invalid refresh token
- `ADMIN_REQUIRED`: Admin access required
- `AUTH_REQUIRED`: Authentication required

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED`: General rate limit exceeded
- `AUTH_RATE_LIMIT_EXCEEDED`: Authentication rate limit exceeded
- `CONTENT_RATE_LIMIT_EXCEEDED`: Content generation rate limit exceeded
- `FACEBOOK_RATE_LIMIT_EXCEEDED`: Facebook API rate limit exceeded
- `ADMIN_RATE_LIMIT_EXCEEDED`: Admin operations rate limit exceeded

### Validation Errors
- `VALIDATION_FAILED`: Input validation failed
- `REQUEST_TOO_LARGE`: Request size exceeded 10MB
- `IP_NOT_ALLOWED`: IP address not in whitelist

## Frontend Integration

### JavaScript/React Example
```javascript
// Login with automatic cookie handling
const login = async (email, password) => {
  const response = await fetch('/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  return data;
};

// API calls with automatic cookie authentication
const generateContent = async (topic, tone) => {
  const response = await fetch('/api/v1/content/generate-post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ topic, tone })
  });
  
  return await response.json();
};

// Logout
const logout = async () => {
  await fetch('/api/v1/users/logout', {
    method: 'POST',
    credentials: 'include'
  });
};
```

### Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, // Important for cookies
});

// Automatic token refresh interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
      try {
        await api.post('/users/refresh');
        return api.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Production Deployment

### Security Checklist
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure HTTPS in production
- [ ] Set secure cookie flags
- [ ] Configure CORS for production domains
- [ ] Set up rate limiting
- [ ] Configure IP whitelist for admin
- [ ] Enable security headers
- [ ] Set up monitoring and logging

### Performance Considerations
- Access tokens expire in 15 minutes (reduces security risk)
- Refresh tokens expire in 7 days (good user experience)
- Rate limiting prevents abuse
- Request size limiting prevents DoS attacks
- Input validation prevents injection attacks

### Monitoring
- Monitor authentication failures
- Track rate limit violations
- Monitor token refresh patterns
- Log security events
- Set up alerts for suspicious activity

## Testing

### Authentication Flow Test
```bash
# 1. Register user
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 2. Login (sets cookies)
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# 3. Use authenticated endpoint
curl -X GET http://localhost:3000/api/v1/users/me \
  -b cookies.txt

# 4. Refresh tokens
curl -X POST http://localhost:3000/api/v1/users/refresh \
  -b cookies.txt

# 5. Logout
curl -X POST http://localhost:3000/api/v1/users/logout \
  -b cookies.txt
```

This authentication system is production-ready with comprehensive security features, proper validation, and excellent user experience through HTTP-only cookies and automatic token refresh.
