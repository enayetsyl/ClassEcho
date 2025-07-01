import { z } from 'zod';

// For adding a new teacher
export const addTeacherValidation = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
});

// For updating own profile
export const updateProfileValidation = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    profileImageUrl: z.string().url('Must be a valid URL').optional(),
  }),
});
