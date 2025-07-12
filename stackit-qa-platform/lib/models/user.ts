import mongoose, { Schema, Document } from 'mongoose'
import { UserRole, Permission } from '@/types/rbac'

// MongoDB User Interface (extends our RBAC UserWithRole)
export interface IUser extends Document {
  _id: string
  username: string
  email: string
  password: string // Hashed password
  role: UserRole
  customPermissions?: Permission[]
  restrictedPermissions?: Permission[]
  isActive: boolean
  isBanned: boolean
  banReason?: string
  bannedAt?: Date
  bannedBy?: string
  profile: {
    firstName?: string
    lastName?: string
    bio?: string
    avatar?: string
    website?: string
    location?: string
    reputation: number
    badges: string[]
  }
  settings: {
    emailNotifications: boolean
    pushNotifications: boolean
    theme: 'light' | 'dark' | 'system'
    language: string
  }
  stats: {
    questionsAsked: number
    answersGiven: number
    commentsPosted: number
    upvotesReceived: number
    downvotesReceived: number
    acceptedAnswers: number
  }
  lastLoginAt?: Date
  emailVerified: boolean
  emailVerificationToken?: string
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user'
  },
  customPermissions: [{
    type: String,
    enum: [
      // Question permissions
      'question:create', 'question:read', 'question:update', 'question:delete', 'question:vote', 'question:moderate',
      // Answer permissions
      'answer:create', 'answer:read', 'answer:update', 'answer:delete', 'answer:vote', 'answer:accept', 'answer:moderate',
      // Comment permissions
      'comment:create', 'comment:read', 'comment:update', 'comment:delete', 'comment:moderate',
      // User permissions
      'user:create', 'user:read', 'user:update', 'user:delete', 'user:ban', 'user:promote',
      // System permissions
      'system:moderate', 'system:analytics', 'system:settings', 'system:logs'
    ]
  }],
  restrictedPermissions: [{
    type: String,
    enum: [
      'question:create', 'question:read', 'question:update', 'question:delete', 'question:vote', 'question:moderate',
      'answer:create', 'answer:read', 'answer:update', 'answer:delete', 'answer:vote', 'answer:accept', 'answer:moderate',
      'comment:create', 'comment:read', 'comment:update', 'comment:delete', 'comment:moderate',
      'user:create', 'user:read', 'user:update', 'user:delete', 'user:ban', 'user:promote',
      'system:moderate', 'system:analytics', 'system:settings', 'system:logs'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  bannedAt: Date,
  bannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: {
      type: String,
      maxlength: 500
    },
    avatar: String,
    website: String,
    location: String,
    reputation: {
      type: Number,
      default: 0
    },
    badges: [String]
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  stats: {
    questionsAsked: {
      type: Number,
      default: 0
    },
    answersGiven: {
      type: Number,
      default: 0
    },
    commentsPosted: {
      type: Number,
      default: 0
    },
    upvotesReceived: {
      type: Number,
      default: 0
    },
    downvotesReceived: {
      type: Number,
      default: 0
    },
    acceptedAnswers: {
      type: Number,
      default: 0
    }
  },
  lastLoginAt: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Don't return password in JSON
      delete ret.password
      delete ret.emailVerificationToken
      delete ret.passwordResetToken
      return ret
    }
  }
})

// Indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ username: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ isActive: 1, isBanned: 1 })
UserSchema.index({ createdAt: -1 })

// Virtual for full name
UserSchema.virtual('profile.fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`
  }
  return this.username
})

// Method to convert to RBAC UserWithRole format
UserSchema.methods.toRBACUser = function() {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    role: this.role,
    customPermissions: this.customPermissions,
    restrictedPermissions: this.restrictedPermissions,
    isActive: this.isActive,
    isBanned: this.isBanned,
    createdAt: this.createdAt.toISOString(),
    lastLoginAt: this.lastLoginAt?.toISOString()
  }
}

// Pre-save middleware for password hashing (when implemented)
UserSchema.pre('save', async function(next) {
  // Password hashing will be implemented when bcryptjs is available
  // if (!this.isModified('password')) return next()
  // this.password = await bcrypt.hash(this.password, 12)
  next()
})

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
