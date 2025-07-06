"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSectionValidation = exports.createSectionValidation = void 0;
const zod_1 = require("zod");
exports.createSectionValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Section name is required',
            invalid_type_error: 'Section name must be a string',
        }).min(1, 'Section name cannot be empty'),
    }),
});
exports.updateSectionValidation = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({
            required_error: 'Section name is required',
            invalid_type_error: 'Section name must be a string',
        }).min(1, 'Section name cannot be empty'),
    }),
});
