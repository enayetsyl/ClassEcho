import { z } from 'zod';

export const createClassValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Class name is required',
      invalid_type_error: 'Class name must be a string',
    }).min(1, 'Class name cannot be empty'),
  }),
});

export const updateClassValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Class name is required',
      invalid_type_error: 'Class name must be a string',
    }).min(1, 'Class name cannot be empty'),
  }),
});
