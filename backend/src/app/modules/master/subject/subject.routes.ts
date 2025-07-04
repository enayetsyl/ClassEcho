import express from 'express';
import { SubjectControllers } from './subject.controller';
import {
  createSubjectValidation,
  updateSubjectValidation,
} from './subject.validation';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import validateRequest from '../../../middlewares/validate-request';


const router = express.Router();

// List all subjects
router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  SubjectControllers.getAllSubjects
);

// Create a new subject
router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createSubjectValidation),
  SubjectControllers.createSubject
);

// Rename (update) a subject
router.put(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateSubjectValidation),
  SubjectControllers.updateSubject
);

// (Optionally) Delete a subject
router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  SubjectControllers.deleteSubject
);

export const SubjectRoutes = router;
