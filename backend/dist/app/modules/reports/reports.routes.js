"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validate_request_1 = __importDefault(require("../../middlewares/validate-request"));
const auth_middleware_1 = require("../../middlewares/auth-middleware");
const reports_validation_1 = require("./reports.validation");
const reports_controller_1 = require("./reports.controller");
const router = express_1.default.Router();
// All reports are accessible to Management, SeniorAdmin, and Admin roles
const reportRoles = ['Management', 'SeniorAdmin', 'Admin'];
router.get('/status-distribution', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getStatusDistributionValidation), reports_controller_1.ReportsControllers.getStatusDistribution);
router.get('/turnaround-time', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getTurnaroundTimeValidation), reports_controller_1.ReportsControllers.getTurnaroundTime);
router.get('/teacher-performance', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getTeacherPerformanceValidation), reports_controller_1.ReportsControllers.getTeacherPerformance);
router.get('/reviewer-productivity', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getReviewerProductivityValidation), reports_controller_1.ReportsControllers.getReviewerProductivity);
router.get('/subject-analytics', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getSubjectAnalyticsValidation), reports_controller_1.ReportsControllers.getSubjectAnalytics);
router.get('/class-analytics', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getClassAnalyticsValidation), reports_controller_1.ReportsControllers.getClassAnalytics);
router.get('/language-review-compliance', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getLanguageReviewComplianceValidation), reports_controller_1.ReportsControllers.getLanguageReviewCompliance);
router.get('/time-trends', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getTimeTrendsValidation), reports_controller_1.ReportsControllers.getTimeTrends);
router.get('/operational-efficiency', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getOperationalEfficiencyValidation), reports_controller_1.ReportsControllers.getOperationalEfficiency);
router.get('/quality-metrics', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getQualityMetricsValidation), reports_controller_1.ReportsControllers.getQualityMetrics);
router.get('/dashboard', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(reports_validation_1.getManagementDashboardValidation), reports_controller_1.ReportsControllers.getManagementDashboard);
exports.ReportsRoutes = router;
