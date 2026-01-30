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

/** Extended filters for Phase 2 reports (groupBy, granularity, testType, metric, limit, etc.) */
export type TQuranReportFiltersExtended = TQuranReportFilters & {
  groupBy?: 'day' | 'week' | 'month';
  granularity?: 'day' | 'week' | 'month';
  testType?: 'all' | 'new' | 'recent' | 'older';
  metric?: 'tanbih' | 'fath' | 'total' | 'completion_rate';
  limit?: number;
  surahNumber?: number;
  juzNumber?: number;
  minTests?: number;
};

/** Test type analysis report (Phase 2) */
export interface ITestTypeAnalysisReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    supervision?: boolean;
    studentId?: string;
  };
  summary: { totalEntries: number; totalStudents: number };
  byTestType: {
    new: ITestTypeMetrics;
    recent: ITestTypeMetrics;
    older: ITestTypeMetrics;
  };
  timeline: Array<{
    period: string;
    new: { tanbih: number; fath: number; given: number };
    recent: { tanbih: number; fath: number; given: number };
    older: { tanbih: number; fath: number; given: number };
  }>;
}

export interface ITestTypeMetrics {
  givenCount: number;
  missedCount: number;
  totalTanbih: number;
  totalFath: number;
  avgTanbih: number;
  avgFath: number;
  completionRate: number;
}

/** Time analysis report (Phase 2) */
export interface ITimeAnalysisReport {
  granularity: 'day' | 'week' | 'month';
  testType: string;
  data: Array<{
    period: string;
    periodStart: string;
    periodEnd: string;
    metrics: {
      entriesCount: number;
      studentsCount: number;
      testsGiven: number;
      testsMissed: number;
      totalTanbih: number;
      totalFath: number;
      totalMistakes: number;
      avgTanbihPerTest: number;
      avgFathPerTest: number;
      avgMistakesPerStudent: number;
    };
    supervised: { count: number; tanbih: number; fath: number };
    unsupervised: { count: number; tanbih: number; fath: number };
  }>;
  comparison: {
    firstHalf: { avgTanbih: number; avgFath: number };
    secondHalf: { avgTanbih: number; avgFath: number };
    trend: 'improving' | 'declining' | 'stable';
    percentageChange: number;
  };
}

/** Student trend report (Phase 2) */
export interface IStudentTrendReport {
  student: {
    _id: string;
    studentId: number;
    nameEn: string;
    nameBn: string;
    class: string;
    supervision: boolean;
  };
  dateRange: { start: string; end: string };
  overallSummary: {
    totalEntries: number;
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    testCompletionRate: number;
    trend: 'improving' | 'declining' | 'stable';
    improvementRate: number;
  };
  byTestType: {
    new: { avgTanbih: number; avgFath: number; trend: string };
    recent: { avgTanbih: number; avgFath: number; trend: string };
    older: { avgTanbih: number; avgFath: number; trend: string };
  };
  timeline: Array<{
    period: string;
    tanbih: number;
    fath: number;
    total: number;
    testsGiven: number;
    testsMissed: number;
    entries: Array<{
      date: string;
      newTest: { tanbih: number; fath: number };
      recentTest: { tanbih: number; fath: number };
      olderTest: { tanbih: number; fath: number };
    }>;
  }>;
  movingAverage: Array<{
    period: string;
    tanbihMA: number;
    fathMA: number;
    totalMA: number;
  }>;
}

/** Student content report - strong/weak surah & juz (Phase 2) */
export interface IStudentContentReport {
  student: IQuranStudent;
  dateRange: { start: string; end: string };
  surahAnalysis: {
    strong: ISurahAnalysisItem[];
    weak: ISurahAnalysisItemWeak[];
    all: ISurahAnalysisItem[];
  };
  juzAnalysis: {
    strong: IJuzAnalysisItem[];
    weak: IJuzAnalysisItem[];
    all: IJuzAnalysisItem[];
  };
  recommendations: Array<{
    type: 'revision_needed' | 'maintain' | 'ready_for_next';
    content: string;
    priority: 'high' | 'medium' | 'low';
    basedOn: string;
  }>;
}

export interface ISurahAnalysisItem {
  surahNumber: number;
  surahName: string;
  testsCount: number;
  avgTanbih: number;
  avgFath: number;
  avgMistakes: number;
  latestTest: string;
  trend: 'improving' | 'declining' | 'stable';
}

export interface ISurahAnalysisItemWeak extends ISurahAnalysisItem {
  recommendation: string;
}

