"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubjectValidation = exports.createSubjectValidation = void 0;
const zod_1 = require("zod");
exports.createSubjectValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Subject name is required',
            invalid_type_error: 'Subject name must be a string',
        }).min(1, 'Subject name cannot be empty'),
    }),
});
exports.updateSubjectValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Subject name is required',
            invalid_type_error: 'Subject name must be a string',
        }).min(1, 'Subject name cannot be empty'),
    }),
});
