import { useQuery } from "@tanstack/react-query";
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
} from "@/types/quran.types";
import * as quranReportsService from "@/services/quran-reports.service";
import { isValidMongoId } from "@/lib/validation";

export const useQuranOverallReportQuery = (params?: IQuranReportFilters) =>
  useQuery<IQuranOverallReport, Error>({
    queryKey: ["quran-report-overall", params],
    queryFn: () => quranReportsService.getQuranOverallReport(params),
  });

export const useQuranWeeklySummaryQuery = (params?: IQuranReportFilters) =>
  useQuery<IQuranWeeklyTrendReport, Error>({
    queryKey: ["quran-report-weekly", params],
    queryFn: () => quranReportsService.getQuranWeeklySummary(params),
  });

export const useQuranWeeklySupervisionQuery = (params?: IQuranReportFilters) =>
  useQuery<IQuranWeeklySupervisionReport, Error>({
    queryKey: ["quran-report-weekly-supervision", params],
    queryFn: () => quranReportsService.getQuranWeeklySupervisionReport(params),
  });

export const useQuranClassBreakdownQuery = (params?: IQuranReportFilters) =>
  useQuery<IQuranClassBreakdown[], Error>({
    queryKey: ["quran-report-class", params],
    queryFn: () => quranReportsService.getQuranClassBreakdown(params),
  });

export const useQuranStudentReportQuery = (
  studentId: string | undefined,
  params?: Pick<IQuranReportFilters, "startDate" | "endDate">,
) =>
  useQuery<IQuranStudentReport, Error>({
    queryKey: ["quran-report-student", studentId, params],
    queryFn: () =>
      quranReportsService.getQuranStudentReport(studentId!, params),
    enabled: Boolean(studentId && isValidMongoId(studentId)),
    retry: false,
  });

export const useQuranSupervisionComparisonQuery = (
  params?: IQuranReportFilters,
) =>
  useQuery<IQuranSupervisionComparison, Error>({
    queryKey: ["quran-report-supervision", params],
    queryFn: () => quranReportsService.getQuranSupervisionComparison(params),
  });

export const useQuranUstadSummaryQuery = (params?: IQuranReportFilters) =>
  useQuery<IQuranUstadSummaryItem[], Error>({
    queryKey: ["quran-report-ustad", params],
    queryFn: () => quranReportsService.getQuranUstadSummary(params),
  });

// ----- Phase 2 report hooks -----

export const useTestTypeAnalysisQuery = (params?: IQuranReportFiltersExtended) =>
  useQuery<ITestTypeAnalysisReport, Error>({
    queryKey: ["quran-report-test-type-analysis", params],
    queryFn: () => quranReportsService.getTestTypeAnalysisReport(params),
  });

export const useTimeAnalysisQuery = (params?: IQuranReportFiltersExtended) =>
  useQuery<ITimeAnalysisReport, Error>({
    queryKey: ["quran-report-time-analysis", params],
    queryFn: () => quranReportsService.getTimeAnalysisReport(params),
  });

export const useStudentTrendQuery = (
  studentId: string | undefined,
  params?: IQuranReportFiltersExtended,
) =>
  useQuery<IStudentTrendReport, Error>({
    queryKey: ["quran-report-student-trend", studentId, params],
    queryFn: () =>
      quranReportsService.getStudentTrendReport(studentId!, params),
    enabled: Boolean(studentId && isValidMongoId(studentId)),
    retry: false,
  });

export const useStudentContentQuery = (
  studentId: string | undefined,
  params?: IQuranReportFiltersExtended,
) =>
  useQuery<IStudentContentReport, Error>({
    queryKey: ["quran-report-student-content", studentId, params],
    queryFn: () =>
      quranReportsService.getStudentContentReport(studentId!, params),
    enabled: Boolean(studentId && isValidMongoId(studentId)),
    retry: false,
  });

export const useSurahAnalysisQuery = (params?: IQuranReportFiltersExtended) =>
  useQuery<ISurahAnalysisReport, Error>({
    queryKey: ["quran-report-surah-analysis", params],
    queryFn: () => quranReportsService.getSurahAnalysisReport(params),
  });

export const useJuzAnalysisQuery = (params?: IQuranReportFiltersExtended) =>
  useQuery<IJuzAnalysisReport, Error>({
    queryKey: ["quran-report-juz-analysis", params],
    queryFn: () => quranReportsService.getJuzAnalysisReport(params),
  });

export const usePerformersQuery = (params?: IQuranReportFiltersExtended) =>
  useQuery<IPerformersReport, Error>({
    queryKey: ["quran-report-performers", params],
    queryFn: () => quranReportsService.getPerformersReport(params),
  });

export const useSupervisionDetailedQuery = (
  params?: IQuranReportFiltersExtended,
) =>
  useQuery<ISupervisionDetailedReport, Error>({
    queryKey: ["quran-report-supervision-detailed", params],
    queryFn: () => quranReportsService.getSupervisionDetailedReport(params),
  });

export const useConsistencyReportQuery = (params?: IQuranConsistencyFilters) =>
  useQuery<IConsistencyReport, Error>({
    queryKey: ["quran-report-consistency", params],
    queryFn: () => quranReportsService.getConsistencyReport(params),
  });

export const useProgressReportQuery = (params?: IQuranProgressFilters) =>
  useQuery<IProgressReport, Error>({
    queryKey: ["quran-report-progress", params],
    queryFn: () => quranReportsService.getProgressReport(params),
  });

export const useComparativeReportQuery = (params?: IQuranComparativeFilters) =>
  useQuery<IComparativeReport, Error>({
    queryKey: ["quran-report-comparative", params],
    queryFn: () => quranReportsService.getComparativeReport(params),
  });

export const useAlertsReportQuery = (params?: IQuranAlertsFilters) =>
  useQuery<IAlertsReport, Error>({
    queryKey: ["quran-report-alerts", params],
    queryFn: () => quranReportsService.getAlertsReport(params),
  });
