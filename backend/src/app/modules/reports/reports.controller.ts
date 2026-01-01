// src/app/modules/reports/reports.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { ReportsServices } from './reports.service';
import { pickFields } from '../../utils/pick';

const getStatusDistribution = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getStatusDistribution(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Status distribution retrieved successfully',
    data: result,
  });
});

const getTurnaroundTime = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getTurnaroundTime(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Turnaround time report retrieved successfully',
    data: result,
  });
});

const getTeacherPerformance = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getTeacherPerformance(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher performance report retrieved successfully',
    data: result,
  });
});

const getReviewerProductivity = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getReviewerProductivity(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviewer productivity report retrieved successfully',
    data: result,
  });
});

const getSubjectAnalytics = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getSubjectAnalytics(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject analytics retrieved successfully',
    data: result,
  });
});

const getClassAnalytics = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getClassAnalytics(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class analytics retrieved successfully',
    data: result,
  });
});

const getLanguageReviewCompliance = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getLanguageReviewCompliance(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Language review compliance report retrieved successfully',
    data: result,
  });
});

const getTimeTrends = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly';
  const result = await ReportsServices.getTimeTrends(period, filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Time trends report retrieved successfully',
    data: result,
  });
});

const getOperationalEfficiency = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getOperationalEfficiency(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Operational efficiency report retrieved successfully',
    data: result,
  });
});

const getQualityMetrics = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getQualityMetrics(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quality metrics retrieved successfully',
    data: result,
  });
});

const getManagementDashboard = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getManagementDashboard(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Management dashboard data retrieved successfully',
    data: result,
  });
});

const getPendingVideos = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, ['dateFrom', 'dateTo']);
  const result = await ReportsServices.getPendingVideos(filters);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Pending videos report retrieved successfully',
    data: result,
  });
});

export const ReportsControllers = {
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
  getPendingVideos,
};