export interface IJuzAnalysisItem {
  juzNumber: number;
  testsCount: number;
  avgTanbih: number;
  avgFath: number;
  avgMistakes: number;
}

/** Surah analysis report (Phase 2) */
export interface ISurahAnalysisReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    surahNumber?: number;
    testType: string;
  };
  surahOverview?: Array<{
    surahNumber: number;
    surahName: string;
    testsCount: number;
    studentsCount: number;
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  performers: {
    top: IPerformerRow[];
    worst: IPerformerRow[];
  };
  byClass: Array<{
    class: string;
    studentCount: number;
    testsCount: number;
    avgTanbih: number;
    avgFath: number;
  }>;
}

export interface IPerformerRow {
  student: {
    _id: string;
    studentId: number;
    nameEn: string;
    nameBn: string;
    class: string;
  };
  testsCount: number;
  avgTanbih: number;
  avgFath: number;
  avgMistakes: number;
  latestScore: { tanbih: number; fath: number };
}

/** Juz analysis report (Phase 2) */
export interface IJuzAnalysisReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    juzNumber?: number;
    testType: string;
  };
  juzOverview?: Array<{
    juzNumber: number;
    testsCount: number;
    studentsCount: number;
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  performers: { top: IPerformerRow[]; worst: IPerformerRow[] };
  byClass: Array<{
    class: string;
    studentCount: number;
    testsCount: number;
    avgTanbih: number;
    avgFath: number;
  }>;
}

/** Overall performers report (Phase 2) */
export interface IPerformersReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    supervision?: boolean;
    testType: string;
    metric: string;
  };
  topPerformers: Array<{
    rank: number;
    student: {
      _id: string;
      studentId: number;
      nameEn: string;
      nameBn: string;
      class: string;
      supervision: boolean;
    };
    stats: {
      entriesCount: number;
      testsGiven: number;
      testsMissed: number;
      totalTanbih: number;
      totalFath: number;
      totalMistakes: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
      testCompletionRate: number;
    };
    trend: 'improving' | 'declining' | 'stable';
    lastEntry: string;
  }>;
  worstPerformers: Array<{
    rank: number;
    student: { _id: string; studentId: number; nameEn: string; nameBn: string; class: string; supervision: boolean };
    stats: IPerformersReport['topPerformers'][0]['stats'];
    trend: 'improving' | 'declining' | 'stable';
    lastEntry: string;
  }>;
  byTestType: {
    new: { top: Array<{ student: IQuranStudent; avgMistakes: number }>; worst: Array<{ student: IQuranStudent; avgMistakes: number }> };
    recent: { top: Array<{ student: IQuranStudent; avgMistakes: number }>; worst: Array<{ student: IQuranStudent; avgMistakes: number }> };
    older: { top: Array<{ student: IQuranStudent; avgMistakes: number }>; worst: Array<{ student: IQuranStudent; avgMistakes: number }> };
  };
}

/** Supervision detailed report (Phase 2) */
export interface ISupervisionDetailedReport {
  dateRange: { start: string; end: string };
  summary: {
    supervised: ISupervisionSummaryGroup;
    unsupervised: ISupervisionSummaryGroup;
      difference: {
        tanbihDiff: number;
        fathDiff: number;
        mistakesDiff: number;
        completionRateDiff: number;
        conclusion: string;
      };
  };
  byTestType: {
    new: { supervised: { avgTanbih: number; avgFath: number; count: number }; unsupervised: { avgTanbih: number; avgFath: number; count: number } };
    recent: { supervised: { avgTanbih: number; avgFath: number; count: number }; unsupervised: { avgTanbih: number; avgFath: number; count: number } };
    older: { supervised: { avgTanbih: number; avgFath: number; count: number }; unsupervised: { avgTanbih: number; avgFath: number; count: number } };
  };
  timeline: Array<{
    period: string;
    supervised: { entries: number; tanbih: number; fath: number };
    unsupervised: { entries: number; tanbih: number; fath: number };
  }>;
}

export interface ISupervisionSummaryGroup {
  studentCount: number;
  entryCount: number;
  avgTanbih: number;
  avgFath: number;
  avgMistakes: number;
  testCompletionRate: number;
  improvementRate: number;
}

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

