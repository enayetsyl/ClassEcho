// src/app/modules/quran/reports/quran-reports.type.ts

import { IQuranStudent } from '../student/quran-student.type';
import { IQuranEntry } from '../entry/quran-entry.type';

/** Query filters for all report endpoints */
export type TQuranReportFilters = {
  startDate?: string;
  endDate?: string;
  class?: string;
  supervision?: boolean;
  studentId?: string;
};

/** Overall dashboard report */
export interface IQuranOverallReport {
  totalStudents: number;
  activeStudents: number;
  totalEntries: number;
  dateRange: { start: Date; end: Date };
  summary: {
    totalReports: number;
    totalTestsGiven: number;
    totalTestsMissed: number;
    totalTanbih: number;
    totalFath: number;
    totalMistakes: number;
    avgMistakesPerStudent: number;
  };
  byTestType: {
    new: { tanbih: number; fath: number; givenCount: number };
    recent: { tanbih: number; fath: number; givenCount: number };
    older: { tanbih: number; fath: number; givenCount: number };
  };
}

/** Single week in weekly summary */
export interface IQuranWeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  reports: number;
  testsMissed: number;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  byTestType: {
    newTanbih: number;
    newFath: number;
    recentTanbih: number;
    recentFath: number;
    olderTanbih: number;
    olderFath: number;
  };
}

/** Weekly trend report (list of weeks + trend indicator) */
export interface IQuranWeeklyTrendReport {
  weeks: IQuranWeeklySummary[];
  trend: 'improving' | 'declining' | 'stable';
  avgMistakesChange: number; // percentage change (e.g. -10 = 10% improvement)
}

/** Class breakdown row */
export interface IQuranClassBreakdown {
  class: string;
  studentCount: number;
  entryCount: number;
  avgTanbih: number;
  avgFath: number;
  avgTotalMistakes: number;
  testCompletionRate: number; // percentage of tests given vs possible
}

/** Individual student report */
export interface IQuranStudentReport {
  student: IQuranStudent;
  entries: IQuranEntry[];
  summary: {
    totalEntries: number;
    avgTanbih: number;
    avgFath: number;
    avgTotalMistakes: number;
    testCompletionRate: number;
  };
  weeklyTrend: IQuranWeeklySummary[];
  commonIssues: {
    harf: string[];
    ghunna: string[];
    madd: string[];
    other: string[];
  };
}

/** Supervised vs non-supervised comparison */
export interface IQuranSupervisionComparison {
  supervised: {
    studentCount: number;
    entryCount: number;
    totalTanbih: number;
    totalFath: number;
    totalMistakes: number;
    avgMistakesPerEntry: number;
    testCompletionRate: number;
  };
  nonSupervised: {
    studentCount: number;
    entryCount: number;
    totalTanbih: number;
    totalFath: number;
    totalMistakes: number;
    avgMistakesPerEntry: number;
    testCompletionRate: number;
  };
}

/** Summary by Ustad/Ustadha */
export interface IQuranUstadSummaryItem {
  ustadName: string;
  entryCount: number;
  studentCount: number;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  avgMistakesPerEntry: number;
  testCompletionRate: number;
}

export type IQuranUstadSummary = IQuranUstadSummaryItem[];
