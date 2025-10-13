# PagePilot API Usage Examples

## User Registration and Login

### Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Login user
```bash
curl -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Content Generation

### Generate AI content
```bash
curl -X POST http://localhost:3000/api/v1/content/generate-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "topic": "Sustainable living tips",
    "tone": "informative",
    "length": "medium",
    "keywords": ["eco-friendly", "sustainability"],
    "context": "For a lifestyle blog",
    "generateImage": true
  }'
```

Response:
```json
{
  "content": "🌱 Small changes, big impact! Start your sustainable journey with these simple swaps: reusable water bottles, cloth shopping bags, and LED bulbs. Every choice counts for our planet! 💚 #SustainableLiving #EcoFriendly #GreenLifestyle",
  "hashtags": ["#SustainableLiving", "#EcoFriendly", "#GreenLifestyle"],
  "suggestedImage": "A modern kitchen with eco-friendly products and plants",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pagespilot-ai-generated/abc123.jpg",
  "imagePublicId": "pagespilot-ai-generated/abc123"
}
```

## Facebook Integration

### Get Facebook OAuth URL
```bash
curl "http://localhost:3000/api/v1/facebook/login?redirect_uri=http://localhost:3000/callback"
```

### Handle Facebook OAuth Callback (with token persistence)
```bash
curl "http://localhost:3000/api/v1/facebook/login/callback?code=OAUTH_CODE&redirect_uri=http://localhost:3000/callback" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "facebookAccount": {
    "id": 1,
    "userId": 1,
    "facebookUserId": "123456789",
    "accessToken": "EAABwzLixnjYBO...",
    "isActive": true,
    "deviceInfo": "{\"userAgent\":\"Mozilla/5.0...\",\"platform\":\"Windows\"}"
  },
  "tokenData": {
    "access_token": "EAABwzLixnjYBO...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### Get user's Facebook accounts
```bash
curl "http://localhost:3000/api/v1/facebook/accounts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "data": [
    {
      "id": 1,
      "facebookUserId": "123456789",
      "isActive": true,
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "deviceInfo": "{\"platform\":\"Windows\",\"browser\":\"Chrome\"}",
      "pages": [
        {
          "id": 1,
          "pageId": "987654321",
          "pageName": "My Business Page",
          "isActive": true
        }
      ],
      "_count": {
        "activities": 15
      }
    }
  ]
}
```

### Get user's Facebook pages (with database persistence)
```bash
curl "http://localhost:3000/api/v1/facebook/pages?access_token=USER_ACCESS_TOKEN&facebook_account_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get user analytics
```bash
curl "http://localhost:3000/api/v1/facebook/analytics?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "data": {
    "analytics": [
      {
        "date": "2024-01-15T00:00:00Z",
        "postsCreated": 5,
        "postsScheduled": 2,
        "commentsReplied": 8,
        "pagesConnected": 1,
        "totalEngagement": 13
      }
    ],
    "summary": {
      "totalAccounts": 2,
      "totalPages": 3,
      "totalActivities": 25,
      "recentActivity": [...]
    }
  }
}
```

### Switch device for Facebook account
```bash
curl -X POST http://localhost:3000/api/v1/facebook/switch-device \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "facebookAccountId": 1,
    "deviceInfo": {
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "platform": "Windows",
      "browser": "Chrome",
      "device": "Desktop"
    }
  }'
```

### Create a Facebook post (with activity logging)
```bash
curl -X POST http://localhost:3000/api/v1/facebook/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pageId": "123456789",
    "message": "Your post content here",
    "accessToken": "PAGE_ACCESS_TOKEN",
    "imageUrl": "https://example.com/image.jpg",
    "facebookAccountId": 1
  }'
```

### Schedule a Facebook post
```bash
curl -X POST http://localhost:3000/api/v1/facebook/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pageId": "123456789",
    "message": "Your scheduled post content",
    "accessToken": "PAGE_ACCESS_TOKEN",
    "scheduleTime": 1640995200
  }'
```

### Deactivate Facebook account
```bash
curl -X DELETE http://localhost:3000/api/v1/facebook/accounts/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Admin Functions

### Register admin
```bash
curl -X POST http://localhost:3000/api/v1/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Login admin
```bash
curl -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Get all users (admin only)
```bash
curl -X GET http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get all users including inactive (admin only)
```bash
curl -X GET "http://localhost:3000/api/v1/admin/users?includeInactive=true" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get specific user (admin only)
```bash
curl -X GET http://localhost:3000/api/v1/admin/users/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Update user role (admin only)
```bash
curl -X PUT http://localhost:3000/api/v1/admin/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "role": "admin",
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

