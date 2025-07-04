import express from 'express';
import { SectionControllers } from './section.controller';

import {
  createSectionValidation,
  updateSectionValidation,
} from './section.validation';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import validateRequest from '../../../middlewares/validate-request';

const router = express.Router();

// List all sections
router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  SectionControllers.getAllSections
);

// Create a new section
router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createSectionValidation),
  SectionControllers.createSection
);

// Rename (update) a section
router.put(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateSectionValidation),
  SectionControllers.updateSection
);

// (Optionally) Delete a section
router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  SectionControllers.deleteSection
);

export const SectionRoutes = router;
