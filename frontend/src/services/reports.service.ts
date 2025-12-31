import apiClient from "@/lib/api-client";
import {
  IStatusDistributionReport,
  ITurnaroundTimeReport,
  ITeacherPerformanceReport,
  IReviewerProductivityReport,
  ISubjectAnalytics,
  IClassAnalytics,
  ILanguageReviewCompliance,
  ITimeTrendReport,
  IOperationalEfficiency,
  IQualityMetrics,
  IManagementDashboard,
  TReportsParams,
} from "@/types/reports.types";

const getApiResponse = <T>(res: { success: boolean; message: string; data: T }) => {
  return res.data;
};

/** GET /admin/reports/status-distribution */
export const getStatusDistribution = async (
  params?: TReportsParams
): Promise<IStatusDistributionReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IStatusDistributionReport;
  }>("/admin/reports/status-distribution", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/turnaround-time */
export const getTurnaroundTime = async (
  params?: TReportsParams
): Promise<ITurnaroundTimeReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITurnaroundTimeReport;
  }>("/admin/reports/turnaround-time", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/teacher-performance */
export const getTeacherPerformance = async (
  params?: TReportsParams
): Promise<ITeacherPerformanceReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITeacherPerformanceReport;
  }>("/admin/reports/teacher-performance", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/reviewer-productivity */
export const getReviewerProductivity = async (
  params?: TReportsParams
): Promise<IReviewerProductivityReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IReviewerProductivityReport;
  }>("/admin/reports/reviewer-productivity", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/subject-analytics */
export const getSubjectAnalytics = async (
  params?: TReportsParams
): Promise<ISubjectAnalytics[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISubjectAnalytics[];
  }>("/admin/reports/subject-analytics", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/class-analytics */
export const getClassAnalytics = async (
  params?: TReportsParams
): Promise<IClassAnalytics[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IClassAnalytics[];
  }>("/admin/reports/class-analytics", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/language-review-compliance */
export const getLanguageReviewCompliance = async (
  params?: TReportsParams
): Promise<ILanguageReviewCompliance> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ILanguageReviewCompliance;
  }>("/admin/reports/language-review-compliance", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/time-trends */
export const getTimeTrends = async (
  params?: TReportsParams
): Promise<ITimeTrendReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITimeTrendReport;
  }>("/admin/reports/time-trends", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/operational-efficiency */
export const getOperationalEfficiency = async (
  params?: TReportsParams
): Promise<IOperationalEfficiency> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IOperationalEfficiency;
  }>("/admin/reports/operational-efficiency", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/quality-metrics */
export const getQualityMetrics = async (
  params?: TReportsParams
): Promise<IQualityMetrics> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQualityMetrics;
  }>("/admin/reports/quality-metrics", { params });
  return getApiResponse(res.data);
};

/** GET /admin/reports/dashboard */
export const getManagementDashboard = async (
  params?: TReportsParams
): Promise<IManagementDashboard> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IManagementDashboard;
  }>("/admin/reports/dashboard", { params });
  return getApiResponse(res.data);
};

