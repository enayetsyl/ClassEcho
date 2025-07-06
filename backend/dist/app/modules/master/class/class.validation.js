"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassValidation = exports.createClassValidation = void 0;
const zod_1 = require("zod");
exports.createClassValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Class name is required',
            invalid_type_error: 'Class name must be a string',
        }).min(1, 'Class name cannot be empty'),
    }),
});
exports.updateClassValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Class name is required',
            invalid_type_error: 'Class name must be a string',
        }).min(1, 'Class name cannot be empty'),
    }),
});
