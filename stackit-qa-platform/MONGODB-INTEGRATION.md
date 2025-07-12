# MongoDB Integration with RBAC System

## 🔗 Integration Overview

The RBAC system is **fully compatible** with MongoDB and ready for seamless integration. All files are prepared with MongoDB-specific implementations that are currently commented out.

## 📁 Files Ready for MongoDB

### 1. **Database Models**
- `lib/models/user.ts` - Complete Mongoose user schema with RBAC fields
- `lib/mongodb.ts` - Database connection management
- `lib/services/user-service.ts` - User CRUD operations with RBAC integration

### 2. **API Routes**
- `app/api/auth/login/route.ts` - Authentication endpoint
- `app/api/auth/register/route.ts` - User registration endpoint

### 3. **Context Integration**
- `contexts/rbac-context-with-mongodb.tsx` - Enhanced RBAC context with MongoDB support

### 4. **Configuration**
- `.env.example` - Environment variables template

## 🚀 Integration Steps

### Step 1: Install Dependencies
```bash
npm install mongoose bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### Step 2: Set Environment Variables
Copy `.env.example` to `.env.local` and configure:
```bash
cp .env.example .env.local
```

### Step 3: Enable MongoDB Code
Uncomment the MongoDB implementations in:
- `lib/models/user.ts` - Remove mongoose import errors
- `lib/mongodb.ts` - Enable connection functions
- `lib/services/user-service.ts` - Enable all CRUD operations
- `app/api/auth/*/route.ts` - Enable authentication endpoints

### Step 4: Replace Context
Replace `contexts/rbac-context.tsx` imports with:
```tsx
import { RBACProvider, useRBAC } from '@/contexts/rbac-context-with-mongodb'
```

## 🏗️ Database Schema

### User Collection Structure
```typescript
{
  _id: ObjectId,
  username: string (unique),
  email: string (unique),
  password: string (hashed),
  role: 'guest' | 'user' | 'admin',
  customPermissions: Permission[],
  restrictedPermissions: Permission[],
  isActive: boolean,
  isBanned: boolean,
  banReason?: string,
  bannedAt?: Date,
  bannedBy?: ObjectId,
  profile: {
    firstName?: string,
    lastName?: string,
    bio?: string,
    avatar?: string,
    reputation: number,
    badges: string[]
  },
  settings: {
    emailNotifications: boolean,
    theme: 'light' | 'dark' | 'system'
  },
  stats: {
    questionsAsked: number,
    answersGiven: number,
    upvotesReceived: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 RBAC Integration Points

### 1. **Automatic Role Detection**
```typescript
// User role is automatically loaded from MongoDB
const rbac = useRBAC()
console.log(rbac.user?.role) // 'user', 'admin', etc.
```

### 2. **Permission Management**
```typescript
// Add custom permission to user
await UserService.addCustomPermission(userId, 'question:moderate', adminId)

// Remove permission
await UserService.removeCustomPermission(userId, 'question:create', adminId)
```

### 3. **Real-time User Updates**
```typescript
// Refresh user data from database
await rbac.refreshUser()

// Update user role (admin only)
await rbac.updateUserRole(userId, 'admin')
```

### 4. **Authentication Flow**
```typescript
// Login with MongoDB verification
const user = await rbac.loginUser(email, password)

// Logout and clear session
rbac.logoutUser()
```

## 🔄 Migration Path

### Current State (Mock)
```tsx
// Mock user in RBAC context
const mockUser = { role: 'user', ... }
setUser(mockUser)
```

### After MongoDB Integration
```tsx
// Real user from database
const user = await UserService.getUserById(userId)
setUser(user)
```

## 🛡️ Security Features

### 1. **Password Security**
- Bcrypt hashing with salt rounds
- Password strength validation
- Secure password reset flow

### 2. **JWT Authentication**
- Signed tokens with expiration
- User role embedded in token
- Automatic token refresh

### 3. **Permission Validation**
- Server-side permission checks
- Role-based route protection
- Database-level user validation

## 📊 Data Flow

```
Frontend RBAC → UserService → MongoDB → Mongoose Model
     ↓              ↓            ↓           ↓
UI Components → API Routes → Database → User Collection
```

## 🔧 Configuration Examples

### MongoDB Connection String
```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/stackit-qa

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/stackit-qa
```

### User Creation
```typescript
const newUser = await UserService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'securePassword123',
  role: 'user'
})
```

### Role Management
```typescript
// Promote user to admin
await UserService.updateUserRole(userId, 'admin', currentAdminId)

// Ban user with reason
await UserService.banUser(userId, true, 'Spam content', moderatorId)
```

## 🧪 Testing

### Test Different Roles
```typescript
// Test as admin
const adminUser = await UserService.getUserByEmail('admin@test.com')
rbac.setUser(adminUser)

// Test as regular user
const regularUser = await UserService.getUserByEmail('user@test.com')
rbac.setUser(regularUser)

// Test as guest
rbac.setUser(null)
```

## 🚀 Production Considerations

### 1. **Database Indexes**
The user model includes optimized indexes for:
- Email and username lookups
- Role-based queries
- Active user filtering

### 2. **Scalability**
- Pagination for user lists
- Efficient permission caching
- Optimized database queries

### 3. **Security**
- Input validation and sanitization
- Rate limiting on auth endpoints
- Audit logging for admin actions

## 🔄 Integration Checklist

- [ ] Install MongoDB dependencies
- [ ] Configure environment variables
- [ ] Set up MongoDB database
- [ ] Uncomment MongoDB code implementations
- [ ] Replace RBAC context imports
- [ ] Test authentication flow
- [ ] Verify permission system
- [ ] Test role management
- [ ] Deploy and monitor

## 📞 Support

The RBAC system is designed to work seamlessly with your existing MongoDB setup. All interfaces match the current mock implementation, ensuring zero breaking changes when switching to the database.

**Ready for production deployment! 🚀**
