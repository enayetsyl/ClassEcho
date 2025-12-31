import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../middlewares/auth-middleware';
import { UserRole } from '../user/user.type';
import {
  getStatusDistributionValidation,
  getTurnaroundTimeValidation,
  getTeacherPerformanceValidation,
  getReviewerProductivityValidation,
  getSubjectAnalyticsValidation,
  getClassAnalyticsValidation,
  getLanguageReviewComplianceValidation,
  getTimeTrendsValidation,
  getOperationalEfficiencyValidation,
  getQualityMetricsValidation,
  getManagementDashboardValidation,
} from './reports.validation';
import { ReportsControllers } from './reports.controller';

const router = express.Router();

// All reports are accessible to Management, SeniorAdmin, and Admin roles
const reportRoles: UserRole[] = ['Management', 'SeniorAdmin', 'Admin'];

router.get(
  '/status-distribution',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getStatusDistributionValidation),
  ReportsControllers.getStatusDistribution,
);

router.get(
  '/turnaround-time',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getTurnaroundTimeValidation),
  ReportsControllers.getTurnaroundTime,
);

router.get(
  '/teacher-performance',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getTeacherPerformanceValidation),
  ReportsControllers.getTeacherPerformance,
);

router.get(
  '/reviewer-productivity',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getReviewerProductivityValidation),
  ReportsControllers.getReviewerProductivity,
);

router.get(
  '/subject-analytics',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getSubjectAnalyticsValidation),
  ReportsControllers.getSubjectAnalytics,
);

router.get(
  '/class-analytics',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getClassAnalyticsValidation),
  ReportsControllers.getClassAnalytics,
);

router.get(
  '/language-review-compliance',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getLanguageReviewComplianceValidation),
  ReportsControllers.getLanguageReviewCompliance,
);

router.get(
  '/time-trends',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getTimeTrendsValidation),
  ReportsControllers.getTimeTrends,
);

router.get(
  '/operational-efficiency',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getOperationalEfficiencyValidation),
  ReportsControllers.getOperationalEfficiency,
);

router.get(
  '/quality-metrics',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getQualityMetricsValidation),
  ReportsControllers.getQualityMetrics,
);

router.get(
  '/dashboard',
  requireAuth,
  requireRole(reportRoles),
  validateRequest(getManagementDashboardValidation),
  ReportsControllers.getManagementDashboard,
);

export const ReportsRoutes = router;

