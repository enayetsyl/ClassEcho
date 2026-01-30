// src/app/modules/quran/reports/quran-reports.validation.ts

import { z } from 'zod';

const reportFiltersQuery = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
  class: z.string().optional(),
  supervision: z.enum(['true', 'false']).optional(),
  studentId: z.string().length(24).optional(),
});

export const getQuranOverallReportValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranWeeklySummaryValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranClassBreakdownValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranStudentReportValidation = z.object({
  params: z.object({
    studentId: z.string().length(24, 'Invalid student ID'),
  }),
  query: z.object({
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
  }),
});

export const getQuranSupervisionReportValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranUstadSummaryValidation = z.object({
  query: reportFiltersQuery,
});
