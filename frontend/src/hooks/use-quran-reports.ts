import { useQuery } from "@tanstack/react-query";
import {
  IQuranReportFilters,
  IQuranOverallReport,
  IQuranWeeklyTrendReport,
  IQuranClassBreakdown,
  IQuranStudentReport,
  IQuranSupervisionComparison,
  IQuranUstadSummaryItem,
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
