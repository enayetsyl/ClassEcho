// src/app/modules/quran/reports/quran-reports.routes.ts

import express from 'express';
import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import { UserRole } from '../../user/user.type';
import {
  getQuranOverallReportValidation,
  getQuranWeeklySummaryValidation,
  getQuranWeeklySupervisionValidation,
  getQuranClassBreakdownValidation,
  getQuranStudentReportValidation,
  getQuranSupervisionReportValidation,
  getQuranUstadSummaryValidation,
} from './quran-reports.validation';
import { QuranReportsControllers } from './quran-reports.controller';

const reportRoles: UserRole[] = ['Admin', 'SeniorAdmin', 'Management'];

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
  '/weekly-supervision',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQuranWeeklySupervisionValidation),
  QuranReportsControllers.getWeeklySupervisionReport,
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
  requireRole([...reportRoles, 'Teacher' as UserRole]),
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
