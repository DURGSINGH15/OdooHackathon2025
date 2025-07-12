// models/User.ts
import { Schema, model, Document } from 'mongoose';

export interface INotification {
  message: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  isAdmin: boolean;
  createdAt: Date;
  notifications: INotification[];
}

const NotificationSchema = new Schema<INotification>({
  message:   { type: String, required: true },
  link:      { type: String, required: true },
  isRead:    { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema<IUser>({
  username:     { type: String, required: true, unique: true, index: true },
  email:        { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  avatarUrl:    { type: String },

  isAdmin:    { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },

  notifications: { type: [NotificationSchema], default: [] }
});

export const User = model<IUser>('User', UserSchema);