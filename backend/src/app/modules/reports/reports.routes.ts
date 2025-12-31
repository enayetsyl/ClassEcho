// src/app/modules/reports/reports.routes.ts

import express from 'express';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import { ReportsControllers } from './reports.controller';

const router = express.Router();

// Get teacher performance metrics
router.get(
  '/teachers/performance',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  ReportsControllers.getTeacherPerformanceMetrics
);

// Get teacher performance summary
router.get(
  '/teachers/summary',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  ReportsControllers.getTeacherPerformanceSummary
);

// Get teacher activity by subject
router.get(
  '/teachers/:teacherId/activity/subjects',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  ReportsControllers.getTeacherActivityBySubject
);

// Get teacher activity by class
router.get(
  '/teachers/:teacherId/activity/classes',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  ReportsControllers.getTeacherActivityByClass
);

export const ReportsRoutes = router;

