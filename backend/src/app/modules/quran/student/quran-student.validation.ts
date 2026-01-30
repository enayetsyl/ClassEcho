// src/app/modules/quran/student/quran-student.validation.ts

import { z } from 'zod';

export const createQuranStudentValidation = z.object({
  body: z.object({
    studentId: z.number().int().positive('Student ID must be a positive integer'),
    nameEn: z.string().min(1, 'English name is required').max(100),
    nameBn: z.string().max(100).optional(),
    class: z.string().min(1, 'Class is required').max(50),
    supervision: z.boolean().default(false),
    active: z.boolean().default(true),
    notes: z.string().max(500).optional(),
    photo: z.string().url('Must be a valid URL').max(500).optional().or(z.literal('')),
  }),
});

export const updateQuranStudentValidation = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid student ID'),
  }),
  body: z.object({
    studentId: z.number().int().positive().optional(),
    nameEn: z.string().min(1).max(100).optional(),
    nameBn: z.string().max(100).optional(),
    class: z.string().min(1).max(50).optional(),
    supervision: z.boolean().optional(),
    active: z.boolean().optional(),
    notes: z.string().max(500).optional(),
    photo: z.string().url().max(500).optional().or(z.literal('')),
  }),
});

export const quranStudentIdParam = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid student ID'),
  }),
});

export const listQuranStudentsValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    class: z.string().optional(),
    supervision: z.enum(['true', 'false']).optional(),
    active: z.enum(['true', 'false']).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const bulkCreateQuranStudentsValidation = z.object({
  body: z.object({
    students: z.array(
      z.object({
        studentId: z.number().int().positive(),
        nameEn: z.string().min(1).max(100),
        nameBn: z.string().max(100).optional(),
        class: z.string().min(1).max(50),
        supervision: z.boolean().default(false),
        active: z.boolean().default(true),
        notes: z.string().max(500).optional(),
        photo: z.string().url().max(500).optional().or(z.literal('')),
      }),
    ),
  }),
});
