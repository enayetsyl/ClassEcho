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

// ----- Test & Tajweed -----
export interface IQuranTest {
  given: boolean;
  tanbih: number;
  fath: number;
  note?: string;
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
  supervised: { totalFath: number; totalTanbih: number };
  nonSupervised: { totalFath: number; totalTanbih: number };
}

export type IQuranWeeklySupervisionReport = IQuranWeeklySupervisionRow[];

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
