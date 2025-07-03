// src/services/auth.service.ts
import apiClient from '@/lib/api-client'
import {
  AuthLoginInput,
  AuthLoginResponse,
  AuthForgotPasswordInput,
  AuthResetPasswordInput,
  AuthChangePasswordInput,
} from '@/types/auth.types'

// POST /auth/login
export function login(payload: AuthLoginInput) {
  return apiClient
    .post<{ data: AuthLoginResponse }>('/auth/login', payload)
    .then(res => res.data.data)
}

// POST /auth/forgot-password
export function forgotPassword(payload: AuthForgotPasswordInput) {
  return apiClient
    .post<{ success: boolean }>('/auth/forgot-password', payload)
    .then(res => res.data);
}

// POST /auth/reset-password
export function resetPassword(payload: AuthResetPasswordInput) {
  return apiClient
    .post<{ success: boolean }>('/auth/reset-password', payload)
    .then(res => res.data);
}

// POST /auth/change-password
export function changePassword(payload: AuthChangePasswordInput) {
  return apiClient
    .post<{ success: boolean }>('/auth/change-password', payload)
    .then(res => res.data);
}

// POST /auth/logout
export function logout() {
  return apiClient.post('/auth/logout')
}
