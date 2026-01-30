// src/app/modules/quran/reports/quran-reports.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { pickFields } from '../../../utils/pick';
import { QuranReportsServices } from './quran-reports.service';
import { TQuranReportFilters } from './quran-reports.type';

function getReportFilters(req: Request): TQuranReportFilters {
  const query = req.query as Record<string, string | undefined>;
  const filters = pickFields(query, ['startDate', 'endDate', 'class', 'supervision', 'studentId']);
  const result: TQuranReportFilters = { ...filters };
  if (query.supervision === 'true') result.supervision = true;
  if (query.supervision === 'false') result.supervision = false;
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

export const QuranReportsControllers = {
  getOverallReport,
  getWeeklySummary,
  getWeeklySupervisionReport,
  getClassBreakdown,
  getStudentReport,
  getSupervisionReport,
  getUstadSummary,
};
