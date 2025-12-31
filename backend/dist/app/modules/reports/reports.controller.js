"use strict";
// src/app/modules/reports/reports.controller.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsControllers = void 0;
const catch_async_1 = __importDefault(require("../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../utils/send-response"));
const reports_service_1 = require("./reports.service");
const pick_1 = require("../../utils/pick");
const getStatusDistribution = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getStatusDistribution(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Status distribution retrieved successfully',
        data: result,
    });
}));
const getTurnaroundTime = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getTurnaroundTime(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Turnaround time report retrieved successfully',
        data: result,
    });
}));
const getTeacherPerformance = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getTeacherPerformance(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Teacher performance report retrieved successfully',
        data: result,
    });
}));
const getReviewerProductivity = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getReviewerProductivity(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Reviewer productivity report retrieved successfully',
        data: result,
    });
}));
const getSubjectAnalytics = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getSubjectAnalytics(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Subject analytics retrieved successfully',
        data: result,
    });
}));
const getClassAnalytics = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getClassAnalytics(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Class analytics retrieved successfully',
        data: result,
    });
}));
const getLanguageReviewCompliance = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getLanguageReviewCompliance(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Language review compliance report retrieved successfully',
        data: result,
    });
}));
const getTimeTrends = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const period = req.query.period || 'monthly';
    const result = yield reports_service_1.ReportsServices.getTimeTrends(period, filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Time trends report retrieved successfully',
        data: result,
    });
}));
const getOperationalEfficiency = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getOperationalEfficiency(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Operational efficiency report retrieved successfully',
        data: result,
    });
}));
const getQualityMetrics = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getQualityMetrics(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quality metrics retrieved successfully',
        data: result,
    });
}));
const getManagementDashboard = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.pickFields)(req.query, ['dateFrom', 'dateTo']);
    const result = yield reports_service_1.ReportsServices.getManagementDashboard(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Management dashboard data retrieved successfully',
        data: result,
    });
}));
exports.ReportsControllers = {
    getStatusDistribution,
    getTurnaroundTime,
    getTeacherPerformance,
    getReviewerProductivity,
    getSubjectAnalytics,
    getClassAnalytics,
    getLanguageReviewCompliance,
    getTimeTrends,
    getOperationalEfficiency,
    getQualityMetrics,
    getManagementDashboard,
};
