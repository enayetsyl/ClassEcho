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
  getTestTypeAnalysisValidation,
  getTimeAnalysisValidation,
  getStudentTrendValidation,
  getStudentContentValidation,
  getSurahAnalysisValidation,
  getJuzAnalysisValidation,
  getPerformersValidation,
  getSupervisionDetailedValidation,
  getConsistencyReportValidation,
  getProgressReportValidation,
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

router.get(
  '/test-type-analysis',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getTestTypeAnalysisValidation),
  QuranReportsControllers.getTestTypeAnalysis,
);
router.get(
  '/time-analysis',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getTimeAnalysisValidation),
  QuranReportsControllers.getTimeAnalysis,
);
router.get(
  '/student-trend/:studentId',
  requireAuth,
  requireRole([...reportRoles, 'Teacher' as UserRole]),
  validateRequest(getStudentTrendValidation),
  QuranReportsControllers.getStudentTrend,
);
router.get(
  '/student-content/:studentId',
  requireAuth,
  requireRole([...reportRoles, 'Teacher' as UserRole]),
  validateRequest(getStudentContentValidation),
  QuranReportsControllers.getStudentContent,
);
router.get(
  '/surah-analysis',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getSurahAnalysisValidation),
  QuranReportsControllers.getSurahAnalysis,
);
router.get(
  '/juz-analysis',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getJuzAnalysisValidation),
  QuranReportsControllers.getJuzAnalysis,
);
router.get(
  '/performers',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getPerformersValidation),
  QuranReportsControllers.getPerformers,
);
router.get(
  '/supervision-detailed',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getSupervisionDetailedValidation),
  QuranReportsControllers.getSupervisionDetailed,
);

router.get(
  '/consistency',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getConsistencyReportValidation),
  QuranReportsControllers.getConsistencyReport,
);

router.get(
  '/progress',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getProgressReportValidation),
  QuranReportsControllers.getProgressReport,
);

export const QuranReportsRoutes = router;
