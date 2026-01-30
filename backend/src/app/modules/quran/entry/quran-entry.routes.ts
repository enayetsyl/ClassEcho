// src/app/modules/quran/entry/quran-entry.routes.ts

import express from 'express';
import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import {
  createQuranEntryValidation,
  updateQuranEntryValidation,
  quranEntryIdParam,
  quranEntryStudentIdParam,
  listQuranEntriesValidation,
  bulkCreateQuranEntriesValidation,
} from './quran-entry.validation';
import { QuranEntryControllers } from './quran-entry.controller';

const router = express.Router();

// Must be before /:id so "student" is not parsed as id
router.get(
  '/student/:studentId',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher', 'Management']),
  validateRequest(quranEntryStudentIdParam),
  QuranEntryControllers.getEntriesByStudent,
);

router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher', 'Management']),
  validateRequest(listQuranEntriesValidation),
  QuranEntryControllers.listEntries,
);

router.get(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher', 'Management']),
  validateRequest(quranEntryIdParam),
  QuranEntryControllers.getEntryById,
);

router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher']),
  validateRequest(createQuranEntryValidation),
  QuranEntryControllers.createEntry,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher']),
  validateRequest(updateQuranEntryValidation),
  QuranEntryControllers.updateEntry,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(quranEntryIdParam),
  QuranEntryControllers.deleteEntry,
);

router.post(
  '/bulk',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(bulkCreateQuranEntriesValidation),
  QuranEntryControllers.bulkImportEntries,
);

export const QuranEntryRoutes = router;
