"use strict";
// src/app/modules/quran/reports/quran-reports.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuranUstadSummaryValidation = exports.getQuranSupervisionReportValidation = exports.getQuranWeeklySupervisionValidation = exports.getQuranStudentReportValidation = exports.getQuranClassBreakdownValidation = exports.getQuranWeeklySummaryValidation = exports.getQuranOverallReportValidation = void 0;
const zod_1 = require("zod");
const mongoIdSchema = zod_1.z
    .string()
    .length(24, 'Invalid ID')
    .regex(/^[a-f0-9]{24}$/i, 'Invalid ID format');
const reportFiltersQuery = zod_1.z
    .object({
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
})
    .refine((data) => {
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
