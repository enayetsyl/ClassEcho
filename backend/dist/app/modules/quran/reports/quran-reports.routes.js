"use strict";
// src/app/modules/quran/reports/quran-reports.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranReportsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const quran_reports_validation_1 = require("./quran-reports.validation");
const quran_reports_controller_1 = require("./quran-reports.controller");
const reportRoles = ['Admin', 'SeniorAdmin', 'Management'];
const router = express_1.default.Router();
router.get('/overall', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(quran_reports_validation_1.getQuranOverallReportValidation), quran_reports_controller_1.QuranReportsControllers.getOverallReport);
router.get('/weekly-summary', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(quran_reports_validation_1.getQuranWeeklySummaryValidation), quran_reports_controller_1.QuranReportsControllers.getWeeklySummary);
router.get('/weekly-supervision', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(quran_reports_validation_1.getQuranWeeklySupervisionValidation), quran_reports_controller_1.QuranReportsControllers.getWeeklySupervisionReport);
router.get('/class-breakdown', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(quran_reports_validation_1.getQuranClassBreakdownValidation), quran_reports_controller_1.QuranReportsControllers.getClassBreakdown);
router.get('/student/:studentId', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)([...reportRoles, 'Teacher']), (0, validate_request_1.default)(quran_reports_validation_1.getQuranStudentReportValidation), quran_reports_controller_1.QuranReportsControllers.getStudentReport);
router.get('/supervision', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(quran_reports_validation_1.getQuranSupervisionReportValidation), quran_reports_controller_1.QuranReportsControllers.getSupervisionReport);
router.get('/ustad-summary', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(reportRoles), (0, validate_request_1.default)(quran_reports_validation_1.getQuranUstadSummaryValidation), quran_reports_controller_1.QuranReportsControllers.getUstadSummary);
exports.QuranReportsRoutes = router;
