// src/app/modules/reports/reports.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { ReportsServices } from './reports.service';
import { pickFields } from '../../../utils/pick';

const getTeacherPerformanceMetrics = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, [
    'dateFrom',
    'dateTo',
    'subjectId',
    'classId',
    'minRating',
    'maxRating',
  ]);

  const metrics = await ReportsServices.getTeacherPerformanceMetrics(filters);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher performance metrics retrieved successfully',
    data: metrics,
  });
});

const getTeacherPerformanceSummary = catchAsync(async (req: Request, res: Response) => {
  const filters = pickFields(req.query, [
    'dateFrom',
    'dateTo',
    'subjectId',
    'classId',
  ]);

  const summary = await ReportsServices.getTeacherPerformanceSummary(filters);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher performance summary retrieved successfully',
    data: summary,
  });
});

const getTeacherActivityBySubject = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.params.teacherId;
  const filters = pickFields(req.query, [
    'dateFrom',
    'dateTo',
  ]);

  const activities = await ReportsServices.getTeacherActivityBySubject(teacherId, filters);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher activity by subject retrieved successfully',
    data: activities,
  });
});

const getTeacherActivityByClass = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.params.teacherId;
  const filters = pickFields(req.query, [
    'dateFrom',
    'dateTo',
  ]);

  const activities = await ReportsServices.getTeacherActivityByClass(teacherId, filters);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher activity by class retrieved successfully',
    data: activities,
  });
});

export const ReportsControllers = {
  getTeacherPerformanceMetrics,
  getTeacherPerformanceSummary,
  getTeacherActivityBySubject,
  getTeacherActivityByClass,
};

