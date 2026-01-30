"use strict";
// src/app/modules/quran/entry/quran-entry.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateQuranEntriesValidation = exports.listQuranEntriesValidation = exports.quranEntryStudentIdParam = exports.quranEntryIdParam = exports.updateQuranEntryValidation = exports.createQuranEntryValidation = void 0;
const zod_1 = require("zod");
const mongoIdSchema = zod_1.z
    .string()
    .length(24, 'Invalid ID')
    .regex(/^[a-f0-9]{24}$/i, 'Invalid ID format');
const testSchema = zod_1.z.object({
    given: zod_1.z.boolean(),
    tanbih: zod_1.z.number().int().min(0).default(0),
    fath: zod_1.z.number().int().min(0).default(0),
    note: zod_1.z.string().max(500).optional(),
});
const tajweedNotesSchema = zod_1.z.object({
    harf: zod_1.z.string().max(500).optional(),
    ghunna: zod_1.z.string().max(500).optional(),
    madd: zod_1.z.string().max(500).optional(),
    other: zod_1.z.string().max(500).optional(),
});
exports.createQuranEntryValidation = zod_1.z.object({
    body: zod_1.z.object({
        studentId: mongoIdSchema,
        reportDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
        newTest: testSchema.optional(),
        recentTest: testSchema.optional(),
        olderTest: testSchema.optional(),
        tajweedNotes: tajweedNotesSchema.optional(),
        generalNote: zod_1.z.string().max(1000).optional(),
        ustadName: zod_1.z.string().max(100).optional(),
        signature: zod_1.z.string().max(100).optional(),
    }),
});
exports.updateQuranEntryValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: mongoIdSchema,
    }),
    body: zod_1.z.object({
        newTest: testSchema.optional(),
        recentTest: testSchema.optional(),
        olderTest: testSchema.optional(),
        tajweedNotes: tajweedNotesSchema.optional(),
        generalNote: zod_1.z.string().max(1000).optional(),
        ustadName: zod_1.z.string().max(100).optional(),
        signature: zod_1.z.string().max(100).optional(),
    }),
});
exports.quranEntryIdParam = zod_1.z.object({
    params: zod_1.z.object({
        id: mongoIdSchema,
    }),
});
exports.quranEntryStudentIdParam = zod_1.z.object({
    params: zod_1.z.object({
        studentId: mongoIdSchema,
    }),
});
exports.listQuranEntriesValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        studentId: mongoIdSchema.optional(),
        class: zod_1.z.string().optional(),
        supervision: zod_1.z.enum(['true', 'false']).optional(),
        startDate: zod_1.z
            .string()
            .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Invalid date' })
            .optional(),
        endDate: zod_1.z
            .string()
            .refine((v) => !v || !isNaN(Date.parse(v)), { message: 'Invalid date' })
            .optional(),
        ustadName: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
const createEntryBodySchema = zod_1.z.object({
    studentId: mongoIdSchema,
    reportDate: zod_1.z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
    newTest: testSchema.optional(),
    recentTest: testSchema.optional(),
    olderTest: testSchema.optional(),
    tajweedNotes: tajweedNotesSchema.optional(),
    generalNote: zod_1.z.string().max(1000).optional(),
    ustadName: zod_1.z.string().max(100).optional(),
    signature: zod_1.z.string().max(100).optional(),
});
exports.bulkCreateQuranEntriesValidation = zod_1.z.object({
    body: zod_1.z.object({
        entries: zod_1.z.array(createEntryBodySchema),
    }),
});
