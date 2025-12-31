import { useQuery } from "@tanstack/react-query";
import { TReportsParams } from "@/types/reports.types";
import * as reportsService from "@/services/reports.service";

/** Get status distribution report */
export const useStatusDistributionQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "status-distribution", params],
    queryFn: () => reportsService.getStatusDistribution(params),
  });

/** Get turnaround time report */
export const useTurnaroundTimeQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "turnaround-time", params],
    queryFn: () => reportsService.getTurnaroundTime(params),
  });

/** Get teacher performance report */
export const useTeacherPerformanceQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "teacher-performance", params],
    queryFn: () => reportsService.getTeacherPerformance(params),
  });

/** Get reviewer productivity report */
export const useReviewerProductivityQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "reviewer-productivity", params],
    queryFn: () => reportsService.getReviewerProductivity(params),
  });

/** Get subject analytics */
export const useSubjectAnalyticsQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "subject-analytics", params],
    queryFn: () => reportsService.getSubjectAnalytics(params),
  });

/** Get class analytics */
export const useClassAnalyticsQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "class-analytics", params],
    queryFn: () => reportsService.getClassAnalytics(params),
  });

/** Get language review compliance */
export const useLanguageReviewComplianceQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "language-review-compliance", params],
    queryFn: () => reportsService.getLanguageReviewCompliance(params),
  });

/** Get time trends */
export const useTimeTrendsQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "time-trends", params],
    queryFn: () => reportsService.getTimeTrends(params),
  });

/** Get operational efficiency */
export const useOperationalEfficiencyQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "operational-efficiency", params],
    queryFn: () => reportsService.getOperationalEfficiency(params),
  });

/** Get quality metrics */
export const useQualityMetricsQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "quality-metrics", params],
    queryFn: () => reportsService.getQualityMetrics(params),
  });

/** Get management dashboard */
export const useManagementDashboardQuery = (params?: TReportsParams) =>
  useQuery({
    queryKey: ["reports", "dashboard", params],
    queryFn: () => reportsService.getManagementDashboard(params),
  });

