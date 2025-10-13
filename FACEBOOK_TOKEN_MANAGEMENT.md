# Facebook Token Management & Analytics System

## Overview

This system provides comprehensive Facebook token management, user analytics, and admin insights for the PagePilot application. Users can connect multiple Facebook accounts, switch between devices, and get detailed analytics about their social media activity.

## Features

### 🔐 Token Management
- **Persistent Storage**: Facebook tokens are securely stored in the database
- **Multi-Account Support**: Users can connect multiple Facebook accounts
- **Device Management**: Track and switch between different devices
- **Token Refresh**: Automatic token refresh when needed
- **Security**: Encrypted token storage with device tracking

### 📊 User Analytics
- **Activity Tracking**: Monitor posts, comments, and page connections
- **Performance Metrics**: Track engagement and posting frequency
- **Historical Data**: View analytics over custom time periods
- **Account Insights**: Detailed information about connected accounts

### 👨‍💼 Admin Management
- **User Overview**: See all users and their Facebook connections
- **System Analytics**: Platform-wide statistics and insights
- **Account Management**: Deactivate or manage user accounts
- **Activity Monitoring**: Track user activities across the platform

## Database Schema

### FacebookAccount Model
```typescript
{
  id: number;
  userId: number;
  facebookUserId: string;
  accessToken: string;
  tokenType: string;
  expiresAt?: Date;
  refreshToken?: string;
  scope?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  deviceInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### FacebookPage Model
```typescript
{
  id: number;
  facebookAccountId: number;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  category?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### FacebookActivity Model
```typescript
{
  id: number;
  facebookAccountId: number;
  facebookPageId?: number;
  activityType: string;
  activityData?: any;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}
```

### UserAnalytics Model
```typescript
{
  id: number;
  userId: number;
  date: Date;
  postsCreated: number;
  postsScheduled: number;
  commentsReplied: number;
  pagesConnected: number;
  totalEngagement: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### User Endpoints

#### Connect Facebook Account
```http
GET /api/v1/facebook/login?redirect_uri={redirect_uri}
```
Initiates Facebook OAuth flow.

#### Handle OAuth Callback
```http
GET /api/v1/facebook/login/callback?code={code}&redirect_uri={redirect_uri}
Authorization: Bearer {jwt_token}
```
Exchanges code for token and saves to database.

#### Get User's Facebook Accounts
```http
GET /api/v1/facebook/accounts
Authorization: Bearer {jwt_token}
```
Returns all connected Facebook accounts for the user.

#### Get User Analytics
```http
GET /api/v1/facebook/analytics?days=30
Authorization: Bearer {jwt_token}
```
Returns user's analytics data for the specified number of days.

#### Switch Device
```http
POST /api/v1/facebook/switch-device
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "facebookAccountId": 123,
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "Windows",
    "browser": "Chrome",
    "device": "Desktop"
  }
}
```

#### Deactivate Account
```http
DELETE /api/v1/facebook/accounts/{id}
Authorization: Bearer {jwt_token}
```

### Admin Endpoints

#### Get Admin Analytics
```http
GET /api/v1/admin/facebook/analytics?days=30
Authorization: Bearer {admin_jwt_token}
```
Returns platform-wide analytics and insights.

#### Get User's Facebook Accounts (Admin)
```http
GET /api/v1/admin/facebook/users/{userId}/accounts
Authorization: Bearer {admin_jwt_token}
```
Admin can view any user's Facebook accounts.

#### Deactivate User's Facebook Account (Admin)
```http
DELETE /api/v1/admin/facebook/accounts/{id}
Authorization: Bearer {admin_jwt_token}
```
Admin can deactivate any user's Facebook account.

## Usage Examples

### 1. Connect Facebook Account

```javascript
// Step 1: Get OAuth URL
const response = await fetch('/api/v1/facebook/login?redirect_uri=https://yourapp.com/callback');
const { authUrl } = await response.json();

// Step 2: Redirect user to Facebook
window.location.href = authUrl;

// Step 3: Handle callback (automatic)
// The callback will save the token to the database
```

### 2. Get User Analytics

```javascript
const response = await fetch('/api/v1/facebook/analytics?days=30', {
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
const { data } = await response.json();

console.log('Total accounts:', data.summary.totalAccounts);
console.log('Total pages:', data.summary.totalPages);
console.log('Recent activities:', data.summary.recentActivity);
```

### 3. Switch Device

```javascript
const deviceInfo = {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  browser: getBrowserName(),
  device: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
};

const response = await fetch('/api/v1/facebook/switch-device', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    facebookAccountId: 123,
    deviceInfo
  })
});
```

### 4. Admin Analytics

```javascript
const response = await fetch('/api/v1/admin/facebook/analytics?days=7', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const { data } = await response.json();

console.log('Total users:', data.overview.totalUsers);
console.log('Active users:', data.overview.activeUsers);
console.log('Active rate:', data.overview.activeRate + '%');
```

## Activity Types

The system tracks various activity types:

- `account_connected` - User connected a Facebook account
- `pages_connected` - User connected Facebook pages
- `post_created` - User created a post
- `post_scheduled` - User scheduled a post
- `comment_replied` - User replied to a comment
- `device_switched` - User switched device
- `account_deactivated` - Account was deactivated

## Security Features

1. **Token Encryption**: All tokens are stored securely
2. **User Isolation**: Users can only access their own accounts
3. **Admin Controls**: Admins can manage all accounts
4. **Device Tracking**: Monitor account usage across devices
5. **Activity Logging**: Complete audit trail of all activities

## Analytics Insights

### User Level
- Personal posting frequency
- Engagement metrics
- Account performance
- Device usage patterns

### Admin Level
- Platform-wide user activity
- Account connection trends
- System health metrics
- User engagement rates

## Migration Notes

The system includes a database migration that creates the necessary tables:
- `FacebookAccount`
- `FacebookPage`
- `FacebookActivity`
- `UserAnalytics`

Run the migration with:
```bash
npx prisma migrate dev --name add_facebook_token_management
```

## Environment Variables

Ensure these environment variables are set:
- `FB_APP_ID` - Facebook App ID
- `FB_APP_SECRET` - Facebook App Secret
- `FB_API_URL` - Facebook Graph API URL
- `DATABASE_URL` - Database connection string

## Error Handling

The system includes comprehensive error handling:
- Token validation errors
- Database connection issues
- Facebook API errors
- User permission errors
- Rate limiting

All errors are logged and appropriate HTTP status codes are returned.
