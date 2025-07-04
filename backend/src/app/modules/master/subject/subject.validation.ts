import { z } from 'zod';

export const createSubjectValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Subject name is required',
      invalid_type_error: 'Subject name must be a string',
    }).min(1, 'Subject name cannot be empty'),
  }),
});

export const updateSubjectValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Subject name is required',
      invalid_type_error: 'Subject name must be a string',
    }).min(1, 'Subject name cannot be empty'),
  }),
});
