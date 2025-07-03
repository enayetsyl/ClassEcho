// src/hooks/use-auth.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as authService from '@/services/auth.service'
import {
  AuthLoginInput,
  AuthLoginResponse,
  AuthForgotPasswordInput,
  AuthResetPasswordInput,
  AuthChangePasswordInput,
} from '@/types/auth.types'
import { useAuth } from '@/context/AuthContext'

// LOGIN
export function useLogin() {
  const { login: setAuth } = useAuth()
  return useMutation<AuthLoginResponse, Error, AuthLoginInput>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}

// FORGOT PASSWORD
export function useForgotPassword() {
  return useMutation<{ success: boolean }, Error, AuthForgotPasswordInput>({
    mutationFn: authService.forgotPassword,
  })
}

// RESET PASSWORD
export function useResetPassword() {
  return useMutation<{ success: boolean }, Error, AuthResetPasswordInput>({
    mutationFn: authService.resetPassword,
  })
}

// CHANGE PASSWORD
export function useChangePassword() {
  return useMutation<{ success: boolean }, Error, AuthChangePasswordInput>({
    mutationFn: authService.changePassword,
  })
}

// LOGOUT
export function useLogout() {
  const { logout: clearAuth } = useAuth()
  const queryClient = useQueryClient()
  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout().then(() => {}),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
    },
  })
}
