# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This document explains the comprehensive RBAC system implemented for the StackIt Q&A platform, supporting three user types: **Guest**, **User**, and **Admin**.

## User Roles & Permissions

### 1. Guest Users
- **Description**: Anonymous users with read-only access
- **Permissions**:
  - View questions, answers, and comments
  - Browse content without authentication
- **Restrictions**:
  - Cannot vote, post, or interact with content
  - Must login to perform any actions

### 2. Registered Users
- **Description**: Authenticated users with full participation rights
- **Permissions**:
  - All guest permissions plus:
  - Create questions and answers
  - Vote on questions and answers (except their own)
  - Comment on answers
  - Edit/delete their own content
  - Accept answers on their own questions
  - Update their own profile
- **Restrictions**:
  - Cannot moderate other users' content
  - Cannot manage users or access admin features

### 3. Administrators
- **Description**: Full system access with moderation capabilities
- **Permissions**:
  - All user permissions plus:
  - Moderate any content (hide, flag, delete)
  - Ban and manage users
  - Access system analytics and logs
  - Promote users to different roles
  - Lock/unlock questions
  - Feature/unfeature content
- **Special Features**:
  - Comprehensive moderation tools
  - User management capabilities
  - System configuration access

## Implementation Architecture

### Core Components

#### 1. Type Definitions (`types/rbac.ts`)
- Defines user roles, permissions, and data structures
- Includes moderation actions and logging interfaces
- Provides type safety throughout the application

#### 2. Role Configuration (`lib/rbac-config.ts`)
- Centralized permission definitions for each role
- Permission groups for easier management
- Role hierarchy and requirements

#### 3. RBAC Service (`lib/rbac-service.ts`)
- Core business logic for permission checking
- Ownership-based access control
- Helper methods for common operations

#### 4. React Context (`contexts/rbac-context.tsx`)
- Global state management for user roles
- Easy access to permission checks across components
- Mock user system for development

### UI Components

#### 1. Protected Components (`components/rbac/protected-component.tsx`)
- Conditional rendering based on permissions
- Higher-order components for protection
- Specialized components for common use cases:
  - `AdminOnly` - Admin-exclusive content
  - `AuthenticatedOnly` - Logged-in users only
  - `ModeratorsOnly` - Moderator-level access
  - `OwnerOrModeratorOnly` - Content owner or moderator

#### 2. Moderation Menu (`components/rbac/moderation-menu.tsx`)
- Comprehensive moderation tools interface
- Context-aware actions based on resource type
- Reason tracking for moderation actions
- Quick moderation shortcuts

## Permission System

### Permission Categories

1. **Content Permissions**
   - `question:create/read/update/delete/vote/moderate`
   - `answer:create/read/update/delete/vote/accept/moderate`
   - `comment:create/read/update/delete/moderate`

2. **User Management**
   - `user:create/read/update/delete/ban/promote`

3. **System Administration**
   - `system:moderate/analytics/settings/logs`

### Ownership-Based Access
- Users can edit/delete their own content
- Question authors can accept answers
- Moderators can override ownership restrictions

### Voting Restrictions
- Users cannot vote on their own content
- Voting requires authentication
- Vote status is tracked per user

## Moderation Features

### Available Actions
- **Flag/Unflag**: Mark content for review
- **Hide/Unhide**: Remove from public view
- **Lock/Unlock**: Prevent new answers (questions only)
- **Feature/Unfeature**: Highlight important content
- **Delete**: Permanently remove content
- **Ban User**: Restrict user access

### Moderation Logging
- All moderation actions are logged
- Includes moderator ID, target, action, and reason
- Provides audit trail for accountability

### Quick Moderation
- Instant flag and hide buttons
- Dropdown menu for advanced actions
- Reason dialogs for serious actions

## Integration Examples

### Basic Permission Check
```tsx
const rbac = useRBAC()

// Check single permission
if (rbac.hasPermission('question:create')) {
  // Show create question button
}

// Check ownership
if (rbac.isOwner(questionAuthorId) || rbac.canModerate()) {
  // Show edit/delete options
}
```

### Component Protection
```tsx
// Protect entire components
<AdminOnly>
  <AdminPanel />
</AdminOnly>

// Protect with ownership
<OwnerOrModeratorOnly ownerId={questionAuthor}>
  <EditButton />
</OwnerOrModeratorOnly>

// Custom permission check
<ProtectedComponent 
  permission="question:moderate"
  fallback={<div>Access denied</div>}
>
  <ModerationTools />
</ProtectedComponent>
```

### Moderation Interface
```tsx
<ModerationMenu
  resourceType="question"
  resourceId={question.id}
  ownerId={question.authorId}
  isLocked={question.isLocked}
  isFlagged={question.isFlagged}
/>
```

## Security Considerations

### Client-Side Protection
- UI components are hidden based on permissions
- Form submissions check permissions before processing
- User feedback for permission denials

### Server-Side Validation
- **Important**: All permission checks must be validated on the server
- Client-side RBAC is for UX only, not security
- API endpoints should verify user permissions

### Best Practices
1. Always validate permissions on the backend
2. Use principle of least privilege
3. Log all moderation actions
4. Regular permission audits
5. Clear user feedback for denied actions

## Development & Testing

### Mock Users
The system includes mock users for testing different roles:

```tsx
// Guest user (null)
rbac.setUser(null)

// Regular user
rbac.setUser({
  id: '1',
  username: 'john_user',
  role: 'user',
  isActive: true,
  isBanned: false
})

// Admin user
rbac.setUser({
  id: '2',
  username: 'admin_user',
  role: 'admin',
  isActive: true,
  isBanned: false
})
```

### Permission Testing
Test each role's capabilities:
- Guest: Can only view content
- User: Can create, vote, comment
- Admin: Full moderation access

## Database Integration

### User Schema
```typescript
interface User {
  id: string
  username: string
  email: string
  role: 'guest' | 'user' | 'admin'
  customPermissions?: Permission[]
  restrictedPermissions?: Permission[]
  isActive: boolean
  isBanned: boolean
  createdAt: string
  lastLoginAt?: string
}
```

### Moderation Log Schema
```typescript
interface ModerationLog {
  id: string
  moderatorId: string
  targetType: 'question' | 'answer' | 'comment' | 'user'
  targetId: string
  action: ModerationAction
  reason?: string
  timestamp: string
}
```

## Future Enhancements

### Possible Extensions
1. **Custom Roles**: Site-specific roles beyond the three defaults
2. **Permission Groups**: Bulk permission management
3. **Time-based Permissions**: Temporary role assignments
4. **Geographic Restrictions**: Location-based access control
5. **Reputation System**: Permission unlock based on user reputation
6. **Approval Workflows**: Multi-step moderation processes

### Advanced Features
- Role inheritance hierarchies
- Dynamic permission calculation
- Integration with external identity providers
- Advanced audit logging and reporting
- Automated moderation based on user reports

## Conclusion

This RBAC system provides a solid foundation for managing user permissions in the Q&A platform. It balances security, usability, and maintainability while providing clear separation between guest, user, and admin capabilities.

The system is designed to be:
- **Extensible**: Easy to add new roles and permissions
- **Secure**: Client-side protection with server-side validation
- **User-friendly**: Clear feedback and intuitive interfaces
- **Maintainable**: Centralized configuration and modular design

Remember to implement corresponding server-side validation for all permission checks to ensure true security.