/** One week in the weekly supervision comparison (Fath/Tanbih by supervised vs unsupervised) */
export interface IQuranWeeklySupervisionRow {
  weekStart: Date;
  weekEnd: Date;
  supervised: {
    totalFath: number;
    totalTanbih: number;
    testsGiven: number;
    fathPerTest: number;
    tanbihPerTest: number;
  };
  nonSupervised: {
    totalFath: number;
    totalTanbih: number;
    testsGiven: number;
    fathPerTest: number;
    tanbihPerTest: number;
  };
}

/** One class's weekly supervised vs unsupervised comparison */
export interface IQuranWeeklySupervisionByClassItem {
  class: string;
  weeks: IQuranWeeklySupervisionRow[];
}

/** Weekly comparison by class: supervised vs unsupervised Fath and Tanbih per week, per class */
export type IQuranWeeklySupervisionReport = IQuranWeeklySupervisionByClassItem[];

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

/** Filters for consistency report (7.1) */
export type TQuranConsistencyFilters = TQuranReportFilters & {
  minEntries?: number;
};

/** Consistency report (7.1) */
export interface IConsistencyReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    studentId?: string;
    minEntries?: number;
  };
  summary: {
    totalStudents: number;
    avgAttendanceRate: number;
    avgTestRegularityScore: number;
    studentsWithPerfectAttendance: number;
    studentsAtRisk: number;
  };
  students: Array<{
    student: {
      _id: string;
      studentId: number;
      nameEn: string;
      nameBn?: string;
      class: string;
    };
    metrics: {
      currentStreak: number;
      longestStreak: number;
      attendanceRate: number;
      testRegularityScore: number;
      missedWeeks: number;
      consecutiveMissedWeeks: number;
      lastEntryDate: string | null;
      daysSinceLastEntry: number | null;
    };
    weeklyDetail: Array<{
      weekStart: string;
      hasEntry: boolean;
      testsGiven: number;
      testsMissed: number;
    }>;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }>;
  calendarData: Array<{
    date: string;
    entriesCount: number;
    status: 'full' | 'partial' | 'missing';
  }>;
  streakLeaderboard: Array<{
    rank: number;
    student: Pick<IQuranStudent, '_id' | 'studentId' | 'nameEn' | 'nameBn' | 'class'>;
    currentStreak: number;
    longestStreak: number;
  }>;
}

/** Filters for progress report (7.2) - same as base report filters */
export type TQuranProgressFilters = TQuranReportFilters;

/** Progress report (7.2) */
export interface IProgressReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    studentId?: string;
  };
  summary: {
    totalStudents: number;
    avgMasteryScore: number;
    avgImprovementVelocity: number;
    studentsImproving: number;
    studentsDeclining: number;
    studentsStable: number;
  };
  students: Array<{
    student: {
      _id: string;
      studentId: number;
      nameEn: string;
      nameBn?: string;
      class: string;
    };
    progress: {
      masteryScore: number;
      masteryGrade: 'A' | 'B' | 'C' | 'D' | 'F';
      improvementVelocity: number;
      trend: 'improving' | 'declining' | 'stable';
      memorization: {
        surahsCompleted: number[];
        surahsInProgress: number[];
        juzCompleted: number[];
        estimatedCompletion: string;
        progressPercentage: number;
      };
      monthlyScores: Array<{
        month: string;
        masteryScore: number;
        avgMistakes: number;
      }>;
      milestones: Array<{
        type: 'surah_completed' | 'juz_completed' | 'streak_achieved' | 'mastery_level';
        description: string;
        date: string;
        value: string;
      }>;
    };
  }>;
  improvementLeaderboard: Array<{
    rank: number;
    student: Pick<IQuranStudent, '_id' | 'studentId' | 'nameEn' | 'nameBn' | 'class'>;
    improvementVelocity: number;
    previousAvgMistakes: number;
    currentAvgMistakes: number;
  }>;
  masteryDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
}

/** Filters for comparative report (7.3) */
export type TQuranComparativeFilters = TQuranReportFilters & {
  compareBy?: 'class' | 'supervision' | 'all';
};

