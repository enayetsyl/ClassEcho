// src/hooks/use-reports.ts

import { useQuery } from "@tanstack/react-query";
import {
  ITeacherPerformanceMetrics,
  ITeacherPerformanceFilters,
  ITeacherActivityBySubject,
  ITeacherActivityByClass,
  ITeacherPerformanceSummary,
} from "@/types/reports.types";
import * as reportsService from "@/services/reports.service";

/**
 * Get teacher performance metrics
 */
export const useGetTeacherPerformanceMetricsQuery = (filters?: ITeacherPerformanceFilters) =>
  useQuery<ITeacherPerformanceMetrics[], Error>({
    queryKey: ["reports", "teacher-performance", filters],
    queryFn: () => reportsService.getTeacherPerformanceMetrics(filters),
  });

/**
 * Get teacher performance summary
 */
export const useGetTeacherPerformanceSummaryQuery = (filters?: ITeacherPerformanceFilters) =>
  useQuery<ITeacherPerformanceSummary, Error>({
    queryKey: ["reports", "teacher-summary", filters],
    queryFn: () => reportsService.getTeacherPerformanceSummary(filters),
  });

/**
 * Get teacher activity by subject
 */
export const useGetTeacherActivityBySubjectQuery = (
  teacherId: string,
  filters?: Pick<ITeacherPerformanceFilters, "dateFrom" | "dateTo">
) =>
  useQuery<ITeacherActivityBySubject[], Error>({
    queryKey: ["reports", "teacher-activity-subjects", teacherId, filters],
    queryFn: () => reportsService.getTeacherActivityBySubject(teacherId, filters),
    enabled: Boolean(teacherId),
  });

/**
 * Get teacher activity by class
 */
export const useGetTeacherActivityByClassQuery = (
  teacherId: string,
  filters?: Pick<ITeacherPerformanceFilters, "dateFrom" | "dateTo">
) =>
  useQuery<ITeacherActivityByClass[], Error>({
    queryKey: ["reports", "teacher-activity-classes", teacherId, filters],
    queryFn: () => reportsService.getTeacherActivityByClass(teacherId, filters),
    enabled: Boolean(teacherId),
  });

