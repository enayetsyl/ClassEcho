// src/services/reports.service.ts

import apiClient from '@/lib/api-client';
import {
  ITeacherPerformanceMetrics,
  ITeacherPerformanceFilters,
  ITeacherActivityBySubject,
  ITeacherActivityByClass,
  ITeacherPerformanceSummary,
} from '@/types/reports.types';

/**
 * Get teacher performance metrics
 * GET /admin/reports/teachers/performance
 */
export const getTeacherPerformanceMetrics = async (
  filters?: ITeacherPerformanceFilters
): Promise<ITeacherPerformanceMetrics[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITeacherPerformanceMetrics[];
  }>('/admin/reports/teachers/performance', { params: filters });
  return res.data.data;
};

/**
 * Get teacher performance summary
 * GET /admin/reports/teachers/summary
 */
export const getTeacherPerformanceSummary = async (
  filters?: ITeacherPerformanceFilters
): Promise<ITeacherPerformanceSummary> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITeacherPerformanceSummary;
  }>('/admin/reports/teachers/summary', { params: filters });
  return res.data.data;
};

/**
 * Get teacher activity by subject
 * GET /admin/reports/teachers/:teacherId/activity/subjects
 */
export const getTeacherActivityBySubject = async (
  teacherId: string,
  filters?: Pick<ITeacherPerformanceFilters, 'dateFrom' | 'dateTo'>
): Promise<ITeacherActivityBySubject[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITeacherActivityBySubject[];
  }>(`/admin/reports/teachers/${teacherId}/activity/subjects`, { params: filters });
  return res.data.data;
};

/**
 * Get teacher activity by class
 * GET /admin/reports/teachers/:teacherId/activity/classes
 */
export const getTeacherActivityByClass = async (
  teacherId: string,
  filters?: Pick<ITeacherPerformanceFilters, 'dateFrom' | 'dateTo'>
): Promise<ITeacherActivityByClass[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITeacherActivityByClass[];
  }>(`/admin/reports/teachers/${teacherId}/activity/classes`, { params: filters });
  return res.data.data;
};

