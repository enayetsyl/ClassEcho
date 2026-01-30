// src/app/modules/quran/reports/quran-reports.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { pickFields } from '../../../utils/pick';
import { QuranReportsServices } from './quran-reports.service';
import { TQuranReportFilters, TQuranReportFiltersExtended } from './quran-reports.type';

function getReportFilters(req: Request): TQuranReportFilters {
  const query = req.query as Record<string, string | undefined>;
  const filters = pickFields(query, ['startDate', 'endDate', 'class', 'supervision', 'studentId']);
  const result: TQuranReportFilters = { ...filters };
  if (query.supervision === 'true') result.supervision = true;
  if (query.supervision === 'false') result.supervision = false;
  return result;
}

function getReportFiltersExtended(req: Request): TQuranReportFiltersExtended {
  const query = req.query as Record<string, string | undefined>;
  const base = getReportFilters(req);
  const result = { ...base } as TQuranReportFiltersExtended;
  if (query.groupBy === 'day' || query.groupBy === 'week' || query.groupBy === 'month') result.groupBy = query.groupBy;
  if (query.granularity === 'day' || query.granularity === 'week' || query.granularity === 'month') result.granularity = query.granularity;
  if (query.testType === 'all' || query.testType === 'new' || query.testType === 'recent' || query.testType === 'older') result.testType = query.testType;
  if (query.metric === 'tanbih' || query.metric === 'fath' || query.metric === 'total' || query.metric === 'completion_rate') result.metric = query.metric;
  if (query.limit) result.limit = parseInt(query.limit, 10) || 10;
  if (query.surahNumber) result.surahNumber = parseInt(query.surahNumber, 10);
  if (query.juzNumber) result.juzNumber = parseInt(query.juzNumber, 10);
  if (query.minTests) result.minTests = parseInt(query.minTests, 10);
  return result;
}

const getOverallReport = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getOverallReport(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran overall report retrieved successfully',
    data,
  });
});

const getWeeklySummary = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getWeeklySummary(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran weekly summary retrieved successfully',
    data,
  });
});

const getWeeklySupervisionReport = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getWeeklySupervisionComparison(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran weekly supervision comparison retrieved successfully',
    data,
  });
});

const getClassBreakdown = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getClassBreakdown(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran class breakdown retrieved successfully',
    data,
  });
});

const getStudentReport = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getStudentReport(studentId, filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran student report retrieved successfully',
    data,
  });
});

const getSupervisionReport = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getSupervisionComparison(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran supervision comparison retrieved successfully',
    data,
  });
});

const getUstadSummary = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFilters(req);
  const data = await QuranReportsServices.getUstadSummary(filters);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran Ustad summary retrieved successfully',
    data,
  });
});

const getTestTypeAnalysis = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getTestTypeAnalysisReport(filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Test type analysis retrieved successfully', data });
});

const getTimeAnalysis = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getTimeAnalysisReport(filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Time analysis retrieved successfully', data });
});

const getStudentTrend = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getStudentTrendReport(studentId, filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Student trend retrieved successfully', data });
});

const getStudentContent = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getStudentContentReport(studentId, filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Student content analysis retrieved successfully', data });
});

const getSurahAnalysis = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getSurahAnalysisReport(filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Surah analysis retrieved successfully', data });
});

const getJuzAnalysis = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getJuzAnalysisReport(filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Juz analysis retrieved successfully', data });
});

const getPerformers = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getPerformersReport(filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Performers report retrieved successfully', data });
});

const getSupervisionDetailed = catchAsync(async (req: Request, res: Response) => {
  const filters = getReportFiltersExtended(req);
  const data = await QuranReportsServices.getSupervisionDetailedReport(filters);
  sendResponse(res, { statusCode: 200, success: true, message: 'Supervision detailed report retrieved successfully', data });
});

export const QuranReportsControllers = {
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
};