### Deactivate user (soft delete - admin only)
```bash
curl -X PATCH http://localhost:3000/api/v1/admin/users/1/deactivate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Reactivate user (admin only)
```bash
curl -X PATCH http://localhost:3000/api/v1/admin/users/1/reactivate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Permanently delete user (admin only)
```bash
curl -X DELETE http://localhost:3000/api/v1/admin/users/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Hierarchical Role Management

### Assign user to manager (admin only)
```bash
curl -X POST http://localhost:3000/api/v1/admin/assign-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "managerId": 123,
    "userId": 456
  }'
```

### Get all user assignments (admin only)
```bash
curl -X GET http://localhost:3000/api/v1/admin/assignments \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Remove user assignment (admin only)
```bash
curl -X DELETE http://localhost:3000/api/v1/admin/assignments/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Manager Dashboard

### Get manager dashboard
```bash
curl -X GET http://localhost:3000/api/v1/manager/dashboard \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

Response:
```json
{
  "data": {
    "totalManagedUsers": 5,
    "activeUsers": 4,
    "inactiveUsers": 1,
    "totalFacebookAccounts": 8,
    "totalPages": 12,
    "recentActivities": [...],
    "userPerformance": [
      {
        "userId": 1,
        "userName": "John Client",
        "userEmail": "john@client.com",
        "isActive": true,
        "facebookAccounts": 2,
        "totalPages": 3,
        "totalActivities": 15,
        "recentAnalytics": [...]
      }
    ]
  }
}
```

### Get managed users
```bash
curl -X GET http://localhost:3000/api/v1/manager/my-users \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

### Get specific managed user
```bash
curl -X GET http://localhost:3000/api/v1/manager/my-users/1 \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

### Get managed user analytics
```bash
curl -X GET "http://localhost:3000/api/v1/manager/my-users/1/analytics?days=30" \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

### Deactivate managed user
```bash
curl -X PATCH http://localhost:3000/api/v1/manager/my-users/1/deactivate \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

### Reactivate managed user
```bash
curl -X PATCH http://localhost:3000/api/v1/manager/my-users/1/reactivate \
  -H "Authorization: Bearer MANAGER_JWT_TOKEN"
```

### Get my managers (for users)
```bash
curl -X GET http://localhost:3000/api/v1/manager/my-managers \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Get all leads (admin only)
```bash
curl -X GET http://localhost:3000/api/v1/admin/leads \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get admin Facebook analytics
```bash
curl "http://localhost:3000/api/v1/admin/facebook/analytics?days=30" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

Response:
```json
{
  "data": {
    "overview": {
      "totalUsers": 150,
      "activeUsers": 89,
      "totalAccounts": 134,
      "totalPages": 267,
      "activeRate": 59.33
    },
    "recentActivities": [
      {
        "id": 1,
        "activityType": "post_created",
        "success": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "facebookAccount": {
          "user": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        },
        "facebookPage": {
          "pageName": "Business Page"
        }
      }
    ],
    "userAnalytics": [...]
  }
}
```

### Get user's Facebook accounts (admin)
```bash
curl "http://localhost:3000/api/v1/admin/facebook/users/1/accounts" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Deactivate user's Facebook account (admin)
```bash
curl -X DELETE "http://localhost:3000/api/v1/admin/facebook/accounts/1" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Lead Management

### Create a lead
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "url": "https://example.com",
    "message": "Interested in your services"
  }'
```

## Error Responses

### Authentication Error
```json
{
  "error": "Access token required"
}
```

### Authorization Error
```json
{
  "error": "Admin access required"
}
```

### Validation Error
```json
{
  "error": "Topic is required"
}
```

### Server Error
```json
{
  "error": "Google Cloud authentication failed",
  "details": "Verify your service account key is valid and has proper permissions",
  "code": "AUTH_ERROR"
}
```

## JavaScript/Node.js Examples

### Using fetch API
```javascript
// Login user
const loginResponse = await fetch('http://localhost:3000/api/v1/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Generate content
const contentResponse = await fetch('http://localhost:3000/api/v1/content/generate-post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    topic: 'Healthy breakfast ideas',
    tone: 'casual',
    length: 'medium',
    generateImage: true
  })
});

const content = await contentResponse.json();
console.log(content.content);
```

### Using axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const { data: loginData } = await api.post('/users/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Set token for subsequent requests
api.defaults.headers.common['Authorization'] = `Bearer ${loginData.token}`;

// Generate content
const { data: content } = await api.post('/content/generate-post', {
  topic: 'Morning routine tips',
  tone: 'motivational',
  length: 'short'
});

console.log(content.content);
```
