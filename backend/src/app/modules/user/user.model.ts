import { Schema, model, Document } from 'mongoose';
import { IUser, UserRole } from './user.type';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      required: true,
      enum: ['Admin', 'SeniorAdmin', 'Teacher', 'Management'] as UserRole[],
      default: ['Teacher'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    // Optional profile fields
    phone: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

export const User = model<IUserDocument>('User', UserSchema);
