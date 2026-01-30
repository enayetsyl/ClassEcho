// src/app/modules/quran/student/quran-student.routes.ts

import express from 'express';
import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import {
  createQuranStudentValidation,
  updateQuranStudentValidation,
  quranStudentIdParam,
  listQuranStudentsValidation,
  bulkCreateQuranStudentsValidation,
} from './quran-student.validation';
import { QuranStudentControllers } from './quran-student.controller';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher', 'Management']),
  validateRequest(listQuranStudentsValidation),
  QuranStudentControllers.listStudents,
);

router.get(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Teacher', 'Management']),
  validateRequest(quranStudentIdParam),
  QuranStudentControllers.getStudentById,
);

router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createQuranStudentValidation),
  QuranStudentControllers.createStudent,
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateQuranStudentValidation),
  QuranStudentControllers.updateStudent,
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(quranStudentIdParam),
  QuranStudentControllers.deleteStudent,
);

router.post(
  '/bulk',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(bulkCreateQuranStudentsValidation),
  QuranStudentControllers.bulkImportStudents,
);

export const QuranStudentRoutes = router;
