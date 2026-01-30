"use strict";
// src/app/modules/quran/reports/quran-reports.controller.ts
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
exports.QuranReportsControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const pick_1 = require("../../../utils/pick");
const quran_reports_service_1 = require("./quran-reports.service");
function getReportFilters(req) {
    const query = req.query;
    const filters = (0, pick_1.pickFields)(query, ['startDate', 'endDate', 'class', 'supervision', 'studentId']);
    const result = Object.assign({}, filters);
    if (query.supervision === 'true')
        result.supervision = true;
    if (query.supervision === 'false')
        result.supervision = false;
    return result;
}
const getOverallReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getOverallReport(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran overall report retrieved successfully',
        data,
    });
}));
const getWeeklySummary = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getWeeklySummary(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran weekly summary retrieved successfully',
        data,
    });
}));
const getWeeklySupervisionReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getWeeklySupervisionComparison(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran weekly supervision comparison retrieved successfully',
        data,
    });
}));
const getClassBreakdown = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getClassBreakdown(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran class breakdown retrieved successfully',
        data,
    });
}));
const getStudentReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getStudentReport(studentId, filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran student report retrieved successfully',
        data,
    });
}));
const getSupervisionReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getSupervisionComparison(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran supervision comparison retrieved successfully',
        data,
    });
}));
const getUstadSummary = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getUstadSummary(filters);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Quran Ustad summary retrieved successfully',
        data,
    });
}));
exports.QuranReportsControllers = {
    getOverallReport,
    getWeeklySummary,
    getWeeklySupervisionReport,
    getClassBreakdown,
    getStudentReport,
    getSupervisionReport,
    getUstadSummary,
};
