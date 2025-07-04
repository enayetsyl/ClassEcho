import express from 'express';
import { ClassControllers } from './class.controller';

import {
  createClassValidation,
  updateClassValidation,
} from './class.validation';

import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';

const router = express.Router();

// List all classes
router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  ClassControllers.getAllClasses
);

// Create a new class
router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createClassValidation),
  ClassControllers.createClass
);

// Rename (update) a class
router.put(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateClassValidation),
  ClassControllers.updateClass
);

// (Optionally) Delete a class
router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  ClassControllers.deleteClass
);

export const ClassRoutes = router;
