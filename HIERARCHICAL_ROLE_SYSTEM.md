# Hierarchical Role System - Production Guide

## Overview

The PagePilot application now features a comprehensive hierarchical role system that enables sophisticated user management for various business scenarios including marketing agencies, corporate teams, and multi-tenant SaaS platforms.

## Role Hierarchy

### 🔑 **Role Levels**

| Role | Level | Permissions | Use Case |
|------|-------|-------------|----------|
| **Super Admin** | 4 | Full system access, all user management | System administrators, platform owners |
| **Admin** | 3 | Full user management, role assignment | Organization administrators |
| **Manager** | 2 | Manage assigned users only | Team leads, client managers |
| **User** | 1 | Personal account access | Regular users, clients |

### 🏢 **Business Scenarios**

#### **Marketing Agency**
- **Super Admin**: Agency owner
- **Admin**: Agency administrators
- **Manager**: Account managers (assigned to specific clients)
- **User**: Client accounts

#### **Corporate Environment**
- **Super Admin**: IT administrators
- **Admin**: HR administrators
- **Manager**: Department heads
- **User**: Employees

#### **Multi-Tenant SaaS**
- **Super Admin**: Platform administrators
- **Admin**: Organization administrators
- **Manager**: Team leads within organizations
- **User**: End users

## Database Schema

### **User Model**
```typescript
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  role      String    @default("user") // "super_admin", "admin", "manager", "user"
  isActive  Boolean   @default(true)
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Management relationships
  managedUsers    UserManagement[] @relation("ManagerRelations")
  managedBy       UserManagement[] @relation("UserRelations")
  assignedUsers   UserManagement[] @relation("AssignerRelations")

  // Existing relations
  facebookAccounts FacebookAccount[]
  analytics        UserAnalytics[]
}
```

### **UserManagement Model**
```typescript
model UserManagement {
  id         Int      @id @default(autoincrement())
  managerId  Int      // The manager/admin
  userId     Int      // The user being managed
  assignedAt DateTime @default(now())
  assignedBy Int      // Who assigned this relationship
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  manager User @relation("ManagerRelations", fields: [managerId], references: [id])
  user    User @relation("UserRelations", fields: [userId], references: [id])
  assigner User @relation("AssignerRelations", fields: [assignedBy], references: [id])

  @@unique([managerId, userId])
  @@index([managerId])
  @@index([userId])
  @@index([assignedBy])
}
```

## API Endpoints

### **Manager Endpoints** (`/api/v1/manager`)

#### **Dashboard & Overview**
```http
GET /api/v1/manager/dashboard
Authorization: Bearer {manager_token}
```
Returns comprehensive dashboard with managed users overview.

#### **Managed Users**
```http
GET /api/v1/manager/my-users
Authorization: Bearer {manager_token}
```
Get all users assigned to the manager.

```http
GET /api/v1/manager/my-users/{id}
Authorization: Bearer {manager_token}
```
Get specific managed user details.

#### **User Analytics**
```http
GET /api/v1/manager/my-users/{id}/analytics?days=30
Authorization: Bearer {manager_token}
```
Get analytics for a specific managed user.

#### **User Management**
```http
PATCH /api/v1/manager/my-users/{id}/deactivate
Authorization: Bearer {manager_token}
```
Deactivate a managed user.

```http
PATCH /api/v1/manager/my-users/{id}/reactivate
Authorization: Bearer {manager_token}
```
Reactivate a managed user.

#### **Management Hierarchy**
```http
GET /api/v1/manager/my-managers
Authorization: Bearer {user_token}
```
Get who manages the current user.

### **Admin Endpoints** (`/api/v1/admin`)

#### **User Assignment**
```http
POST /api/v1/admin/assign-user
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "managerId": 123,
  "userId": 456
}
```

```http
GET /api/v1/admin/assignments
Authorization: Bearer {admin_token}
```
Get all user assignments.

```http
DELETE /api/v1/admin/assignments/{id}
Authorization: Bearer {admin_token}
```
Remove user assignment.

## Permission Matrix

### **User Management Permissions**

| Action | Super Admin | Admin | Manager | User |
|--------|-------------|-------|---------|------|
| View all users | ✅ | ✅ | ❌ | ❌ |
| View assigned users | ✅ | ✅ | ✅ | ❌ |
| Create users | ✅ | ✅ | ❌ | ❌ |
| Update any user | ✅ | ✅ | ❌ | ❌ |
| Update assigned users | ✅ | ✅ | ✅ | ❌ |
| Deactivate any user | ✅ | ✅ | ❌ | ❌ |
| Deactivate assigned users | ✅ | ✅ | ✅ | ❌ |
| Assign users to managers | ✅ | ✅ | ❌ | ❌ |
| View analytics (all) | ✅ | ✅ | ❌ | ❌ |
| View analytics (assigned) | ✅ | ✅ | ✅ | ❌ |
| View own analytics | ✅ | ✅ | ✅ | ✅ |

### **Facebook Account Management**

| Action | Super Admin | Admin | Manager | User |
|--------|-------------|-------|---------|------|
| View all Facebook accounts | ✅ | ✅ | ❌ | ❌ |
| View assigned users' accounts | ✅ | ✅ | ✅ | ❌ |
| View own Facebook accounts | ✅ | ✅ | ✅ | ✅ |
| Deactivate any Facebook account | ✅ | ✅ | ❌ | ❌ |
| Deactivate assigned users' accounts | ✅ | ✅ | ✅ | ❌ |
| Deactivate own Facebook accounts | ✅ | ✅ | ✅ | ✅ |

## Usage Examples

### **1. Marketing Agency Setup**

