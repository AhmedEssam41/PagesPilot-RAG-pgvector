# Soft Delete Implementation Guide

## Overview

The PagePilot application now implements soft delete functionality for user management, ensuring data integrity and preserving analytics history while allowing administrators to manage user accounts effectively.

## What is Soft Delete?

Soft delete is a data management technique where records are not physically removed from the database but are marked as "deleted" or "inactive". This approach:

- **Preserves Data Integrity**: Maintains referential integrity with related records
- **Enables Recovery**: Allows reactivation of accidentally deactivated accounts
- **Preserves Analytics**: Keeps historical data for reporting and analysis
- **Audit Trail**: Maintains complete activity history

## Database Schema Changes

### User Model Updates

```typescript
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("user")
  isActive  Boolean  @default(true)   // Soft delete flag
  deletedAt DateTime?                 // When user was deactivated
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations remain the same
  facebookAccounts FacebookAccount[]
  analytics        UserAnalytics[]
}
```

## API Endpoints

### User Management (Admin Only)

#### Get All Users
```http
GET /api/v1/admin/users
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `includeInactive` (boolean): Include deactivated users in results

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "deletedAt": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user",
    "isActive": false,
    "deletedAt": "2024-01-16T14:20:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
]
```

#### Get Specific User
```http
GET /api/v1/admin/users/{id}
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `includeInactive` (boolean): Include deactivated users

#### Deactivate User (Soft Delete)
```http
PATCH /api/v1/admin/users/{id}/deactivate
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "message": "User deactivated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": false,
    "deletedAt": "2024-01-16T14:20:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

#### Reactivate User
```http
PATCH /api/v1/admin/users/{id}/reactivate
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "message": "User reactivated successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "deletedAt": null,
    "updatedAt": "2024-01-16T15:30:00Z"
  }
}
```

#### Permanently Delete User
```http
DELETE /api/v1/admin/users/{id}
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "message": "User permanently deleted successfully"
}
```

## Service Functions

### User Service Functions

```typescript
// Get all users with optional inactive inclusion
getAllUsers(includeInactive: boolean = false)

// Get user by ID with optional inactive inclusion
getUserById(id: number, includeInactive: boolean = false)

// Deactivate user (soft delete)
deactivateUser(id: number)

// Reactivate user
reactivateUser(id: number)

// Permanently delete user and related data
permanentlyDeleteUser(id: number)
```

## Authentication Behavior

### Active Users Only
- **Login**: Only active users can log in
- **Token Validation**: Tokens from deactivated users are rejected
- **API Access**: Deactivated users cannot access protected endpoints

### Deactivated Users
- **Cannot Login**: Authentication fails for deactivated users
- **Token Invalid**: Existing tokens become invalid
- **Data Preserved**: All related data (Facebook accounts, analytics) remains intact

## Facebook Account Management

### Automatic Deactivation
When a user is deactivated:
- All their Facebook accounts are automatically deactivated
- Facebook pages are deactivated
- Analytics data is preserved
- Activity logs remain intact

### Reactivation
When a user is reactivated:
- Facebook accounts remain deactivated (manual reactivation required)
- User can reconnect Facebook accounts
- Historical analytics data is accessible

## Analytics and Reporting

### Data Preservation
- **User Analytics**: Historical data remains available
- **Facebook Activities**: All activity logs are preserved
- **Admin Reports**: Can include deactivated users in reports

### Reporting Options
```typescript
// Get analytics including deactivated users
const analytics = await getAdminAnalytics(30, true);

// Get user-specific analytics (works for deactivated users)
const userAnalytics = await getUserAnalytics(userId, 30);
```

## Best Practices

### 1. User Deactivation Workflow
```typescript
// 1. Deactivate user
await deactivateUser(userId);

// 2. Deactivate related Facebook accounts
await deactivateFacebookAccount(facebookAccountId);

// 3. Log the action
await logAdminAction('user_deactivated', { userId, reason });
```

### 2. Data Cleanup Strategy
```typescript
// For permanent deletion, clean up related data first
await permanentlyDeleteUser(userId);
// This automatically:
// - Deactivates Facebook accounts
// - Preserves analytics for reporting
// - Removes user record
```

### 3. Admin Dashboard Queries
```typescript
// Get active users only
const activeUsers = await getAllUsers(false);

// Get all users including inactive
const allUsers = await getAllUsers(true);

// Get specific user (including inactive)
const user = await getUserById(userId, true);
```

## Migration Notes

### Database Migration
The soft delete functionality was added via migration:
```bash
npx prisma migrate dev --name add_user_soft_delete
```

### Existing Data
- All existing users are automatically marked as `isActive: true`
- `deletedAt` field is `null` for existing users
- No data loss occurs during migration

## Error Handling

### Common Scenarios

#### 1. Deactivated User Tries to Login
```json
{
  "error": "Invalid credentials",
  "code": "LOGIN_FAILED"
}
```

#### 2. Invalid Token from Deactivated User
```json
{
  "error": "Invalid token - user not found or deactivated",
  "code": "USER_NOT_FOUND"
}
```

#### 3. Trying to Deactivate Already Deactivated User
```json
{
  "error": "User is already deactivated"
}
```

## Security Considerations

### 1. Access Control
- Only admins can deactivate/reactivate users
- Deactivated users cannot access any protected endpoints
- Tokens are invalidated immediately upon deactivation

### 2. Data Privacy
- Deactivated users' data is preserved but not accessible
- Facebook tokens remain encrypted in database
- Analytics data is anonymized in reports

### 3. Audit Trail
- All deactivation/reactivation actions are logged
- Admin actions are tracked with timestamps
- User activity history is preserved

## Monitoring and Alerts

### Key Metrics to Monitor
- Number of active vs inactive users
- Deactivation/reactivation rates
- User engagement after reactivation
- Data retention compliance

### Recommended Alerts
- Unusual deactivation patterns
- Failed login attempts from deactivated users
- Admin actions on user accounts
- Data cleanup requirements

## Conclusion

The soft delete implementation provides a robust, secure, and data-preserving approach to user management while maintaining full functionality for analytics and reporting. This approach ensures business continuity while providing administrators with flexible user management capabilities.
