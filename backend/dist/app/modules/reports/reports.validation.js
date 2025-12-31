"use strict";
// src/app/modules/reports/reports.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagementDashboardValidation = exports.getQualityMetricsValidation = exports.getOperationalEfficiencyValidation = exports.getTimeTrendsValidation = exports.getLanguageReviewComplianceValidation = exports.getClassAnalyticsValidation = exports.getSubjectAnalyticsValidation = exports.getReviewerProductivityValidation = exports.getTeacherPerformanceValidation = exports.getTurnaroundTimeValidation = exports.getStatusDistributionValidation = void 0;
const zod_1 = require("zod");
const dateRangeValidation = zod_1.z.object({
    query: zod_1.z.object({
        dateFrom: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateFrom' }),
        dateTo: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateTo' }),
    }),
});
exports.getStatusDistributionValidation = dateRangeValidation;
exports.getTurnaroundTimeValidation = dateRangeValidation;
exports.getTeacherPerformanceValidation = dateRangeValidation;
exports.getReviewerProductivityValidation = dateRangeValidation;
exports.getSubjectAnalyticsValidation = dateRangeValidation;
exports.getClassAnalyticsValidation = dateRangeValidation;
exports.getLanguageReviewComplianceValidation = dateRangeValidation;
exports.getTimeTrendsValidation = zod_1.z.object({
    query: zod_1.z.object({
        period: zod_1.z.enum(['daily', 'weekly', 'monthly']).optional(),
        dateFrom: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateFrom' }),
        dateTo: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid dateTo' }),
    }),
});
exports.getOperationalEfficiencyValidation = dateRangeValidation;
exports.getQualityMetricsValidation = dateRangeValidation;
exports.getManagementDashboardValidation = dateRangeValidation;
