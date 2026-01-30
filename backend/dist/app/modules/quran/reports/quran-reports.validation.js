"use strict";
// src/app/modules/quran/reports/quran-reports.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassAnalyticsValidation = exports.getAlertsReportValidation = exports.getComparativeReportValidation = exports.getProgressReportValidation = exports.getConsistencyReportValidation = exports.getStudentContentValidation = exports.getStudentTrendValidation = exports.getSupervisionDetailedValidation = exports.getPerformersValidation = exports.getJuzAnalysisValidation = exports.getSurahAnalysisValidation = exports.getTimeAnalysisValidation = exports.getTestTypeAnalysisValidation = exports.getQuranUstadSummaryValidation = exports.getQuranSupervisionReportValidation = exports.getQuranWeeklySupervisionValidation = exports.getQuranStudentReportValidation = exports.getQuranClassBreakdownValidation = exports.getQuranWeeklySummaryValidation = exports.getQuranOverallReportValidation = void 0;
const zod_1 = require("zod");
const mongoIdSchema = zod_1.z
    .string()
    .length(24, 'Invalid ID')
    .regex(/^[a-f0-9]{24}$/i, 'Invalid ID format');
const reportFiltersBase = zod_1.z.object({
    startDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
    endDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
    class: zod_1.z.string().optional(),
    supervision: zod_1.z.enum(['true', 'false']).optional(),
    studentId: mongoIdSchema.optional(),
});
const reportFiltersQuery = reportFiltersBase.refine((data) => {
    if (!data.startDate || !data.endDate)
        return true;
    const start = Date.parse(data.startDate);
    const end = Date.parse(data.endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate'] });
exports.getQuranOverallReportValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
exports.getQuranWeeklySummaryValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
exports.getQuranClassBreakdownValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
exports.getQuranStudentReportValidation = zod_1.z.object({
    params: zod_1.z.object({
        studentId: mongoIdSchema,
    }),
    query: zod_1.z
        .object({
        startDate: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
        endDate: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
    })
        .refine((data) => {
        if (!data.startDate || !data.endDate)
            return true;
        const start = Date.parse(data.startDate);
        const end = Date.parse(data.endDate);
        return !isNaN(start) && !isNaN(end) && start <= end;
    }, { message: 'startDate must be before or equal to endDate', path: ['startDate'] }),
});
exports.getQuranWeeklySupervisionValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
exports.getQuranSupervisionReportValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
exports.getQuranUstadSummaryValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
const extendedReportQuery = reportFiltersBase
    .extend({
    groupBy: zod_1.z.enum(['day', 'week', 'month']).optional(),
    granularity: zod_1.z.enum(['day', 'week', 'month']).optional(),
    testType: zod_1.z.enum(['all', 'new', 'recent', 'older']).optional(),
    metric: zod_1.z.enum(['tanbih', 'fath', 'total', 'completion_rate']).optional(),
    limit: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    surahNumber: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    juzNumber: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    minTests: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
})
    .refine((data) => {
    if (!data.startDate || !data.endDate)
        return true;
    const start = Date.parse(data.startDate);
    const end = Date.parse(data.endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate'] });
exports.getTestTypeAnalysisValidation = zod_1.z.object({ query: extendedReportQuery });
exports.getTimeAnalysisValidation = zod_1.z.object({ query: extendedReportQuery });
exports.getSurahAnalysisValidation = zod_1.z.object({ query: extendedReportQuery });
exports.getJuzAnalysisValidation = zod_1.z.object({ query: extendedReportQuery });
exports.getPerformersValidation = zod_1.z.object({ query: extendedReportQuery });
exports.getSupervisionDetailedValidation = zod_1.z.object({ query: extendedReportQuery });
exports.getStudentTrendValidation = zod_1.z.object({
    params: zod_1.z.object({ studentId: mongoIdSchema }),
    query: extendedReportQuery,
});
exports.getStudentContentValidation = zod_1.z.object({
    params: zod_1.z.object({ studentId: mongoIdSchema }),
    query: extendedReportQuery,
});
const consistencyReportQuery = reportFiltersBase
    .extend({
    minEntries: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
})
    .refine((data) => {
    if (!data.startDate || !data.endDate)
        return true;
    const start = Date.parse(data.startDate);
    const end = Date.parse(data.endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate'] });
exports.getConsistencyReportValidation = zod_1.z.object({
    query: consistencyReportQuery,
});
exports.getProgressReportValidation = zod_1.z.object({
    query: reportFiltersQuery,
});
const comparativeReportQuery = reportFiltersBase
    .extend({
    compareBy: zod_1.z.enum(['class', 'supervision', 'all']).optional(),
})
    .refine((data) => {
    if (!data.startDate || !data.endDate)
        return true;
    const start = Date.parse(data.startDate);
    const end = Date.parse(data.endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate'] });
exports.getComparativeReportValidation = zod_1.z.object({
    query: comparativeReportQuery,
});
const alertsReportQuery = zod_1.z
    .object({
    class: zod_1.z.string().optional(),
    riskLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical', 'all']).optional(),
    limit: zod_1.z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
    startDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
    endDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
})
    .refine((data) => {
    if (!data.startDate || !data.endDate)
        return true;
    const start = Date.parse(data.startDate);
    const end = Date.parse(data.endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate'] });
exports.getAlertsReportValidation = zod_1.z.object({
    query: alertsReportQuery,
});
const classAnalyticsQuery = zod_1.z
    .object({
    startDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid startDate' }),
    endDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), { message: 'Invalid endDate' }),
    classes: zod_1.z.string().optional(), // comma-separated e.g. "1-5,2-6"
    compareWithPrevious: zod_1.z.enum(['true', 'false']).optional(),
})
    .refine((data) => {
    if (!data.startDate || !data.endDate)
        return true;
    const start = Date.parse(data.startDate);
    const end = Date.parse(data.endDate);
    return !isNaN(start) && !isNaN(end) && start <= end;
}, { message: 'startDate must be before or equal to endDate', path: ['startDate'] });
exports.getClassAnalyticsValidation = zod_1.z.object({
    query: classAnalyticsQuery,
});
