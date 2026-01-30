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
function getReportFiltersExtended(req) {
    const query = req.query;
    const base = getReportFilters(req);
    const result = Object.assign({}, base);
    if (query.groupBy === 'day' || query.groupBy === 'week' || query.groupBy === 'month')
        result.groupBy = query.groupBy;
    if (query.granularity === 'day' || query.granularity === 'week' || query.granularity === 'month')
        result.granularity = query.granularity;
    if (query.testType === 'all' || query.testType === 'new' || query.testType === 'recent' || query.testType === 'older')
        result.testType = query.testType;
    if (query.metric === 'tanbih' || query.metric === 'fath' || query.metric === 'total' || query.metric === 'completion_rate')
        result.metric = query.metric;
    if (query.limit)
        result.limit = parseInt(query.limit, 10) || 10;
    if (query.surahNumber)
        result.surahNumber = parseInt(query.surahNumber, 10);
    if (query.juzNumber)
        result.juzNumber = parseInt(query.juzNumber, 10);
    if (query.minTests)
        result.minTests = parseInt(query.minTests, 10);
    return result;
}
function getConsistencyFilters(req) {
    const base = getReportFilters(req);
    const query = req.query;
    const result = Object.assign({}, base);
    if (query.minEntries)
        result.minEntries = parseInt(query.minEntries, 10) || 4;
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
const getTestTypeAnalysis = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getTestTypeAnalysisReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Test type analysis retrieved successfully', data });
}));
const getTimeAnalysis = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getTimeAnalysisReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Time analysis retrieved successfully', data });
}));
const getStudentTrend = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getStudentTrendReport(studentId, filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Student trend retrieved successfully', data });
}));
const getStudentContent = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getStudentContentReport(studentId, filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Student content analysis retrieved successfully', data });
}));
const getSurahAnalysis = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getSurahAnalysisReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Surah analysis retrieved successfully', data });
}));
const getJuzAnalysis = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getJuzAnalysisReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Juz analysis retrieved successfully', data });
}));
const getPerformers = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getPerformersReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Performers report retrieved successfully', data });
}));
const getSupervisionDetailed = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFiltersExtended(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getSupervisionDetailedReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Supervision detailed report retrieved successfully', data });
}));
const getConsistencyReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getConsistencyFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getConsistencyReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Consistency report retrieved successfully', data });
}));
const getProgressReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getReportFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getProgressReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Progress report retrieved successfully', data });
}));
function getComparativeFilters(req) {
    const base = getReportFilters(req);
    const query = req.query;
    const result = Object.assign({}, base);
    if (query.compareBy === 'class' || query.compareBy === 'supervision' || query.compareBy === 'all') {
        result.compareBy = query.compareBy;
    }
    return result;
}
const getComparativeReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getComparativeFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getComparativeReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Comparative report retrieved successfully', data });
}));
function getAlertsFilters(req) {
    const query = req.query;
    const result = {};
    if (query.class)
        result.class = query.class;
    if (query.riskLevel === 'low' || query.riskLevel === 'medium' || query.riskLevel === 'high' || query.riskLevel === 'critical' || query.riskLevel === 'all') {
        result.riskLevel = query.riskLevel;
    }
    if (query.limit)
        result.limit = parseInt(query.limit, 10) || 20;
    if (query.startDate)
        result.startDate = query.startDate;
    if (query.endDate)
        result.endDate = query.endDate;
    return result;
}
const getAlertsReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getAlertsFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getAlertsReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Alerts report retrieved successfully', data });
}));
function getClassAnalyticsFilters(req) {
    const query = req.query;
    const result = {};
    if (query.startDate)
        result.startDate = query.startDate;
    if (query.endDate)
        result.endDate = query.endDate;
    if (query.classes) {
        result.classes = query.classes.split(',').map((c) => c.trim()).filter(Boolean);
    }
    if (query.compareWithPrevious === 'true')
        result.compareWithPrevious = true;
    if (query.compareWithPrevious === 'false')
        result.compareWithPrevious = false;
    return result;
}
const getClassAnalyticsReport = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = getClassAnalyticsFilters(req);
    const data = yield quran_reports_service_1.QuranReportsServices.getClassAnalyticsReport(filters);
    (0, send_response_1.default)(res, { statusCode: 200, success: true, message: 'Class analytics report retrieved successfully', data });
}));
exports.QuranReportsControllers = {
    getOverallReport,
    getWeeklySummary,
    getWeeklySupervisionReport,
    getClassBreakdown,
    getStudentReport,
    getSupervisionReport,
    getUstadSummary,
    getTestTypeAnalysis,
    getTimeAnalysis,
    getStudentTrend,
    getStudentContent,
    getSurahAnalysis,
    getJuzAnalysis,
    getPerformers,
    getSupervisionDetailed,
    getConsistencyReport,
    getProgressReport,
    getComparativeReport,
    getAlertsReport,
    getClassAnalyticsReport,
};
