import { z } from 'zod';

// Login validation
export const loginValidation = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
});

// Forgot password validation
export const forgotPasswordValidation = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
  }),
});

// Reset password validation
export const resetPasswordValidation = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// Change password validation (for logged-in users)
export const changePasswordValidation = z.object({
  body: z.object({
    oldPassword: z.string().optional(), 
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