```javascript
// 1. Create agency owner (super admin)
const agencyOwner = await createUser("Agency Owner", "owner@agency.com", "password", "super_admin");

// 2. Create account managers
const accountManager1 = await createUser("John Manager", "john@agency.com", "password", "manager");
const accountManager2 = await createUser("Jane Manager", "jane@agency.com", "password", "manager");

// 3. Create client accounts
const client1 = await createUser("Client 1", "client1@example.com", "password", "user");
const client2 = await createUser("Client 2", "client2@example.com", "password", "user");

// 4. Assign clients to managers
await assignUserToManager(accountManager1.id, client1.id, agencyOwner.id);
await assignUserToManager(accountManager2.id, client2.id, agencyOwner.id);
```

### **2. Manager Dashboard**

```javascript
// Get manager dashboard
const response = await fetch('/api/v1/manager/dashboard', {
  headers: { 'Authorization': `Bearer ${managerToken}` }
});
const dashboard = await response.json();

console.log('Total managed users:', dashboard.data.totalManagedUsers);
console.log('Active users:', dashboard.data.activeUsers);
console.log('Total Facebook accounts:', dashboard.data.totalFacebookAccounts);
console.log('Recent activities:', dashboard.data.recentActivities);
```

### **3. User Assignment Management**

```javascript
// Assign user to manager
const assignment = await fetch('/api/v1/admin/assign-user', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    managerId: 123,
    userId: 456
  })
});

// Get all assignments
const assignments = await fetch('/api/v1/admin/assignments', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

### **4. Manager User Management**

```javascript
// Get managed users
const managedUsers = await fetch('/api/v1/manager/my-users', {
  headers: { 'Authorization': `Bearer ${managerToken}` }
});

// Get specific user analytics
const analytics = await fetch('/api/v1/manager/my-users/123/analytics?days=30', {
  headers: { 'Authorization': `Bearer ${managerToken}` }
});

// Deactivate managed user
const deactivate = await fetch('/api/v1/manager/my-users/123/deactivate', {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${managerToken}` }
});
```

## Security Features

### **1. Role-Based Access Control**
- Each endpoint validates user permissions
- Managers can only access assigned users
- Hierarchical permission inheritance

### **2. Assignment Validation**
- Prevents duplicate assignments
- Validates manager roles before assignment
- Tracks assignment history

### **3. Audit Trail**
- All management actions are logged
- Assignment history is preserved
- User activity tracking

### **4. Data Isolation**
- Managers only see their assigned users
- Analytics scoped to managed users
- Secure user switching

## Migration Guide

### **Database Migration**
```bash
npx prisma migrate dev --name add_hierarchical_role_system
```

### **Existing Data**
- All existing users remain unchanged
- New role system is backward compatible
- No data loss during migration

### **Role Updates**
```javascript
// Update user role
await prisma.user.update({
  where: { id: userId },
  data: { role: 'manager' }
});
```

## Monitoring & Analytics

### **Manager Performance Metrics**
- Number of managed users
- User engagement rates
- Facebook account activity
- Team performance analytics

### **System Health Metrics**
- Assignment distribution
- Role utilization
- Permission usage patterns
- Security audit logs

### **Business Intelligence**
- User growth by role
- Manager effectiveness
- Client satisfaction metrics
- Platform usage patterns

## Best Practices

### **1. Role Assignment Strategy**
```javascript
// Assign users based on business logic
const assignUsersToManagers = async (users, managers) => {
  for (const user of users) {
    const manager = findBestManager(user, managers);
    await assignUserToManager(manager.id, user.id, adminId);
  }
};
```

### **2. Permission Validation**
```javascript
// Always validate permissions before operations
const canManage = await canManageUser(managerId, targetUserId);
if (!canManage) {
  throw new Error('Insufficient permissions');
}
```

### **3. Audit Logging**
```javascript
// Log all management actions
await logManagementAction('user_assigned', {
  managerId,
  userId,
  assignedBy: adminId,
  timestamp: new Date()
});
```

## Error Handling

### **Common Error Scenarios**

#### **1. Insufficient Permissions**
```json
{
  "error": "You can only manage users assigned to you",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

#### **2. Invalid Assignment**
```json
{
  "error": "User is already assigned to this manager",
  "code": "DUPLICATE_ASSIGNMENT"
}
```

#### **3. Role Validation**
```json
{
  "error": "You can only assign manager or user roles",
  "code": "INVALID_ROLE_ASSIGNMENT"
}
```

## Production Deployment

### **Environment Variables**
```env
# Database
DATABASE_URL="postgresql://..."

# JWT Secrets
JWT_SECRET="your-super-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Facebook API
FB_APP_ID="your-facebook-app-id"
FB_APP_SECRET="your-facebook-app-secret"
FB_API_URL="https://graph.facebook.com/v19.0"
```

### **Security Considerations**
1. **JWT Token Security**: Use strong secrets and short expiration times
2. **Database Security**: Use connection pooling and SSL
3. **Rate Limiting**: Implement appropriate rate limits for each role
4. **Audit Logging**: Log all management actions for compliance

### **Performance Optimization**
1. **Database Indexing**: Optimize queries with proper indexes
2. **Caching**: Cache frequently accessed role data
3. **Pagination**: Implement pagination for large user lists
4. **Background Jobs**: Use background jobs for heavy operations

## Conclusion

The hierarchical role system provides a robust, scalable, and secure foundation for user management in various business scenarios. It enables:

- **Multi-tenant SaaS platforms** with organizational hierarchies
- **Marketing agencies** managing multiple client accounts
- **Corporate environments** with department-based management
- **Enterprise solutions** with complex permission structures

The system is production-ready with comprehensive security, validation, and monitoring capabilities.