/** Comparative report (7.3): class rankings, student rankings, peer comparison, ustad effectiveness, distribution */
export interface IComparativeReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    studentId?: string;
    compareBy?: 'class' | 'supervision' | 'all';
  };

  classRankings: Array<{
    class: string;
    rank: number;
    totalStudents: number;
    avgMistakes: number;
    avgMasteryScore: number;
    topPerformer: IQuranStudent;
    mostImproved: IQuranStudent;
  }>;

  studentRankings: Array<{
    rank: number;
    student: IQuranStudent;
    avgMistakes: number;
    masteryScore: number;
    percentile: number;
    rankChange: number;
  }>;

  peerComparison?: {
    targetStudent: {
      _id: string;
      metrics: {
        avgTanbih: number;
        avgFath: number;
        masteryScore: number;
        testCompletionRate: number;
      };
    };
    classAverage: {
      avgTanbih: number;
      avgFath: number;
      masteryScore: number;
      testCompletionRate: number;
    };
    topQuartile: {
      avgTanbih: number;
      avgFath: number;
      masteryScore: number;
    };
    comparison: {
      vsTanbihAvg: number;
      vsFathAvg: number;
      vsMasteryAvg: number;
      vsCompletionAvg: number;
      overallPosition: string;
    };
  };

  ustadComparison: Array<{
    ustadName: string;
    studentsCount: number;
    entriesCount: number;
    avgStudentMistakes: number;
    avgStudentImprovement: number;
    testCompletionRate: number;
    effectiveness: 'high' | 'medium' | 'low';
  }>;

  distribution: {
    mistakesHistogram: Array<{ range: string; count: number }>;
    masteryHistogram: Array<{ range: string; count: number }>;
  };
}

/** Filters for alerts report (7.5) */
export type TQuranAlertsFilters = {
  class?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical' | 'all';
  limit?: number;
  startDate?: string;
  endDate?: string;
};

/** Alerts report (7.5): risk scores, factors, recommendations */
export interface IAlertsReport {
  summary: {
    totalStudents: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
  };
  alerts: Array<{
    student: IQuranStudent;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: {
      attendanceDecline: { value: number; description: string };
      mistakesIncrease: { value: number; description: string };
      streakBroken: { value: boolean; description: string };
      recentGaps: { value: number; description: string };
      tajweedSeverity: { value: number; description: string };
    };
    recommendations: Array<{
      action: string;
      priority: 'immediate' | 'soon' | 'routine';
      assignTo: 'ustad' | 'admin' | 'parent';
    }>;
    history: {
      previousRiskLevel: string;
      riskTrend: 'increasing' | 'decreasing' | 'stable';
      lastAlertDate: string | null;
    };
  }>;
  focusRecommendations: Array<{
    student: IQuranStudent;
    content: Array<{
      type: 'surah' | 'juz';
      number: number;
      name: string;
      reason: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  }>;
  interventions: Array<{
    student: IQuranStudent;
    date: string;
    type: string;
    outcome: 'successful' | 'ongoing' | 'unsuccessful';
  }>;
}

/** Filters for class analytics report (7.6) */
export type TQuranClassAnalyticsFilters = {
  startDate?: string;
  endDate?: string;
  classes?: string[];  // e.g. ['1-5', '2-6']
  compareWithPrevious?: boolean;
};

/** Class analytics report (7.6) */
export interface IClassAnalyticsReport {
  filters: {
    dateRange: { start: string; end: string };
    classes: string[];
  };

  classHealth: Array<{
    class: string;
    healthScore: number;
    healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
    metrics: {
      studentCount: number;
      activeStudents: number;
      avgAttendance: number;
      avgMasteryScore: number;
      avgMistakes: number;
      testCompletionRate: number;
      improvingStudents: number;
      decliningStudents: number;
    };
    comparison?: {
      healthScoreChange: number;
      attendanceChange: number;
      masteryChange: number;
      mistakesChange: number;
    };
    topPerformers: Array<{ student: IQuranStudent; score: number }>;
    needsAttention: Array<{ student: IQuranStudent; riskScore: number }>;
  }>;

  comparison: {
    bestClass: { class: string; score: number };
    mostImproved: { class: string; improvement: number };
    needsAttention: { class: string; reason: string };
  };

  distributions: {
    byMastery: Array<{
      class: string;
      A: number;
      B: number;
      C: number;
      D: number;
      F: number;
    }>;
    byRisk: Array<{
      class: string;
      low: number;
      medium: number;
      high: number;
      critical: number;
    }>;
  };

  timeline: Array<{
    period: string;
    classes: Array<{
      class: string;
      avgMistakes: number;
      avgMastery: number;
      attendance: number;
    }>;
  }>;

  yearOverYear?: {
    currentYear: {
      avgMastery: number;
      avgMistakes: number;
      completionRate: number;
    };
    previousYear: {
      avgMastery: number;
      avgMistakes: number;
      completionRate: number;
    };
    change: {
      masteryChange: number;
      mistakesChange: number;
      completionChange: number;
      insight: string;
    };
  };
}
