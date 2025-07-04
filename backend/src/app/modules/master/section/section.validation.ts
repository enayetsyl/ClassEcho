import { z } from 'zod';

export const createSectionValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Section name is required',
      invalid_type_error: 'Section name must be a string',
    }).min(1, 'Section name cannot be empty'),
  }),
});

export const updateSectionValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Section name is required',
      invalid_type_error: 'Section name must be a string',
    }).min(1, 'Section name cannot be empty'),
  }),
});
