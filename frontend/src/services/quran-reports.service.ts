import apiClient from "@/lib/api-client";
import {
  IQuranReportFilters,
  IQuranOverallReport,
  IQuranWeeklyTrendReport,
  IQuranWeeklySupervisionReport,
  IQuranClassBreakdown,
  IQuranStudentReport,
  IQuranSupervisionComparison,
  IQuranUstadSummaryItem,
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
