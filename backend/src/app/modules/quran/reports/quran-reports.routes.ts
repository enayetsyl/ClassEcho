// src/app/modules/quran/reports/quran-reports.routes.ts

import express from 'express';
import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import {
  getQuranOverallReportValidation,
  getQuranWeeklySummaryValidation,
  getQuranClassBreakdownValidation,
  getQuranStudentReportValidation,
  getQuranSupervisionReportValidation,
  getQuranUstadSummaryValidation,
} from './quran-reports.validation';
import { QuranReportsControllers } from './quran-reports.controller';

const reportRoles = ['Admin', 'SeniorAdmin', 'Management'];

const router = express.Router();

router.get(
  '/overall',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQuranOverallReportValidation),
  QuranReportsControllers.getOverallReport,
);

router.get(
  '/weekly-summary',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQuranWeeklySummaryValidation),
  QuranReportsControllers.getWeeklySummary,
);

router.get(
  '/class-breakdown',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQuranClassBreakdownValidation),
  QuranReportsControllers.getClassBreakdown,
);

router.get(
  '/student/:studentId',
  requireAuth,
  requireRole([...reportRoles, 'Teacher']),
  validateRequest(getQuranStudentReportValidation),
  QuranReportsControllers.getStudentReport,
);

router.get(
  '/supervision',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQuranSupervisionReportValidation),
  QuranReportsControllers.getSupervisionReport,
);

router.get(
  '/ustad-summary',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQuranUstadSummaryValidation),
  QuranReportsControllers.getUstadSummary,
);

export const QuranReportsRoutes = router;
