// src/modules/auth/auth.type.ts

import { UserRole } from '../user/user.type';

export interface JwtPayload {
  userId: string;
  roles: UserRole[];
  mustChangePassword?: boolean;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  user: {
    userId: string;
    name: string;
    roles: UserRole[];
    mustChangePassword?: boolean;
  };
}

export interface AuthForgotPasswordInput {
  email: string;
}

export interface AuthResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface AuthChangePasswordInput {
  oldPassword?: string; 
  newPassword: string;
}
