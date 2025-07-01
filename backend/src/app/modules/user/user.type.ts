// src/modules/user/user.type.ts

export type UserRole = 'Admin' | 'SeniorAdmin' | 'Teacher' | 'Management';

export interface IUser {
  _id?: string;   
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  active: boolean;

  // Password management
  mustChangePassword?: boolean;
  resetPasswordToken?: string;
  resetTokenExpires?: Date;

  // Optional profile fields (add as needed)
  phone?: string;
  dateOfBirth?: Date;
  profileImageUrl?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
