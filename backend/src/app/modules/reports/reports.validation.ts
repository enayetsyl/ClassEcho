// src/app/modules/reports/reports.validation.ts

import { z } from 'zod';

const dateRangeValidation = z.object({
  query: z.object({
    dateFrom: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateFrom' }),
    dateTo: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateTo' }),
  }),
});

export const getStatusDistributionValidation = dateRangeValidation;

export const getTurnaroundTimeValidation = dateRangeValidation;

export const getTeacherPerformanceValidation = dateRangeValidation;

export const getReviewerProductivityValidation = dateRangeValidation;

export const getSubjectAnalyticsValidation = dateRangeValidation;

export const getClassAnalyticsValidation = dateRangeValidation;

export const getLanguageReviewComplianceValidation = dateRangeValidation;

export const getTimeTrendsValidation = z.object({
  query: z.object({
    period: z.enum(['daily', 'weekly', 'monthly']).optional(),
    dateFrom: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateFrom' }),
    dateTo: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateTo' }),
  }),
});

export const getOperationalEfficiencyValidation = dateRangeValidation;

export const getQualityMetricsValidation = dateRangeValidation;

export const getManagementDashboardValidation = dateRangeValidation;

export const getPendingVideosValidation = dateRangeValidation;

