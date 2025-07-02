"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidation = exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = void 0;
const zod_1 = require("zod");
// Login validation
exports.loginValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Valid email required'),
        password: zod_1.z.string().min(1, 'Password required'),
    }),
});
// Forgot password validation
exports.forgotPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Valid email required'),
    }),
});
// Reset password validation
exports.resetPasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Reset token is required'),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
// Change password validation (for logged-in users)
exports.changePasswordValidation = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string().optional(),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
