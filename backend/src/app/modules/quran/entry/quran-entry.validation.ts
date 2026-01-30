// src/app/modules/quran/entry/quran-entry.validation.ts

import { z } from 'zod';

const mongoIdSchema = z
  .string()
  .length(24, 'Invalid ID')
  .regex(/^[a-f0-9]{24}$/i, 'Invalid ID format');

const testSchema = z.object({
  given: z.boolean(),
  tanbih: z.number().int().min(0).default(0),
  fath: z.number().int().min(0).default(0),
  note: z.string().max(500).optional(),
});

const tajweedNotesSchema = z.object({
  harf: z.string().max(500).optional(),
  ghunna: z.string().max(500).optional(),
  madd: z.string().max(500).optional(),
  other: z.string().max(500).optional(),
});

export const createQuranEntryValidation = z.object({
  body: z.object({
    studentId: mongoIdSchema,
    reportDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    newTest: testSchema.optional(),
    recentTest: testSchema.optional(),
    olderTest: testSchema.optional(),
    tajweedNotes: tajweedNotesSchema.optional(),
    generalNote: z.string().max(1000).optional(),
    ustadName: z.string().max(100).optional(),
    signature: z.string().max(100).optional(),
  }),
});

export const updateQuranEntryValidation = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
  body: z.object({
    newTest: testSchema.optional(),
    recentTest: testSchema.optional(),
    olderTest: testSchema.optional(),
    tajweedNotes: tajweedNotesSchema.optional(),
    generalNote: z.string().max(1000).optional(),
    ustadName: z.string().max(100).optional(),
    signature: z.string().max(100).optional(),
  }),
});

export const quranEntryIdParam = z.object({
  params: z.object({
    id: mongoIdSchema,
  }),
});

export const quranEntryStudentIdParam = z.object({
  params: z.object({
    studentId: mongoIdSchema,
  }),
});

export const listQuranEntriesValidation = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    studentId: mongoIdSchema.optional(),
    class: z.string().optional(),
    supervision: z.enum(['true', 'false']).optional(),
    startDate: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Invalid date' })
      .optional(),
    endDate: z
      .string()
      .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Invalid date' })
      .optional(),
    ustadName: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const createEntryBodySchema = z.object({
  studentId: mongoIdSchema,
  reportDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  newTest: testSchema.optional(),
  recentTest: testSchema.optional(),
  olderTest: testSchema.optional(),
  tajweedNotes: tajweedNotesSchema.optional(),
  generalNote: z.string().max(1000).optional(),
  ustadName: z.string().max(100).optional(),
  signature: z.string().max(100).optional(),
});

export const bulkCreateQuranEntriesValidation = z.object({
  body: z.object({
    entries: z.array(createEntryBodySchema),
  }),
});
