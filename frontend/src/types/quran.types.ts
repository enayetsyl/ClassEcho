// frontend/src/types/quran.types.ts

// ----- Student types -----
export interface IQuranStudent {
  _id: string;
  studentId: number;
  nameEn: string;
  nameBn?: string;
  class: string;
  supervision: boolean;
  active: boolean;
  notes?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateQuranStudentPayload {
  studentId: number;
  nameEn: string;
  nameBn?: string;
  class: string;
  supervision?: boolean;
  active?: boolean;
  notes?: string;
  photo?: string;
}

// ----- Content (Surah/Juz/Custom) -----
export interface IQuranContent {
  type: "surah" | "juz" | "custom";
  surahNumber?: number;
  surahName?: string;
  ayahStart?: number;
  ayahEnd?: number;
  juzNumber?: number;
  customDescription?: string;
}

// ----- Test & Tajweed -----
export interface IQuranTest {
  given: boolean;
  tanbih: number;
  fath: number;
  note?: string;
  content?: IQuranContent;
}

export interface ITajweedNotes {
  harf?: string;
  ghunna?: string;
  madd?: string;
  other?: string;
}

// ----- Entry types -----
export interface IQuranEntry {
  _id: string;
  student: IQuranStudent | string;
  reportDate: string;
  newTest?: IQuranTest;
  recentTest?: IQuranTest;
  olderTest?: IQuranTest;
  tajweedNotes?: ITajweedNotes;
  generalNote?: string;
  ustadName?: string;
  signature?: string;
  testsGiven: number;
  testsMissed: number;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateQuranEntryPayload {
  studentId: string;
  reportDate: string;
  newTest?: IQuranTest;
  recentTest?: IQuranTest;
  olderTest?: IQuranTest;
  tajweedNotes?: ITajweedNotes;
  generalNote?: string;
  ustadName?: string;
  signature?: string;
}

// ----- Pagination meta (API response) -----
export interface IQuranMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

// ----- Report types -----
export interface IQuranOverallReport {
  totalStudents: number;
  activeStudents: number;
  totalEntries: number;
  dateRange: { start: string; end: string };
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

export interface IQuranWeeklySummary {
  weekStart: string;
  weekEnd: string;
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

export interface IQuranWeeklyTrendReport {
  weeks: IQuranWeeklySummary[];
  trend: "improving" | "declining" | "stable";
  avgMistakesChange: number;
}

export interface IQuranClassBreakdown {
  class: string;
  studentCount: number;
  entryCount: number;
  avgTanbih: number;
  avgFath: number;
  avgTotalMistakes: number;
  testCompletionRate: number;
}

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

/** One week in weekly supervision comparison (Fath/Tanbih by supervised vs unsupervised) */
export interface IQuranWeeklySupervisionRow {
  weekStart: string;
  weekEnd: string;
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

export type IQuranWeeklySupervisionReport =
  IQuranWeeklySupervisionByClassItem[];

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

// ----- Query / Filter types -----
export interface IQuranStudentFilters {
  page?: number;
  limit?: number;
  class?: string;
  supervision?: "true" | "false";
  active?: "true" | "false";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IQuranEntryFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  class?: string;
  supervision?: "true" | "false";
  startDate?: string;
  endDate?: string;
  ustadName?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IQuranReportFilters {
  startDate?: string;
  endDate?: string;
  class?: string;
  supervision?: "true" | "false";
  studentId?: string;
}

/** Extended filters for Phase 2 reports */
export interface IQuranReportFiltersExtended extends IQuranReportFilters {
  groupBy?: "day" | "week" | "month";
  granularity?: "day" | "week" | "month";
  testType?: "all" | "new" | "recent" | "older";
  metric?: "tanbih" | "fath" | "total" | "completion_rate";
  limit?: number;
  surahNumber?: number;
  juzNumber?: number;
  minTests?: number;
}

/** Filters for consistency report (7.1) */
export interface IQuranConsistencyFilters extends IQuranReportFilters {
  minEntries?: number;
}

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
    status: "excellent" | "good" | "warning" | "critical";
  }>;
  calendarData: Array<{
    date: string;
    entriesCount: number;
    status: "full" | "partial" | "missing";
  }>;
  streakLeaderboard: Array<{
    rank: number;
    student: Pick<IQuranStudent, "_id" | "studentId" | "nameEn" | "nameBn" | "class">;
    currentStreak: number;
    longestStreak: number;
  }>;
}

/** Filters for progress report (7.2) */
export interface IQuranProgressFilters extends IQuranReportFilters {}

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
      masteryGrade: "A" | "B" | "C" | "D" | "F";
      improvementVelocity: number;
      trend: "improving" | "declining" | "stable";
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
        type:
          | "surah_completed"
          | "juz_completed"
          | "streak_achieved"
          | "mastery_level";
        description: string;
        date: string;
        value: string;
      }>;
    };
  }>;
  improvementLeaderboard: Array<{
    rank: number;
    student: Pick<IQuranStudent, "_id" | "studentId" | "nameEn" | "nameBn" | "class">;
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

// ----- Reference (Surah / Juz) -----
export interface ISurahInfo {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameBengali: string;
  totalAyahs: number;
  juzStart: number;
}

export interface IJuzInfo {
  number: number;
  nameArabic: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}

// ----- Phase 2 report types -----
export interface ITestTypeMetrics {
  givenCount: number;
  missedCount: number;
  totalTanbih: number;
  totalFath: number;
  avgTanbih: number;
  avgFath: number;
  completionRate: number;
}

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

export interface ITimeAnalysisReport {
  granularity: "day" | "week" | "month";
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
    trend: "improving" | "declining" | "stable";
    percentageChange: number;
  };
}

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
    trend: "improving" | "declining" | "stable";
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

export interface ISurahAnalysisItem {
  surahNumber: number;
  surahName: string;
  testsCount: number;
  avgTanbih: number;
  avgFath: number;
  avgMistakes: number;
  latestTest: string;
  trend: "improving" | "declining" | "stable";
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
    type: "revision_needed" | "maintain" | "ready_for_next";
    content: string;
    priority: "high" | "medium" | "low";
    basedOn: string;
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
    difficulty: "easy" | "medium" | "hard";
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
    difficulty: "easy" | "medium" | "hard";
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
    trend: "improving" | "declining" | "stable";
    lastEntry: string;
  }>;
  worstPerformers: Array<{
    rank: number;
    student: {
      _id: string;
      studentId: number;
      nameEn: string;
      nameBn: string;
      class: string;
      supervision: boolean;
    };
    stats: IPerformersReport["topPerformers"][0]["stats"];
    trend: "improving" | "declining" | "stable";
    lastEntry: string;
  }>;
  byTestType: {
    new: { top: Array<{ student: IQuranStudent; avgMistakes: number }>; worst: Array<{ student: IQuranStudent; avgMistakes: number }> };
    recent: { top: Array<{ student: IQuranStudent; avgMistakes: number }>; worst: Array<{ student: IQuranStudent; avgMistakes: number }> };
    older: { top: Array<{ student: IQuranStudent; avgMistakes: number }>; worst: Array<{ student: IQuranStudent; avgMistakes: number }> };
  };
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
    new: {
      supervised: { avgTanbih: number; avgFath: number; count: number };
      unsupervised: { avgTanbih: number; avgFath: number; count: number };
    };
    recent: {
      supervised: { avgTanbih: number; avgFath: number; count: number };
      unsupervised: { avgTanbih: number; avgFath: number; count: number };
    };
    older: {
      supervised: { avgTanbih: number; avgFath: number; count: number };
      unsupervised: { avgTanbih: number; avgFath: number; count: number };
    };
  };
  timeline: Array<{
    period: string;
    supervised: { entries: number; tanbih: number; fath: number };
    unsupervised: { entries: number; tanbih: number; fath: number };
  }>;
}

// ----- Paginated list response -----
export interface IQuranPaginatedStudents {
  data: IQuranStudent[];
  meta: IQuranMeta;
}

export interface IQuranPaginatedEntries {
  data: IQuranEntry[];
  meta: IQuranMeta;
}

// ----- Bulk import response -----
export interface IQuranBulkImportResult {
  created: number;
  errors: string[];
}
