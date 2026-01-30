// src/app/modules/quran/reports/quran-reports.validation.ts

import { z } from 'zod';

const mongoIdSchema = z
  .string()
  .length(24, 'Invalid ID')
  .regex(/^[a-f0-9]{24}$/i, 'Invalid ID format');

const reportFiltersQuery = z
  .object({
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
    studentId: mongoIdSchema.optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const start = Date.parse(data.startDate);
      const end = Date.parse(data.endDate);
      return !isNaN(start) && !isNaN(end) && start <= end;
    },
    { message: 'startDate must be before or equal to endDate', path: ['startDate'] },
  );

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
    studentId: mongoIdSchema,
  }),
  query: z
    .object({
      startDate: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
      endDate: z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
    })
    .refine(
      (data) => {
        if (!data.startDate || !data.endDate) return true;
        const start = Date.parse(data.startDate);
        const end = Date.parse(data.endDate);
        return !isNaN(start) && !isNaN(end) && start <= end;
      },
      { message: 'startDate must be before or equal to endDate', path: ['startDate'] },
    ),
});

export const getQuranSupervisionReportValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranUstadSummaryValidation = z.object({
  query: reportFiltersQuery,
});
