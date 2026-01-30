// src/app/modules/quran/reports/quran-reports.validation.ts

import { z } from 'zod';

const mongoIdSchema = z
  .string()
  .length(24, 'Invalid ID')
  .regex(/^[a-f0-9]{24}$/i, 'Invalid ID format');

const reportFiltersBase = z.object({
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
});

const reportFiltersQuery = reportFiltersBase.refine(
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

export const getQuranWeeklySupervisionValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranSupervisionReportValidation = z.object({
  query: reportFiltersQuery,
});

export const getQuranUstadSummaryValidation = z.object({
  query: reportFiltersQuery,
});

const extendedReportQuery = reportFiltersBase
  .extend({
    groupBy: z.enum(['day', 'week', 'month']).optional(),
    granularity: z.enum(['day', 'week', 'month']).optional(),
    testType: z.enum(['all', 'new', 'recent', 'older']).optional(),
    metric: z.enum(['tanbih', 'fath', 'total', 'completion_rate']).optional(),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    surahNumber: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    juzNumber: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    minTests: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
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

export const getTestTypeAnalysisValidation = z.object({ query: extendedReportQuery });
export const getTimeAnalysisValidation = z.object({ query: extendedReportQuery });
export const getSurahAnalysisValidation = z.object({ query: extendedReportQuery });
export const getJuzAnalysisValidation = z.object({ query: extendedReportQuery });
export const getPerformersValidation = z.object({ query: extendedReportQuery });
export const getSupervisionDetailedValidation = z.object({ query: extendedReportQuery });

export const getStudentTrendValidation = z.object({
  params: z.object({ studentId: mongoIdSchema }),
  query: extendedReportQuery,
});
export const getStudentContentValidation = z.object({
  params: z.object({ studentId: mongoIdSchema }),
  query: extendedReportQuery,
});

const consistencyReportQuery = reportFiltersBase
  .extend({
    minEntries: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
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

export const getConsistencyReportValidation = z.object({
  query: consistencyReportQuery,
});

export const getProgressReportValidation = z.object({
  query: reportFiltersQuery,
});

const comparativeReportQuery = reportFiltersBase
  .extend({
    compareBy: z.enum(['class', 'supervision', 'all']).optional(),
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

export const getComparativeReportValidation = z.object({
  query: comparativeReportQuery,
});

const alertsReportQuery = z
  .object({
    class: z.string().optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical', 'all']).optional(),
    limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
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
  );

export const getAlertsReportValidation = z.object({
  query: alertsReportQuery,
});
