"use strict";
// src/app/modules/quran/student/quran-student.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateQuranStudentsValidation = exports.listQuranStudentsValidation = exports.quranStudentIdParam = exports.updateQuranStudentValidation = exports.createQuranStudentValidation = void 0;
const zod_1 = require("zod");
const mongoIdSchema = zod_1.z
    .string()
    .length(24, 'Invalid student ID')
    .regex(/^[a-f0-9]{24}$/i, 'Invalid student ID format');
exports.createQuranStudentValidation = zod_1.z.object({
    body: zod_1.z.object({
        studentId: zod_1.z.number().int().positive('Student ID must be a positive integer'),
        nameEn: zod_1.z.string().min(1, 'English name is required').max(100),
        nameBn: zod_1.z.string().max(100).optional(),
        class: zod_1.z.string().min(1, 'Class is required').max(50),
        supervision: zod_1.z.boolean().default(false),
        active: zod_1.z.boolean().default(true),
        notes: zod_1.z.string().max(500).optional(),
        photo: zod_1.z.string().url('Must be a valid URL').max(500).optional().or(zod_1.z.literal('')),
    }),
});
exports.updateQuranStudentValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: mongoIdSchema,
    }),
    body: zod_1.z.object({
        studentId: zod_1.z.number().int().positive().optional(),
        nameEn: zod_1.z.string().min(1).max(100).optional(),
        nameBn: zod_1.z.string().max(100).optional(),
        class: zod_1.z.string().min(1).max(50).optional(),
        supervision: zod_1.z.boolean().optional(),
        active: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().max(500).optional(),
        photo: zod_1.z.string().url().max(500).optional().or(zod_1.z.literal('')),
    }),
});
exports.quranStudentIdParam = zod_1.z.object({
    params: zod_1.z.object({
        id: mongoIdSchema,
    }),
});
exports.listQuranStudentsValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        class: zod_1.z.string().optional(),
        supervision: zod_1.z.enum(['true', 'false']).optional(),
        active: zod_1.z.enum(['true', 'false']).optional(),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
exports.bulkCreateQuranStudentsValidation = zod_1.z.object({
    body: zod_1.z.object({
        students: zod_1.z.array(zod_1.z.object({
            studentId: zod_1.z.number().int().positive(),
            nameEn: zod_1.z.string().min(1).max(100),
            nameBn: zod_1.z.string().max(100).optional(),
            class: zod_1.z.string().min(1).max(50),
            supervision: zod_1.z.boolean().default(false),
            active: zod_1.z.boolean().default(true),
            notes: zod_1.z.string().max(500).optional(),
            photo: zod_1.z.string().url().max(500).optional().or(zod_1.z.literal('')),
        })),
    }),
});
