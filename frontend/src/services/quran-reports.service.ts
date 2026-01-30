import apiClient from "@/lib/api-client";
import {
  IQuranReportFilters,
  IQuranReportFiltersExtended,
  IQuranConsistencyFilters,
  IQuranOverallReport,
  IQuranWeeklyTrendReport,
  IQuranWeeklySupervisionReport,
  IQuranClassBreakdown,
  IQuranStudentReport,
  IQuranSupervisionComparison,
  IQuranUstadSummaryItem,
  ITestTypeAnalysisReport,
  ITimeAnalysisReport,
  IStudentTrendReport,
  IStudentContentReport,
  ISurahAnalysisReport,
  IJuzAnalysisReport,
  IPerformersReport,
  ISupervisionDetailedReport,
  IConsistencyReport,
  IQuranProgressFilters,
  IProgressReport,
  IQuranComparativeFilters,
  IComparativeReport,
  IQuranAlertsFilters,
  IAlertsReport,
  IQuranClassAnalyticsFilters,
  IClassAnalyticsReport,
} from "@/types/quran.types";

const BASE = "quran/reports";

export const getQuranOverallReport = async (
  params?: IQuranReportFilters,
): Promise<IQuranOverallReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranOverallReport;
  }>(`${BASE}/overall`, { params });
  return res.data.data;
};

export const getQuranWeeklySummary = async (
  params?: IQuranReportFilters,
): Promise<IQuranWeeklyTrendReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranWeeklyTrendReport;
  }>(`${BASE}/weekly-summary`, { params });
  return res.data.data;
};

export const getQuranWeeklySupervisionReport = async (
  params?: IQuranReportFilters,
): Promise<IQuranWeeklySupervisionReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranWeeklySupervisionReport;
  }>(`${BASE}/weekly-supervision`, { params });
  return res.data.data;
};

export const getQuranClassBreakdown = async (
  params?: IQuranReportFilters,
): Promise<IQuranClassBreakdown[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranClassBreakdown[];
  }>(`${BASE}/class-breakdown`, { params });
  return res.data.data;
};

export const getQuranStudentReport = async (
  studentId: string,
  params?: Pick<IQuranReportFilters, "startDate" | "endDate">,
): Promise<IQuranStudentReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranStudentReport;
  }>(`${BASE}/student/${studentId}`, { params });
  return res.data.data;
};

export const getQuranSupervisionComparison = async (
  params?: IQuranReportFilters,
): Promise<IQuranSupervisionComparison> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranSupervisionComparison;
  }>(`${BASE}/supervision`, { params });
  return res.data.data;
};

export const getQuranUstadSummary = async (
  params?: IQuranReportFilters,
): Promise<IQuranUstadSummaryItem[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranUstadSummaryItem[];
  }>(`${BASE}/ustad-summary`, { params });
  return res.data.data;
};

// ----- Phase 2 report endpoints -----

export const getTestTypeAnalysisReport = async (
  params?: IQuranReportFiltersExtended,
): Promise<ITestTypeAnalysisReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITestTypeAnalysisReport;
  }>(`${BASE}/test-type-analysis`, { params });
  return res.data.data;
};

export const getTimeAnalysisReport = async (
  params?: IQuranReportFiltersExtended,
): Promise<ITimeAnalysisReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ITimeAnalysisReport;
  }>(`${BASE}/time-analysis`, { params });
  return res.data.data;
};

export const getStudentTrendReport = async (
  studentId: string,
  params?: IQuranReportFiltersExtended,
): Promise<IStudentTrendReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IStudentTrendReport;
  }>(`${BASE}/student-trend/${studentId}`, { params });
  return res.data.data;
};

export const getStudentContentReport = async (
  studentId: string,
  params?: IQuranReportFiltersExtended,
): Promise<IStudentContentReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IStudentContentReport;
  }>(`${BASE}/student-content/${studentId}`, { params });
  return res.data.data;
};

export const getSurahAnalysisReport = async (
  params?: IQuranReportFiltersExtended,
): Promise<ISurahAnalysisReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISurahAnalysisReport;
  }>(`${BASE}/surah-analysis`, { params });
  return res.data.data;
};

export const getJuzAnalysisReport = async (
  params?: IQuranReportFiltersExtended,
): Promise<IJuzAnalysisReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IJuzAnalysisReport;
  }>(`${BASE}/juz-analysis`, { params });
  return res.data.data;
};

export const getPerformersReport = async (
  params?: IQuranReportFiltersExtended,
): Promise<IPerformersReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IPerformersReport;
  }>(`${BASE}/performers`, { params });
  return res.data.data;
};

export const getSupervisionDetailedReport = async (
  params?: IQuranReportFiltersExtended,
): Promise<ISupervisionDetailedReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISupervisionDetailedReport;
  }>(`${BASE}/supervision-detailed`, { params });
  return res.data.data;
};

export const getConsistencyReport = async (
  params?: IQuranConsistencyFilters,
): Promise<IConsistencyReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IConsistencyReport;
  }>(`${BASE}/consistency`, { params });
  return res.data.data;
};

export const getProgressReport = async (
  params?: IQuranProgressFilters,
): Promise<IProgressReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IProgressReport;
  }>(`${BASE}/progress`, { params });
  return res.data.data;
};

export const getComparativeReport = async (
  params?: IQuranComparativeFilters,
): Promise<IComparativeReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IComparativeReport;
  }>(`${BASE}/comparative`, { params });
  return res.data.data;
};

export const getAlertsReport = async (
  params?: IQuranAlertsFilters,
): Promise<IAlertsReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IAlertsReport;
  }>(`${BASE}/alerts`, { params });
  return res.data.data;
};

export const getClassAnalyticsReport = async (
  params?: IQuranClassAnalyticsFilters,
): Promise<IClassAnalyticsReport> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IClassAnalyticsReport;
  }>(`${BASE}/class-analytics`, {
    params: params?.classes?.length
      ? { ...params, classes: params.classes.join(",") }
      : params,
  });
  return res.data.data;
};
