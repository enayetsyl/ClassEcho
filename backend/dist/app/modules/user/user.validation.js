"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = exports.addTeacherValidation = void 0;
const zod_1 = require("zod");
// For adding a new teacher
exports.addTeacherValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        email: zod_1.z.string().email('Valid email required'),
        phone: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.string().optional(),
    }),
});
// For updating own profile
exports.updateProfileValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').optional(),
        phone: zod_1.z.string().optional(),
        dateOfBirth: zod_1.z.string().optional(),
        profileImageUrl: zod_1.z.string().url('Must be a valid URL').optional(),
    }),
});
