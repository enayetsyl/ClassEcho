// src/types/auth.types.ts

export interface AuthLoginInput {
  email: string
  password: string
}

export interface AuthLoginResponse {
  token: string
  user: {
    userId: string
    name: string
    roles: string[]
    mustChangePassword?: boolean
  }
}

export interface AuthForgotPasswordInput {
  email: string
}

export interface AuthResetPasswordInput {
  token: string
  newPassword: string
}

export interface AuthChangePasswordInput {
  oldPassword?: string
  newPassword: string
}
