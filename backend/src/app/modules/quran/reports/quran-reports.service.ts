// src/app/modules/quran/reports/quran-reports.service.ts

import { Types, PipelineStage } from 'mongoose';
import { QuranEntry } from '../entry/quran-entry.model';
import { QuranStudent } from '../student/quran-student.model';
import { IQuranEntryDocument } from '../entry/quran-entry.model';
import {
  TQuranReportFilters,
  TQuranReportFiltersExtended,
  IQuranOverallReport,
  IQuranWeeklySummary,
  IQuranWeeklyTrendReport,
  IQuranWeeklySupervisionReport,
  IQuranWeeklySupervisionRow,
  IQuranWeeklySupervisionByClassItem,
  IQuranClassBreakdown,
  IQuranStudentReport,
  IQuranSupervisionComparison,
  IQuranUstadSummary,
  IQuranUstadSummaryItem,
  ITestTypeAnalysisReport,
  ITimeAnalysisReport,
  IStudentTrendReport,
  IStudentContentReport,
  ISurahAnalysisReport,
  IJuzAnalysisReport,
  IPerformersReport,
  ISupervisionDetailedReport,
  IPerformerRow,
  TQuranConsistencyFilters,
  IConsistencyReport,
  TQuranProgressFilters,
  IProgressReport,
  TQuranComparativeFilters,
  IComparativeReport,
} from './quran-reports.type';
import { getSurahByNumber } from '../reference/surah-data';
import { IQuranStudent } from '../student/quran-student.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

/** Get date range for report (default: last 365 days when no filter) */
function getDateRange(filters: TQuranReportFilters): { start: Date; end: Date } {
  const now = new Date();
  if (filters.startDate && filters.endDate) {
    return { start: new Date(filters.startDate), end: new Date(filters.endDate) };
  }
  if (filters.startDate) {
    return { start: new Date(filters.startDate), end: now };
  }
  if (filters.endDate) {
    return { start: new Date(0), end: new Date(filters.endDate) };
  }
  // Default: last 365 days for "overall" so it's bounded
  const start = new Date(now);
  start.setDate(start.getDate() - 365);
  return { start, end: now };
}

/** Build common match + optional student lookup for filters */
function buildFilterStages(filters: TQuranReportFilters, dateRange: { start: Date; end: Date }): PipelineStage[] {
  const stages: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
  ];
  if (filters.class || typeof filters.supervision === 'boolean' || filters.studentId) {
    stages.push(
      { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
      { $unwind: '$studentDoc' },
    );
    if (filters.studentId) stages.push({ $match: { student: new Types.ObjectId(filters.studentId) } });
    if (filters.class) stages.push({ $match: { 'studentDoc.class': filters.class } });
    if (typeof filters.supervision === 'boolean') stages.push({ $match: { 'studentDoc.supervision': filters.supervision } });
  }
  return stages;
}

/** Get period key for grouping (day: YYYY-MM-DD, week: start of week ISO, month: YYYY-MM) */
function getPeriodKey(d: Date, groupBy: 'day' | 'week' | 'month'): string {
  if (groupBy === 'day') return d.toISOString().slice(0, 10);
  if (groupBy === 'month') return d.toISOString().slice(0, 7);
  const weekStart = getWeekStart(d);
  return weekStart.toISOString().slice(0, 10);
}

/** Compute trend from first-half vs second-half average */
function computeTrend(firstAvg: number, secondAvg: number): 'improving' | 'declining' | 'stable' {
  if (firstAvg <= 0) return 'stable';
  const pct = ((secondAvg - firstAvg) / firstAvg) * 100;
  if (pct < -5) return 'improving';
  if (pct > 5) return 'declining';
  return 'stable';
}

export const getOverallReport = async (
  filters: TQuranReportFilters,
): Promise<IQuranOverallReport> => {
  const dateRange = getDateRange(filters);

  const [totalStudents, activeCount, aggResult] = await Promise.all([
    QuranStudent.countDocuments(),
    QuranStudent.countDocuments({ active: true }),
    QuranEntry.aggregate([
      { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
      ...(filters.class || typeof filters.supervision === 'boolean' || filters.studentId
        ? [
            {
              $lookup: {
                from: 'quranstudents',
                localField: 'student',
                foreignField: '_id',
                as: 'studentDoc',
              },
            },
            { $unwind: '$studentDoc' },
            ...(filters.studentId
              ? [{ $match: { student: new Types.ObjectId(filters.studentId) } }]
              : []),
            ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
            ...(typeof filters.supervision === 'boolean'
              ? [{ $match: { 'studentDoc.supervision': filters.supervision } }]
              : []),
          ]
        : []),
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalTestsGiven: { $sum: '$testsGiven' },
          totalTestsMissed: { $sum: '$testsMissed' },
          totalTanbih: { $sum: '$totalTanbih' },
          totalFath: { $sum: '$totalFath' },
          totalMistakes: { $sum: '$totalMistakes' },
          newTanbih: { $sum: { $cond: ['$newTest.given', '$newTest.tanbih', 0] } },
          newFath: { $sum: { $cond: ['$newTest.given', '$newTest.fath', 0] } },
          newGiven: { $sum: { $cond: ['$newTest.given', 1, 0] } },
          recentTanbih: { $sum: { $cond: ['$recentTest.given', '$recentTest.tanbih', 0] } },
          recentFath: { $sum: { $cond: ['$recentTest.given', '$recentTest.fath', 0] } },
          recentGiven: { $sum: { $cond: ['$recentTest.given', 1, 0] } },
          olderTanbih: { $sum: { $cond: ['$olderTest.given', '$olderTest.tanbih', 0] } },
          olderFath: { $sum: { $cond: ['$olderTest.given', '$olderTest.fath', 0] } },
          olderGiven: { $sum: { $cond: ['$olderTest.given', 1, 0] } },
        },
      },
    ]),
  ]);

  const r = aggResult[0] || {
    totalReports: 0,
    totalTestsGiven: 0,
    totalTestsMissed: 0,
    totalTanbih: 0,
    totalFath: 0,
    totalMistakes: 0,
    newTanbih: 0,
    newFath: 0,
    newGiven: 0,
    recentTanbih: 0,
    recentFath: 0,
    recentGiven: 0,
    olderTanbih: 0,
    olderFath: 0,
    olderGiven: 0,
  };

  const totalEntries = r.totalReports;
  const possibleTests = totalEntries * 3;
  const avgMistakesPerStudent = activeCount > 0 ? (r.totalMistakes || 0) / activeCount : 0;

  return {
    totalStudents,
    activeStudents: activeCount,
    totalEntries,
    dateRange: { start: dateRange.start, end: dateRange.end },
    summary: {
      totalReports: totalEntries,
      totalTestsGiven: r.totalTestsGiven ?? 0,
      totalTestsMissed: r.totalTestsMissed ?? 0,
      totalTanbih: r.totalTanbih ?? 0,
      totalFath: r.totalFath ?? 0,
      totalMistakes: r.totalMistakes ?? 0,
      avgMistakesPerStudent,
    },
    byTestType: {
      new: { tanbih: r.newTanbih ?? 0, fath: r.newFath ?? 0, givenCount: r.newGiven ?? 0 },
      recent: {
        tanbih: r.recentTanbih ?? 0,
        fath: r.recentFath ?? 0,
        givenCount: r.recentGiven ?? 0,
      },
      older: { tanbih: r.olderTanbih ?? 0, fath: r.olderFath ?? 0, givenCount: r.olderGiven ?? 0 },
    },
  };
};

/** Get start of week (Sunday) for a date */
function getWeekStart(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Get end of week (Saturday 23:59:59) */
function getWeekEnd(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() + (6 - day));
  x.setHours(23, 59, 59, 999);
  return x;
}

/** Get all week-start dates (ISO string) in range for consistency report */
function getAllWeeksInRange(start: Date, end: Date): string[] {
  const weeks: string[] = [];
  const cur = getWeekStart(new Date(start));
  const endWeek = getWeekStart(new Date(end));
  while (cur.getTime() <= endWeek.getTime()) {
    weeks.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

/** Calculate current streak, longest streak, and consecutive missed weeks from entries */
function calculateStreaks(
  entries: { reportDate: Date }[],
  startDate: Date,
  endDate: Date,
): { currentStreak: number; longestStreak: number; consecutiveMissedWeeks: number } {
  const weekMap = new Set<string>();
  entries.forEach((e) => {
    const ws = getWeekStart(new Date(e.reportDate));
    weekMap.add(ws.toISOString().slice(0, 10));
  });
  const allWeeks = getAllWeeksInRange(startDate, endDate);
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let consecutiveMissed = 0;
  for (let i = allWeeks.length - 1; i >= 0; i--) {
    const week = allWeeks[i];
    if (weekMap.has(week)) {
      tempStreak += 1;
      consecutiveMissed = 0;
      if (currentStreak === 0) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      if (currentStreak === 0) consecutiveMissed += 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  return { currentStreak, longestStreak, consecutiveMissedWeeks: consecutiveMissed };
}

/** Entry-like shape for progress calculations */
interface IEntryForProgress {
  reportDate: Date;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  testsGiven: number;
}

/** Mastery score 0-100 from entries (plan 7.2.3) */
function calculateMasteryScore(entries: IEntryForProgress[]): number {
  if (entries.length === 0) return 0;
  const TANBIH_WEIGHT = 0.4;
  const FATH_WEIGHT = 0.6;
  const COMPLETION_WEIGHT = 0.2;
  const maxMistakesPerTest = 20;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime(),
  );
  let totalScore = 0;
  let totalWeight = 0;
  sorted.forEach((entry, index) => {
    const recencyWeight = 1 + (index / sorted.length) * 0.5;
    const testsGiven = entry.testsGiven || 1;
    const tanbihScore = Math.max(
      0,
      100 - (entry.totalTanbih / testsGiven) * (100 / maxMistakesPerTest),
    );
    const fathScore = Math.max(
      0,
      100 - (entry.totalFath / testsGiven) * (100 / maxMistakesPerTest),
    );
    const completionBonus = (entry.testsGiven / 3) * 100;
    const entryScore =
      tanbihScore * TANBIH_WEIGHT +
      fathScore * FATH_WEIGHT +
      completionBonus * COMPLETION_WEIGHT;
    totalScore += entryScore * recencyWeight;
    totalWeight += recencyWeight;
  });
  return Math.round(totalScore / totalWeight);
}

/** Improvement velocity (% change per month; negative = fewer mistakes = improving) */
function calculateImprovementVelocity(entries: IEntryForProgress[]): number {
  if (entries.length < 4) return 0;
  const sorted = [...entries].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime(),
  );
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);
  const firstHalfAvg =
    firstHalf.reduce((sum, e) => sum + e.totalMistakes, 0) / firstHalf.length;
  const secondHalfAvg =
    secondHalf.reduce((sum, e) => sum + e.totalMistakes, 0) / secondHalf.length;
  if (firstHalfAvg === 0) return 0;
  const velocity = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * -100;
  return Math.round(velocity * 10) / 10;
}

function masteryGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export const getWeeklySummary = async (
  filters: TQuranReportFilters,
): Promise<IQuranWeeklyTrendReport> => {
  const dateRange = getDateRange(filters);

  const pipeline: Record<string, unknown>[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    ...(filters.class || typeof filters.supervision === 'boolean' || filters.studentId
      ? [
          {
            $lookup: {
              from: 'quranstudents',
              localField: 'student',
              foreignField: '_id',
              as: 'studentDoc',
            },
          },
          { $unwind: '$studentDoc' },
          ...(filters.studentId
            ? [{ $match: { student: new Types.ObjectId(filters.studentId) } }]
            : []),
          ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
          ...(typeof filters.supervision === 'boolean'
            ? [{ $match: { 'studentDoc.supervision': filters.supervision } }]
            : []),
        ]
      : []),
    {
      $group: {
        _id: { year: { $year: '$reportDate' }, week: { $week: '$reportDate' } },
        reportDate: { $first: '$reportDate' },
        reports: { $sum: 1 },
        testsMissed: { $sum: '$testsMissed' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        newTanbih: { $sum: { $cond: ['$newTest.given', '$newTest.tanbih', 0] } },
        newFath: { $sum: { $cond: ['$newTest.given', '$newTest.fath', 0] } },
        recentTanbih: { $sum: { $cond: ['$recentTest.given', '$recentTest.tanbih', 0] } },
        recentFath: { $sum: { $cond: ['$recentTest.given', '$recentTest.fath', 0] } },
        olderTanbih: { $sum: { $cond: ['$olderTest.given', '$olderTest.tanbih', 0] } },
        olderFath: { $sum: { $cond: ['$olderTest.given', '$olderTest.fath', 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ];

  const byWeekRows = await QuranEntry.aggregate(pipeline as unknown as PipelineStage[]);

  const weeks: IQuranWeeklySummary[] = byWeekRows.map((row: Record<string, unknown>) => {
    const d = new Date(row.reportDate as Date);
    const weekStart = getWeekStart(d);
    return {
      weekStart,
      weekEnd: getWeekEnd(weekStart),
      reports: (row.reports as number) ?? 0,
      testsMissed: (row.testsMissed as number) ?? 0,
      totalTanbih: (row.totalTanbih as number) ?? 0,
      totalFath: (row.totalFath as number) ?? 0,
      totalMistakes: (row.totalMistakes as number) ?? 0,
      byTestType: {
        newTanbih: (row.newTanbih as number) ?? 0,
        newFath: (row.newFath as number) ?? 0,
        recentTanbih: (row.recentTanbih as number) ?? 0,
        recentFath: (row.recentFath as number) ?? 0,
        olderTanbih: (row.olderTanbih as number) ?? 0,
        olderFath: (row.olderFath as number) ?? 0,
      },
    };
  });

  // Trend: compare first half vs second half average totalMistakes
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  let avgMistakesChange = 0;
  if (weeks.length >= 2) {
    const mid = Math.floor(weeks.length / 2);
    const firstHalf = weeks.slice(0, mid);
    const secondHalf = weeks.slice(mid);
    const avgFirst = firstHalf.reduce((s, w) => s + w.totalMistakes, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, w) => s + w.totalMistakes, 0) / secondHalf.length;
    if (avgFirst > 0) {
      avgMistakesChange = ((avgSecond - avgFirst) / avgFirst) * 100;
      if (avgMistakesChange < -5) trend = 'improving';
      else if (avgMistakesChange > 5) trend = 'declining';
    }
  }

  return { weeks, trend, avgMistakesChange };
};

/** Weekly comparison by class: supervised vs unsupervised Fath and Tanbih per week; includes testsGiven and per-test rates */
export const getWeeklySupervisionComparison = async (
  filters: TQuranReportFilters,
): Promise<IQuranWeeklySupervisionReport> => {
  const dateRange = getDateRange(filters);

  const pipeline: Record<string, unknown>[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
    {
      $group: {
        _id: {
          year: { $year: '$reportDate' },
          week: { $week: '$reportDate' },
          class: '$studentDoc.class',
          supervision: '$studentDoc.supervision',
        },
        reportDate: { $first: '$reportDate' },
        totalFath: { $sum: '$totalFath' },
        totalTanbih: { $sum: '$totalTanbih' },
        testsGiven: { $sum: '$testsGiven' },
      },
    },
    { $sort: { '_id.class': 1, '_id.year': 1, '_id.week': 1 } },
  ];

  const rows = await QuranEntry.aggregate(pipeline as unknown as PipelineStage[]);

  type WeekAcc = {
    weekStart: Date;
    supervised: { fath: number; tanbih: number; testsGiven: number };
    nonSupervised: { fath: number; tanbih: number; testsGiven: number };
  };

  const byClass = new Map<string, Map<string, WeekAcc>>();

  for (const row of rows as Array<{
    _id: { year: number; week: number; class: string; supervision: boolean };
    reportDate: Date;
    totalFath: number;
    totalTanbih: number;
    testsGiven: number;
  }>) {
    const className = row._id.class ?? '(Unspecified)';
    if (!byClass.has(className)) {
      byClass.set(className, new Map());
    }
    const byWeek = byClass.get(className)!;
    const d = new Date(row.reportDate);
    const weekStart = getWeekStart(d);
    const key = weekStart.toISOString().slice(0, 10);
    const existing = byWeek.get(key);
    const fath = row.totalFath ?? 0;
    const tanbih = row.totalTanbih ?? 0;
    const tests = row.testsGiven ?? 0;

    if (row._id.supervision === true) {
      if (existing) {
        existing.supervised.fath += fath;
        existing.supervised.tanbih += tanbih;
        existing.supervised.testsGiven += tests;
      } else {
        byWeek.set(key, {
          weekStart,
          supervised: { fath, tanbih, testsGiven: tests },
          nonSupervised: { fath: 0, tanbih: 0, testsGiven: 0 },
        });
      }
    } else {
      if (existing) {
        existing.nonSupervised.fath += fath;
        existing.nonSupervised.tanbih += tanbih;
        existing.nonSupervised.testsGiven += tests;
      } else {
        byWeek.set(key, {
          weekStart,
          supervised: { fath: 0, tanbih: 0, testsGiven: 0 },
          nonSupervised: { fath, tanbih, testsGiven: tests },
        });
      }
    }
  }

  const result: IQuranWeeklySupervisionReport = [];

  for (const [className, byWeek] of byClass.entries()) {
    const weeks: IQuranWeeklySupervisionRow[] = Array.from(byWeek.entries())
      .map(([, v]) => {
        const supTests = v.supervised.testsGiven || 0;
        const nonSupTests = v.nonSupervised.testsGiven || 0;
        return {
          weekStart: v.weekStart,
          weekEnd: getWeekEnd(v.weekStart),
          supervised: {
            totalFath: v.supervised.fath,
            totalTanbih: v.supervised.tanbih,
            testsGiven: v.supervised.testsGiven,
            fathPerTest: supTests > 0 ? Number((v.supervised.fath / supTests).toFixed(2)) : 0,
            tanbihPerTest: supTests > 0 ? Number((v.supervised.tanbih / supTests).toFixed(2)) : 0,
          },
          nonSupervised: {
            totalFath: v.nonSupervised.fath,
            totalTanbih: v.nonSupervised.tanbih,
            testsGiven: v.nonSupervised.testsGiven,
            fathPerTest:
              nonSupTests > 0 ? Number((v.nonSupervised.fath / nonSupTests).toFixed(2)) : 0,
            tanbihPerTest:
              nonSupTests > 0 ? Number((v.nonSupervised.tanbih / nonSupTests).toFixed(2)) : 0,
          },
        };
      })
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

    result.push({ class: className, weeks });
  }

  result.sort((a, b) => a.class.localeCompare(b.class));
  return result;
};

export const getClassBreakdown = async (
  filters: TQuranReportFilters,
): Promise<IQuranClassBreakdown[]> => {
  const dateRange = getDateRange(filters);

  const pipeline: Record<string, unknown>[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    ...(filters.studentId ? [{ $match: { student: new Types.ObjectId(filters.studentId) } }] : []),
    ...(typeof filters.supervision === 'boolean'
      ? [{ $match: { 'studentDoc.supervision': filters.supervision } }]
      : []),
    {
      $group: {
        _id: '$studentDoc.class',
        entryCount: { $sum: 1 },
        studentIds: { $addToSet: '$student' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        testsGiven: { $sum: '$testsGiven' },
      },
    },
    {
      $project: {
        class: '$_id',
        entryCount: 1,
        studentCount: { $size: '$studentIds' },
        totalTanbih: 1,
        totalFath: 1,
        totalMistakes: 1,
        testsGiven: 1,
        possibleTests: { $multiply: ['$entryCount', 3] },
      },
    },
    {
      $project: {
        class: 1,
        entryCount: 1,
        studentCount: 1,
        avgTanbih: { $divide: ['$totalTanbih', '$entryCount'] },
        avgFath: { $divide: ['$totalFath', '$entryCount'] },
        avgTotalMistakes: { $divide: ['$totalMistakes', '$entryCount'] },
        testCompletionRate: {
          $cond: [
            { $eq: ['$possibleTests', 0] },
            0,
            { $multiply: [{ $divide: ['$testsGiven', '$possibleTests'] }, 100] },
          ],
        },
      },
    },
    { $sort: { class: 1 } },
  ];

  const result = await QuranEntry.aggregate(pipeline as unknown as PipelineStage[]);
  return result.map(
    (r: Record<string, unknown>): IQuranClassBreakdown => ({
      class: String(r.class ?? ''),
      studentCount: Number(r.studentCount ?? 0),
      entryCount: Number(r.entryCount ?? 0),
      avgTanbih: Number((Number(r.avgTanbih) || 0).toFixed(2)),
      avgFath: Number((Number(r.avgFath) || 0).toFixed(2)),
      avgTotalMistakes: Number((Number(r.avgTotalMistakes) || 0).toFixed(2)),
      testCompletionRate: Number((Number(r.testCompletionRate) || 0).toFixed(2)),
    }),
  );
};

export const getStudentReport = async (
  studentId: string,
  filters: TQuranReportFilters,
): Promise<IQuranStudentReport> => {
  const student = await QuranStudent.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  }

  const dateRange = getDateRange(filters);
  const query: Record<string, unknown> = {
    student: new Types.ObjectId(studentId),
    reportDate: { $gte: dateRange.start, $lte: dateRange.end },
  };

  const entries = await QuranEntry.find(query).sort({ reportDate: -1 }).populate('student').lean();
  const entryDocs = entries as unknown as IQuranEntryDocument[];

  const totalEntries = entryDocs.length;
  const totalTanbih = entryDocs.reduce((s, e) => s + (e.totalTanbih ?? 0), 0);
  const totalFath = entryDocs.reduce((s, e) => s + (e.totalFath ?? 0), 0);
  const totalMistakes = entryDocs.reduce((s, e) => s + (e.totalMistakes ?? 0), 0);
  const testsGiven = entryDocs.reduce((s, e) => s + (e.testsGiven ?? 0), 0);
  const possibleTests = totalEntries * 3;
  const testCompletionRate = possibleTests > 0 ? (testsGiven / possibleTests) * 100 : 0;

  // Weekly trend for this student
  const byWeek = new Map<
    string,
    {
      reports: number;
      testsMissed: number;
      totalMistakes: number;
      totalTanbih: number;
      totalFath: number;
      byTestType: IQuranWeeklySummary['byTestType'];
    }
  >();
  for (const e of entryDocs) {
    const d = new Date(e.reportDate);
    const weekStart = getWeekStart(d);
    const key = weekStart.toISOString().slice(0, 10);
    const existing = byWeek.get(key);
    const byTestType = {
      newTanbih: e.newTest?.given ? (e.newTest.tanbih ?? 0) : 0,
      newFath: e.newTest?.given ? (e.newTest.fath ?? 0) : 0,
      recentTanbih: e.recentTest?.given ? (e.recentTest.tanbih ?? 0) : 0,
      recentFath: e.recentTest?.given ? (e.recentTest.fath ?? 0) : 0,
      olderTanbih: e.olderTest?.given ? (e.olderTest.tanbih ?? 0) : 0,
      olderFath: e.olderTest?.given ? (e.olderTest.fath ?? 0) : 0,
    };
    if (existing) {
      existing.reports += 1;
      existing.testsMissed += e.testsMissed ?? 0;
      existing.totalMistakes += e.totalMistakes ?? 0;
      existing.totalTanbih += e.totalTanbih ?? 0;
      existing.totalFath += e.totalFath ?? 0;
      existing.byTestType.newTanbih += byTestType.newTanbih;
      existing.byTestType.newFath += byTestType.newFath;
      existing.byTestType.recentTanbih += byTestType.recentTanbih;
      existing.byTestType.recentFath += byTestType.recentFath;
      existing.byTestType.olderTanbih += byTestType.olderTanbih;
      existing.byTestType.olderFath += byTestType.olderFath;
    } else {
      byWeek.set(key, {
        reports: 1,
        testsMissed: e.testsMissed ?? 0,
        totalMistakes: e.totalMistakes ?? 0,
        totalTanbih: e.totalTanbih ?? 0,
        totalFath: e.totalFath ?? 0,
        byTestType,
      });
    }
  }
  const weeklyTrend: IQuranWeeklySummary[] = Array.from(byWeek.entries())
    .map(([key, v]) => ({
      weekStart: new Date(key),
      weekEnd: getWeekEnd(new Date(key)),
      reports: v.reports,
      testsMissed: v.testsMissed,
      totalTanbih: v.totalTanbih,
      totalFath: v.totalFath,
      totalMistakes: v.totalMistakes,
      byTestType: v.byTestType,
    }))
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

  // Common issues from tajweed notes (non-empty strings)
  const harf: string[] = [];
  const ghunna: string[] = [];
  const madd: string[] = [];
  const other: string[] = [];
  for (const e of entryDocs) {
    const t = e.tajweedNotes;
    if (t?.harf?.trim()) harf.push(t.harf.trim());
    if (t?.ghunna?.trim()) ghunna.push(t.ghunna.trim());
    if (t?.madd?.trim()) madd.push(t.madd.trim());
    if (t?.other?.trim()) other.push(t.other.trim());
  }

  const studentPojo: IQuranStudent = {
    _id: student.id,
    studentId: student.studentId,
    nameEn: student.nameEn,
    nameBn: student.nameBn,
    class: student.class,
    supervision: student.supervision,
    active: student.active,
    notes: student.notes,
    photo: student.photo,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };

  return {
    student: studentPojo,
    entries: entryDocs.map((doc) => ({
      ...doc,
      _id: doc.id,
      student: doc.student,
    })) as IQuranStudentReport['entries'],
    summary: {
      totalEntries,
      avgTanbih: totalEntries > 0 ? totalTanbih / totalEntries : 0,
      avgFath: totalEntries > 0 ? totalFath / totalEntries : 0,
      avgTotalMistakes: totalEntries > 0 ? totalMistakes / totalEntries : 0,
      testCompletionRate,
    },
    weeklyTrend,
    commonIssues: {
      harf: [...new Set(harf)],
      ghunna: [...new Set(ghunna)],
      madd: [...new Set(madd)],
      other: [...new Set(other)],
    },
  };
};

export const getSupervisionComparison = async (
  filters: TQuranReportFilters,
): Promise<IQuranSupervisionComparison> => {
  const dateRange = getDateRange(filters);

  const pipeline: Record<string, unknown>[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
    ...(filters.studentId ? [{ $match: { student: new Types.ObjectId(filters.studentId) } }] : []),
    {
      $group: {
        _id: '$studentDoc.supervision',
        entryCount: { $sum: 1 },
        studentIds: { $addToSet: '$student' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        testsGiven: { $sum: '$testsGiven' },
      },
    },
  ];

  const result = await QuranEntry.aggregate(pipeline as unknown as PipelineStage[]);
  const supervised = result.find((r: { _id: boolean }) => r._id === true);
  const nonSupervised = result.find((r: { _id: boolean }) => r._id === false);

  const toGroup = (r: Record<string, unknown> | undefined) => {
    if (!r)
      return {
        studentCount: 0,
        entryCount: 0,
        totalTanbih: 0,
        totalFath: 0,
        totalMistakes: 0,
        avgMistakesPerEntry: 0,
        testCompletionRate: 0,
      };
    const entryCount = (r.entryCount as number) ?? 0;
    const studentCount = Array.isArray(r.studentIds) ? r.studentIds.length : 0;
    const totalMistakes = (r.totalMistakes as number) ?? 0;
    const testsGiven = (r.testsGiven as number) ?? 0;
    const possible = entryCount * 3;
    return {
      studentCount,
      entryCount,
      totalTanbih: (r.totalTanbih as number) ?? 0,
      totalFath: (r.totalFath as number) ?? 0,
      totalMistakes,
      avgMistakesPerEntry: entryCount > 0 ? totalMistakes / entryCount : 0,
      testCompletionRate: possible > 0 ? (testsGiven / possible) * 100 : 0,
    };
  };

  return {
    supervised: toGroup(supervised),
    nonSupervised: toGroup(nonSupervised),
  };
};

export const getUstadSummary = async (
  filters: TQuranReportFilters,
): Promise<IQuranUstadSummary> => {
  const dateRange = getDateRange(filters);

  const pipeline: Record<string, unknown>[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    ...(filters.class || typeof filters.supervision === 'boolean' || filters.studentId
      ? [
          {
            $lookup: {
              from: 'quranstudents',
              localField: 'student',
              foreignField: '_id',
              as: 'studentDoc',
            },
          },
          { $unwind: '$studentDoc' },
          ...(filters.studentId
            ? [{ $match: { student: new Types.ObjectId(filters.studentId) } }]
            : []),
          ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
          ...(typeof filters.supervision === 'boolean'
            ? [{ $match: { 'studentDoc.supervision': filters.supervision } }]
            : []),
        ]
      : []),
    {
      $group: {
        _id: { $ifNull: ['$ustadName', '(Unspecified)'] },
        entryCount: { $sum: 1 },
        studentIds: { $addToSet: '$student' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        testsGiven: { $sum: '$testsGiven' },
      },
    },
    {
      $project: {
        ustadName: '$_id',
        entryCount: 1,
        studentCount: { $size: '$studentIds' },
        totalTanbih: 1,
        totalFath: 1,
        totalMistakes: 1,
        testsGiven: 1,
        possibleTests: { $multiply: ['$entryCount', 3] },
      },
    },
    {
      $project: {
        ustadName: 1,
        entryCount: 1,
        studentCount: 1,
        totalTanbih: 1,
        totalFath: 1,
        totalMistakes: 1,
        avgMistakesPerEntry: { $divide: ['$totalMistakes', '$entryCount'] },
        testCompletionRate: {
          $cond: [
            { $eq: ['$possibleTests', 0] },
            0,
            { $multiply: [{ $divide: ['$testsGiven', '$possibleTests'] }, 100] },
          ],
        },
      },
    },
    { $sort: { entryCount: -1 } },
  ];

  const result = await QuranEntry.aggregate(pipeline as unknown as PipelineStage[]);
  return result.map((r: Record<string, unknown>) => ({
    ustadName: r.ustadName as string,
    entryCount: r.entryCount as number,
    studentCount: r.studentCount as number,
    totalTanbih: r.totalTanbih as number,
    totalFath: r.totalFath as number,
    totalMistakes: r.totalMistakes as number,
    avgMistakesPerEntry: Number(((r.avgMistakesPerEntry as number) ?? 0).toFixed(2)),
    testCompletionRate: Number(((r.testCompletionRate as number) ?? 0).toFixed(2)),
  })) as IQuranUstadSummaryItem[];
};

// ---------- Phase 2: New Report Endpoints ----------

function getGroupByExpr(groupBy: 'day' | 'week' | 'month') {
  if (groupBy === 'day')
    return { year: { $year: '$reportDate' }, month: { $month: '$reportDate' }, day: { $dayOfMonth: '$reportDate' } };
  if (groupBy === 'month') return { year: { $year: '$reportDate' }, month: { $month: '$reportDate' } };
  return { year: { $year: '$reportDate' }, week: { $week: '$reportDate' } };
}

export const getTestTypeAnalysisReport = async (
  filters: TQuranReportFiltersExtended,
): Promise<ITestTypeAnalysisReport> => {
  const dateRange = getDateRange(filters);
  const groupBy = filters.groupBy ?? 'week';
  const pipeline: PipelineStage[] = [
    ...buildFilterStages(filters, dateRange),
    {
      $group: {
        _id: getGroupByExpr(groupBy),
        reportDate: { $first: '$reportDate' },
        entries: { $sum: 1 },
        newGiven: { $sum: { $cond: ['$newTest.given', 1, 0] } },
        newTanbih: { $sum: { $cond: ['$newTest.given', '$newTest.tanbih', 0] } },
        newFath: { $sum: { $cond: ['$newTest.given', '$newTest.fath', 0] } },
        recentGiven: { $sum: { $cond: ['$recentTest.given', 1, 0] } },
        recentTanbih: { $sum: { $cond: ['$recentTest.given', '$recentTest.tanbih', 0] } },
        recentFath: { $sum: { $cond: ['$recentTest.given', '$recentTest.fath', 0] } },
        olderGiven: { $sum: { $cond: ['$olderTest.given', 1, 0] } },
        olderTanbih: { $sum: { $cond: ['$olderTest.given', '$olderTest.tanbih', 0] } },
        olderFath: { $sum: { $cond: ['$olderTest.given', '$olderTest.fath', 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1, '_id.month': 1, '_id.day': 1 } },
  ];
  const periodRows = await QuranEntry.aggregate(pipeline);
  const totalEntries = periodRows.reduce((s, r) => s + (r.entries ?? 0), 0);
  const totalPossible = totalEntries * 3;
  const newGiven = periodRows.reduce((s, r) => s + (r.newGiven ?? 0), 0);
  const recentGiven = periodRows.reduce((s, r) => s + (r.recentGiven ?? 0), 0);
  const olderGiven = periodRows.reduce((s, r) => s + (r.olderGiven ?? 0), 0);
  const newTanbih = periodRows.reduce((s, r) => s + (r.newTanbih ?? 0), 0);
  const newFath = periodRows.reduce((s, r) => s + (r.newFath ?? 0), 0);
  const recentTanbih = periodRows.reduce((s, r) => s + (r.recentTanbih ?? 0), 0);
  const recentFath = periodRows.reduce((s, r) => s + (r.recentFath ?? 0), 0);
  const olderTanbih = periodRows.reduce((s, r) => s + (r.olderTanbih ?? 0), 0);
  const olderFath = periodRows.reduce((s, r) => s + (r.olderFath ?? 0), 0);
  const studentIds = await QuranEntry.distinct('student', {
    reportDate: { $gte: dateRange.start, $lte: dateRange.end },
    ...(filters.studentId ? { student: new Types.ObjectId(filters.studentId) } : {}),
  });
  const totalStudents = studentIds.length;
  const toMetrics = (given: number, tanbih: number, fath: number, possible: number) => ({
    givenCount: given,
    missedCount: possible - given,
    totalTanbih: tanbih,
    totalFath: fath,
    avgTanbih: given > 0 ? Number((tanbih / given).toFixed(2)) : 0,
    avgFath: given > 0 ? Number((fath / given).toFixed(2)) : 0,
    completionRate: possible > 0 ? Number(((given / possible) * 100).toFixed(2)) : 0,
  });
  const timeline = periodRows.map((r: Record<string, unknown>) => {
    const d = new Date(r.reportDate as Date);
    const period = getPeriodKey(d, groupBy);
    return {
      period,
      new: { tanbih: (r.newTanbih as number) ?? 0, fath: (r.newFath as number) ?? 0, given: (r.newGiven as number) ?? 0 },
      recent: { tanbih: (r.recentTanbih as number) ?? 0, fath: (r.recentFath as number) ?? 0, given: (r.recentGiven as number) ?? 0 },
      older: { tanbih: (r.olderTanbih as number) ?? 0, fath: (r.olderFath as number) ?? 0, given: (r.olderGiven as number) ?? 0 },
    };
  });
  return {
    filters: {
      dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
      class: filters.class,
      supervision: filters.supervision,
      studentId: filters.studentId,
    },
    summary: { totalEntries, totalStudents },
    byTestType: {
      new: toMetrics(newGiven, newTanbih, newFath, totalPossible),
      recent: toMetrics(recentGiven, recentTanbih, recentFath, totalPossible),
      older: toMetrics(olderGiven, olderTanbih, olderFath, totalPossible),
    },
    timeline,
  };
};

export const getTimeAnalysisReport = async (filters: TQuranReportFiltersExtended): Promise<ITimeAnalysisReport> => {
  const dateRange = getDateRange(filters);
  const granularity = filters.granularity ?? 'week';
  const testType = filters.testType ?? 'all';
  const pipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
    { $unwind: '$studentDoc' },
    ...(filters.studentId ? [{ $match: { student: new Types.ObjectId(filters.studentId) } }] : []),
    ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
    ...(typeof filters.supervision === 'boolean' ? [{ $match: { 'studentDoc.supervision': filters.supervision } }] : []),
    {
      $group: {
        _id: {
          ...getGroupByExpr(granularity),
          supervision: '$studentDoc.supervision',
        },
        reportDate: { $first: '$reportDate' },
        entries: { $sum: 1 },
        studentIds: { $addToSet: '$student' },
        testsGiven: { $sum: '$testsGiven' },
        testsMissed: { $sum: '$testsMissed' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        newTanbih: { $sum: { $cond: ['$newTest.given', '$newTest.tanbih', 0] } },
        newFath: { $sum: { $cond: ['$newTest.given', '$newTest.fath', 0] } },
        newGiven: { $sum: { $cond: ['$newTest.given', 1, 0] } },
        recentTanbih: { $sum: { $cond: ['$recentTest.given', '$recentTest.tanbih', 0] } },
        recentFath: { $sum: { $cond: ['$recentTest.given', '$recentTest.fath', 0] } },
        recentGiven: { $sum: { $cond: ['$recentTest.given', 1, 0] } },
        olderTanbih: { $sum: { $cond: ['$olderTest.given', '$olderTest.tanbih', 0] } },
        olderFath: { $sum: { $cond: ['$olderTest.given', '$olderTest.fath', 0] } },
        olderGiven: { $sum: { $cond: ['$olderTest.given', 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1, '_id.month': 1, '_id.day': 1 } },
  ];
  const rows = await QuranEntry.aggregate(pipeline);
  const byPeriod = new Map<
    string,
    {
      periodStart: Date;
      periodEnd: Date;
      entries: number;
      students: Set<Types.ObjectId>;
      testsGiven: number;
      testsMissed: number;
      totalTanbih: number;
      totalFath: number;
      totalMistakes: number;
      newTanbih: number;
      newFath: number;
      newGiven: number;
      recentTanbih: number;
      recentFath: number;
      recentGiven: number;
      olderTanbih: number;
      olderFath: number;
      olderGiven: number;
      supEntries: number;
      supTanbih: number;
      supFath: number;
      unsupEntries: number;
      unsupTanbih: number;
      unsupFath: number;
    }
  >();
  for (const r of rows as Array<Record<string, unknown> & { _id: { year: number; week?: number; month?: number; day?: number; supervision: boolean }; reportDate: Date }>) {
    const d = new Date(r.reportDate);
    const key = getPeriodKey(d, granularity);
    const periodStart = granularity === 'day' ? d : granularity === 'month' ? new Date(d.getFullYear(), d.getMonth(), 1) : getWeekStart(d);
    const periodEnd = granularity === 'day' ? d : granularity === 'month' ? new Date(d.getFullYear(), d.getMonth() + 1, 0) : getWeekEnd(periodStart);
    let row = byPeriod.get(key);
    if (!row) {
      row = {
        periodStart,
        periodEnd,
        entries: 0,
        students: new Set(),
        testsGiven: 0,
        testsMissed: 0,
        totalTanbih: 0,
        totalFath: 0,
        totalMistakes: 0,
        newTanbih: 0,
        newFath: 0,
        newGiven: 0,
        recentTanbih: 0,
        recentFath: 0,
        recentGiven: 0,
        olderTanbih: 0,
        olderFath: 0,
        olderGiven: 0,
        supEntries: 0,
        supTanbih: 0,
        supFath: 0,
        unsupEntries: 0,
        unsupTanbih: 0,
        unsupFath: 0,
      };
      byPeriod.set(key, row);
    }
    row.entries += (r.entries as number) ?? 0;
    for (const id of (r.studentIds as Types.ObjectId[]) ?? []) row.students.add(id);
    row.testsGiven += (r.testsGiven as number) ?? 0;
    row.testsMissed += (r.testsMissed as number) ?? 0;
    row.totalTanbih += (r.totalTanbih as number) ?? 0;
    row.totalFath += (r.totalFath as number) ?? 0;
    row.totalMistakes += (r.totalMistakes as number) ?? 0;
    row.newTanbih += (r.newTanbih as number) ?? 0;
    row.newFath += (r.newFath as number) ?? 0;
    row.newGiven += (r.newGiven as number) ?? 0;
    row.recentTanbih += (r.recentTanbih as number) ?? 0;
    row.recentFath += (r.recentFath as number) ?? 0;
    row.recentGiven += (r.recentGiven as number) ?? 0;
    row.olderTanbih += (r.olderTanbih as number) ?? 0;
    row.olderFath += (r.olderFath as number) ?? 0;
    row.olderGiven += (r.olderGiven as number) ?? 0;
    if (r._id.supervision === true) {
      row.supEntries += (r.entries as number) ?? 0;
      row.supTanbih += (r.totalTanbih as number) ?? 0;
      row.supFath += (r.totalFath as number) ?? 0;
    } else {
      row.unsupEntries += (r.entries as number) ?? 0;
      row.unsupTanbih += (r.totalTanbih as number) ?? 0;
      row.unsupFath += (r.totalFath as number) ?? 0;
    }
  }
  const data = Array.from(byPeriod.entries())
    .sort((a, b) => a[1].periodStart.getTime() - b[1].periodStart.getTime())
    .map(([period, row]) => {
      const testsGiven = row.testsGiven;
      const testsMissed = row.testsMissed;
      let tanbih = row.totalTanbih,
        fath = row.totalFath;
      if (testType === 'new') {
        tanbih = row.newTanbih;
        fath = row.newFath;
      } else if (testType === 'recent') {
        tanbih = row.recentTanbih;
        fath = row.recentFath;
      } else if (testType === 'older') {
        tanbih = row.olderTanbih;
        fath = row.olderFath;
      }
      const givenForType = testType === 'new' ? row.newGiven : testType === 'recent' ? row.recentGiven : testType === 'older' ? row.olderGiven : row.testsGiven;
      return {
        period,
        periodStart: row.periodStart.toISOString().slice(0, 10),
        periodEnd: row.periodEnd.toISOString().slice(0, 10),
        metrics: {
          entriesCount: row.entries,
          studentsCount: row.students.size,
          testsGiven: row.testsGiven,
          testsMissed: row.testsMissed,
          totalTanbih: row.totalTanbih,
          totalFath: row.totalFath,
          totalMistakes: row.totalMistakes,
          avgTanbihPerTest: givenForType > 0 ? Number((tanbih / givenForType).toFixed(2)) : 0,
          avgFathPerTest: givenForType > 0 ? Number((fath / givenForType).toFixed(2)) : 0,
          avgMistakesPerStudent: row.students.size > 0 ? Number((row.totalMistakes / row.students.size).toFixed(2)) : 0,
        },
        supervised: { count: row.supEntries, tanbih: row.supTanbih, fath: row.supFath },
        unsupervised: { count: row.unsupEntries, tanbih: row.unsupTanbih, fath: row.unsupFath },
      };
    });
  const half = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, half);
  const secondHalf = data.slice(half);
  const avg = (arr: typeof data, key: 'totalTanbih' | 'totalFath') => {
    const sum = arr.reduce((s, d) => s + (d.metrics[key] ?? 0), 0);
    return arr.length > 0 ? sum / arr.length : 0;
  };
  const fAvgTanbih = avg(firstHalf, 'totalTanbih');
  const fAvgFath = avg(firstHalf, 'totalFath');
  const sAvgTanbih = avg(secondHalf, 'totalTanbih');
  const sAvgFath = avg(secondHalf, 'totalFath');
  const pctChange = fAvgTanbih + fAvgFath > 0 ? (((sAvgTanbih + sAvgFath - (fAvgTanbih + fAvgFath)) / (fAvgTanbih + fAvgFath)) * 100) : 0;
  return {
    granularity,
    testType,
    data,
    comparison: {
      firstHalf: { avgTanbih: Number(fAvgTanbih.toFixed(2)), avgFath: Number(fAvgFath.toFixed(2)) },
      secondHalf: { avgTanbih: Number(sAvgTanbih.toFixed(2)), avgFath: Number(sAvgFath.toFixed(2)) },
      trend: computeTrend(fAvgTanbih + fAvgFath, sAvgTanbih + sAvgFath),
      percentageChange: Number(pctChange.toFixed(2)),
    },
  };
};

export const getStudentTrendReport = async (
  studentId: string,
  filters: TQuranReportFiltersExtended,
): Promise<IStudentTrendReport> => {
  const student = await QuranStudent.findById(studentId);
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  const dateRange = getDateRange(filters);
  const granularity = filters.granularity ?? 'week';
  const entries = await QuranEntry.find({
    student: new Types.ObjectId(studentId),
    reportDate: { $gte: dateRange.start, $lte: dateRange.end },
  })
    .sort({ reportDate: 1 })
    .lean();
  const entryDocs = entries as unknown as IQuranEntryDocument[];
  const totalEntries = entryDocs.length;
  const totalTanbih = entryDocs.reduce((s, e) => s + (e.totalTanbih ?? 0), 0);
  const totalFath = entryDocs.reduce((s, e) => s + (e.totalFath ?? 0), 0);
  const totalMistakes = totalTanbih + totalFath;
  const testsGiven = entryDocs.reduce((s, e) => s + (e.testsGiven ?? 0), 0);
  const possibleTests = totalEntries * 3;
  const testCompletionRate = possibleTests > 0 ? (testsGiven / possibleTests) * 100 : 0;
  const byPeriod = new Map<
    string,
    {
      tanbih: number;
      fath: number;
      total: number;
      testsGiven: number;
      testsMissed: number;
      entries: Array<{ date: string; newTest: { tanbih: number; fath: number }; recentTest: { tanbih: number; fath: number }; olderTest: { tanbih: number; fath: number } }>;
    }
  >();
  for (const e of entryDocs) {
    const d = new Date(e.reportDate);
    const key = getPeriodKey(d, granularity);
    const periodStart = granularity === 'day' ? d : granularity === 'month' ? new Date(d.getFullYear(), d.getMonth(), 1) : getWeekStart(d);
    if (!byPeriod.has(key)) {
      byPeriod.set(key, { tanbih: 0, fath: 0, total: 0, testsGiven: 0, testsMissed: 0, entries: [] });
    }
    const row = byPeriod.get(key)!;
    row.tanbih += e.totalTanbih ?? 0;
    row.fath += e.totalFath ?? 0;
    row.total += e.totalTanbih! + e.totalFath!;
    row.testsGiven += e.testsGiven ?? 0;
    row.testsMissed += e.testsMissed ?? 0;
    row.entries.push({
      date: new Date(e.reportDate).toISOString().slice(0, 10),
      newTest: { tanbih: e.newTest?.given ? (e.newTest.tanbih ?? 0) : 0, fath: e.newTest?.given ? (e.newTest.fath ?? 0) : 0 },
      recentTest: { tanbih: e.recentTest?.given ? (e.recentTest.tanbih ?? 0) : 0, fath: e.recentTest?.given ? (e.recentTest.fath ?? 0) : 0 },
      olderTest: { tanbih: e.olderTest?.given ? (e.olderTest.tanbih ?? 0) : 0, fath: e.olderTest?.given ? (e.olderTest.fath ?? 0) : 0 },
    });
  }
  const timeline = Array.from(byPeriod.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, row]) => ({ period, ...row }));
  const half = Math.floor(timeline.length / 2);
  const firstHalfAvg = half > 0 ? timeline.slice(0, half).reduce((s, t) => s + t.total, 0) / half : 0;
  const secondHalfAvg = timeline.length - half > 0 ? timeline.slice(half).reduce((s, t) => s + t.total, 0) / (timeline.length - half) : 0;
  const trend = computeTrend(firstHalfAvg, secondHalfAvg);
  const improvementRate = firstHalfAvg > 0 ? (((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100) : 0;
  const newAvg = entryDocs.filter((e) => e.newTest?.given).reduce((s, e) => s + (e.newTest!.tanbih ?? 0) + (e.newTest!.fath ?? 0), 0);
  const newCount = entryDocs.filter((e) => e.newTest?.given).length;
  const recentAvg = entryDocs.filter((e) => e.recentTest?.given).reduce((s, e) => s + (e.recentTest!.tanbih ?? 0) + (e.recentTest!.fath ?? 0), 0);
  const recentCount = entryDocs.filter((e) => e.recentTest?.given).length;
  const olderAvg = entryDocs.filter((e) => e.olderTest?.given).reduce((s, e) => s + (e.olderTest!.tanbih ?? 0) + (e.olderTest!.fath ?? 0), 0);
  const olderCount = entryDocs.filter((e) => e.olderTest?.given).length;
  const movingWindow = 4;
  const movingAverage: IStudentTrendReport['movingAverage'] = [];
  for (let i = movingWindow - 1; i < timeline.length; i++) {
    const slice = timeline.slice(i - movingWindow + 1, i + 1);
    const tanbihMA = slice.reduce((s, t) => s + t.tanbih, 0) / movingWindow;
    const fathMA = slice.reduce((s, t) => s + t.fath, 0) / movingWindow;
    movingAverage.push({
      period: timeline[i].period,
      tanbihMA: Number(tanbihMA.toFixed(2)),
      fathMA: Number(fathMA.toFixed(2)),
      totalMA: Number((tanbihMA + fathMA).toFixed(2)),
    });
  }
  return {
    student: {
      _id: student.id,
      studentId: student.studentId,
      nameEn: student.nameEn,
      nameBn: student.nameBn ?? '',
      class: student.class,
      supervision: student.supervision,
    },
    dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
    overallSummary: {
      totalEntries,
      avgTanbih: totalEntries > 0 ? Number((totalTanbih / totalEntries).toFixed(2)) : 0,
      avgFath: totalEntries > 0 ? Number((totalFath / totalEntries).toFixed(2)) : 0,
      avgMistakes: totalEntries > 0 ? Number((totalMistakes / totalEntries).toFixed(2)) : 0,
      testCompletionRate: Number(testCompletionRate.toFixed(2)),
      trend,
      improvementRate: Number(improvementRate.toFixed(2)),
    },
    byTestType: {
      new: { avgTanbih: newCount ? Number((newAvg / 2 / newCount).toFixed(2)) : 0, avgFath: newCount ? Number((newAvg / 2 / newCount).toFixed(2)) : 0, trend: 'stable' },
      recent: { avgTanbih: recentCount ? Number((recentAvg / 2 / recentCount).toFixed(2)) : 0, avgFath: recentCount ? Number((recentAvg / 2 / recentCount).toFixed(2)) : 0, trend: 'stable' },
      older: { avgTanbih: olderCount ? Number((olderAvg / 2 / olderCount).toFixed(2)) : 0, avgFath: olderCount ? Number((olderAvg / 2 / olderCount).toFixed(2)) : 0, trend: 'stable' },
    },
    timeline,
    movingAverage,
  };
};

export const getStudentContentReport = async (
  studentId: string,
  filters: TQuranReportFiltersExtended,
): Promise<IStudentContentReport> => {
  const student = await QuranStudent.findById(studentId);
  if (!student) throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  const dateRange = getDateRange(filters);
  const minTests = filters.minTests ?? 2;
  const entries = await QuranEntry.find({
    student: new Types.ObjectId(studentId),
    reportDate: { $gte: dateRange.start, $lte: dateRange.end },
  })
    .sort({ reportDate: -1 })
    .lean();
  const entryDocs = entries as unknown as IQuranEntryDocument[];
  const surahMap = new Map<
    number,
    { tanbih: number[]; fath: number[]; dates: string[]; name: string }
  >();
  const juzMap = new Map<number, { tanbih: number[]; fath: number[] }>();
  const pushTest = (
    type: 'surah' | 'juz',
    key: number,
    tanbih: number,
    fath: number,
    date: string,
    surahName?: string,
  ) => {
    if (type === 'surah') {
      if (!surahMap.has(key)) surahMap.set(key, { tanbih: [], fath: [], dates: [], name: surahName ?? '' });
      const s = surahMap.get(key)!;
      s.tanbih.push(tanbih);
      s.fath.push(fath);
      s.dates.push(date);
    } else {
      if (!juzMap.has(key)) juzMap.set(key, { tanbih: [], fath: [] });
      const j = juzMap.get(key)!;
      j.tanbih.push(tanbih);
      j.fath.push(fath);
    }
  };
  for (const e of entryDocs) {
    const dateStr = new Date(e.reportDate).toISOString().slice(0, 10);
    for (const test of [e.newTest, e.recentTest, e.olderTest] as Array<typeof e.newTest>) {
      if (!test?.given) continue;
      const c = test.content;
      if (c?.type === 'surah' && c.surahNumber) {
        pushTest('surah', c.surahNumber, test.tanbih ?? 0, test.fath ?? 0, dateStr, c.surahName);
      } else if (c?.type === 'juz' && c.juzNumber) {
        pushTest('juz', c.juzNumber, test.tanbih ?? 0, test.fath ?? 0, dateStr);
      }
    }
  }
  const surahAll: IStudentContentReport['surahAnalysis']['all'] = [];
  for (const [num, v] of surahMap.entries()) {
    if (v.tanbih.length < minTests) continue;
    const surah = getSurahByNumber(num);
    const avgTanbih = v.tanbih.reduce((a, b) => a + b, 0) / v.tanbih.length;
    const avgFath = v.fath.reduce((a, b) => a + b, 0) / v.fath.length;
    const avgMistakes = avgTanbih + avgFath;
    surahAll.push({
      surahNumber: num,
      surahName: surah?.nameEnglish ?? v.name ?? `Surah ${num}`,
      testsCount: v.tanbih.length,
      avgTanbih: Number(avgTanbih.toFixed(2)),
      avgFath: Number(avgFath.toFixed(2)),
      avgMistakes: Number(avgMistakes.toFixed(2)),
      latestTest: v.dates[0] ?? '',
      trend: 'stable',
    });
  }
  surahAll.sort((a, b) => a.avgMistakes - b.avgMistakes);
  const strongSurah = surahAll.slice(0, Math.ceil(surahAll.length / 2));
  const weakSurah = surahAll.slice(Math.ceil(surahAll.length / 2)).map((s) => ({ ...s, recommendation: 'Needs more revision' }));
  const juzAll: IStudentContentReport['juzAnalysis']['all'] = [];
  for (const [num, v] of juzMap.entries()) {
    if (v.tanbih.length < minTests) continue;
    const avgTanbih = v.tanbih.reduce((a, b) => a + b, 0) / v.tanbih.length;
    const avgFath = v.fath.reduce((a, b) => a + b, 0) / v.fath.length;
    juzAll.push({
      juzNumber: num,
      testsCount: v.tanbih.length,
      avgTanbih: Number(avgTanbih.toFixed(2)),
      avgFath: Number(avgFath.toFixed(2)),
      avgMistakes: Number((avgTanbih + avgFath).toFixed(2)),
    });
  }
  juzAll.sort((a, b) => a.avgMistakes - b.avgMistakes);
  const strongJuz = juzAll.slice(0, Math.ceil(juzAll.length / 2));
  const weakJuz = juzAll.slice(Math.ceil(juzAll.length / 2));
  const recommendations: IStudentContentReport['recommendations'] = [];
  for (const s of weakSurah) {
    recommendations.push({ type: 'revision_needed', content: `Surah ${s.surahName} needs revision`, priority: 'high', basedOn: `Avg ${s.avgMistakes} mistakes in ${s.testsCount} tests` });
  }
  const studentPojo: IQuranStudent = {
    _id: student.id,
    studentId: student.studentId,
    nameEn: student.nameEn,
    nameBn: student.nameBn,
    class: student.class,
    supervision: student.supervision,
    active: student.active,
    notes: student.notes,
    photo: student.photo,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
  return {
    student: studentPojo,
    dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
    surahAnalysis: { strong: strongSurah, weak: weakSurah, all: surahAll },
    juzAnalysis: { strong: strongJuz, weak: weakJuz, all: juzAll },
    recommendations,
  };
};

function buildPerformerRow(d: {
  student: { _id: string | Types.ObjectId; studentId: number; nameEn: string; nameBn?: string; class: string };
  testsCount: number;
  avgTanbih: number;
  avgFath: number;
  avgMistakes: number;
  latestTanbih?: number;
  latestFath?: number;
}): IPerformerRow {
  return {
    student: {
      _id: typeof d.student._id === 'string' ? d.student._id : String(d.student._id),
      studentId: d.student.studentId,
      nameEn: d.student.nameEn,
      nameBn: d.student.nameBn ?? '',
      class: d.student.class,
    },
    testsCount: d.testsCount,
    avgTanbih: d.avgTanbih,
    avgFath: d.avgFath,
    avgMistakes: d.avgMistakes,
    latestScore: { tanbih: d.latestTanbih ?? 0, fath: d.latestFath ?? 0 },
  };
}

export const getSurahAnalysisReport = async (filters: TQuranReportFiltersExtended): Promise<ISurahAnalysisReport> => {
  const dateRange = getDateRange(filters);
  const testType = filters.testType ?? 'all';
  const limit = Math.min(filters.limit ?? 10, 50);
  const query: Record<string, unknown> = { reportDate: { $gte: dateRange.start, $lte: dateRange.end } };
  if (filters.surahNumber) {
    query.$or = [
      { 'newTest.content.surahNumber': filters.surahNumber },
      { 'recentTest.content.surahNumber': filters.surahNumber },
      { 'olderTest.content.surahNumber': filters.surahNumber },
    ];
  }
  const entries = await QuranEntry.find(query).populate('student').lean();
  const byStudent = new Map<
    string,
    { student: IQuranStudent & { _id: string }; tanbih: number[]; fath: number[]; lastTanbih: number; lastFath: number }
  >();
  for (const e of entries as unknown as IQuranEntryDocument[]) {
    const pop = e.student as unknown as { _id: Types.ObjectId; studentId: number; nameEn: string; nameBn?: string; class: string; supervision?: boolean };
    if (!pop) continue;
    if (filters.class && pop.class !== filters.class) continue;
    const sid = String(pop._id);
    const tests = [e.newTest, e.recentTest, e.olderTest];
    for (const t of tests) {
      if (!t?.given) continue;
      if (testType !== 'all' && testType === 'new' && t !== e.newTest) continue;
      if (testType === 'recent' && t !== e.recentTest) continue;
      if (testType === 'older' && t !== e.olderTest) continue;
      const c = t.content;
      if (c?.type !== 'surah' || !c.surahNumber) continue;
      if (filters.surahNumber && c.surahNumber !== filters.surahNumber) continue;
      if (!byStudent.has(sid)) {
        byStudent.set(sid, {
          student: { _id: sid, studentId: pop.studentId, nameEn: pop.nameEn, nameBn: pop.nameBn, class: pop.class, supervision: pop.supervision ?? false, active: true },
          tanbih: [],
          fath: [],
          lastTanbih: 0,
          lastFath: 0,
        });
      }
      const row = byStudent.get(sid)!;
      row.tanbih.push(t.tanbih ?? 0);
      row.fath.push(t.fath ?? 0);
      row.lastTanbih = t.tanbih ?? 0;
      row.lastFath = t.fath ?? 0;
    }
  }
  const performersList: IPerformerRow[] = [];
  for (const [, row] of byStudent) {
    const n = row.tanbih.length;
    if (n === 0) continue;
    const avgTanbih = row.tanbih.reduce((a, b) => a + b, 0) / n;
    const avgFath = row.fath.reduce((a, b) => a + b, 0) / n;
    performersList.push(
      buildPerformerRow({
        student: row.student,
        testsCount: n,
        avgTanbih: Number(avgTanbih.toFixed(2)),
        avgFath: Number(avgFath.toFixed(2)),
        avgMistakes: Number((avgTanbih + avgFath).toFixed(2)),
        latestTanbih: row.lastTanbih,
        latestFath: row.lastFath,
      }),
    );
  }
  performersList.sort((a, b) => a.avgMistakes - b.avgMistakes);
  const top = performersList.slice(0, limit);
  const worst = performersList.slice(-limit).reverse();
  const surahOverview: ISurahAnalysisReport['surahOverview'] = filters.surahNumber ? undefined : [];
  const byClass: ISurahAnalysisReport['byClass'] = [];
  return {
    filters: {
      dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
      class: filters.class,
      surahNumber: filters.surahNumber,
      testType,
    },
    surahOverview,
    performers: { top, worst },
    byClass,
  };
};

export const getJuzAnalysisReport = async (filters: TQuranReportFiltersExtended): Promise<IJuzAnalysisReport> => {
  const dateRange = getDateRange(filters);
  const testType = filters.testType ?? 'all';
  const limit = Math.min(filters.limit ?? 10, 50);
  const entries = await QuranEntry.find({
    reportDate: { $gte: dateRange.start, $lte: dateRange.end },
    ...(filters.juzNumber
      ? {
          $or: [
            { 'newTest.content.juzNumber': filters.juzNumber },
            { 'recentTest.content.juzNumber': filters.juzNumber },
            { 'olderTest.content.juzNumber': filters.juzNumber },
          ],
        }
      : {}),
  })
    .populate('student')
    .lean();
  const byStudent = new Map<
    string,
    { student: IQuranStudent & { _id: string }; tanbih: number[]; fath: number[]; lastTanbih: number; lastFath: number }
  >();
  for (const e of entries as unknown as IQuranEntryDocument[]) {
    const pop = e.student as unknown as { _id: Types.ObjectId; studentId: number; nameEn: string; nameBn?: string; class: string };
    if (!pop) continue;
    if (filters.class && (pop as { class?: string }).class !== filters.class) continue;
    const sid = String(pop._id);
    const tests = [e.newTest, e.recentTest, e.olderTest];
    for (const t of tests) {
      if (!t?.given) continue;
      const c = t.content;
      if (c?.type !== 'juz' || !c.juzNumber) continue;
      if (filters.juzNumber && c.juzNumber !== filters.juzNumber) continue;
      if (!byStudent.has(sid)) {
        byStudent.set(sid, {
          student: { _id: sid, studentId: pop.studentId, nameEn: pop.nameEn, nameBn: pop.nameBn, class: (pop as { class: string }).class, supervision: (pop as { supervision?: boolean }).supervision ?? false, active: true },
          tanbih: [],
          fath: [],
          lastTanbih: 0,
          lastFath: 0,
        });
      }
      const row = byStudent.get(sid)!;
      row.tanbih.push(t.tanbih ?? 0);
      row.fath.push(t.fath ?? 0);
      row.lastTanbih = t.tanbih ?? 0;
      row.lastFath = t.fath ?? 0;
    }
  }
  const performersList: IPerformerRow[] = [];
  for (const [, row] of byStudent) {
    const n = row.tanbih.length;
    if (n === 0) continue;
    const avgTanbih = row.tanbih.reduce((a, b) => a + b, 0) / n;
    const avgFath = row.fath.reduce((a, b) => a + b, 0) / n;
    performersList.push(
      buildPerformerRow({
        student: row.student,
        testsCount: n,
        avgTanbih: Number(avgTanbih.toFixed(2)),
        avgFath: Number(avgFath.toFixed(2)),
        avgMistakes: Number((avgTanbih + avgFath).toFixed(2)),
        latestTanbih: row.lastTanbih,
        latestFath: row.lastFath,
      }),
    );
  }
  performersList.sort((a, b) => a.avgMistakes - b.avgMistakes);
  const top = performersList.slice(0, limit);
  const worst = performersList.slice(-limit).reverse();
  return {
    filters: {
      dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
      class: filters.class,
      juzNumber: filters.juzNumber,
      testType,
    },
    juzOverview: undefined,
    performers: { top, worst },
    byClass: [],
  };
};

export const getPerformersReport = async (filters: TQuranReportFiltersExtended): Promise<IPerformersReport> => {
  const dateRange = getDateRange(filters);
  const testType = filters.testType ?? 'all';
  const metric = filters.metric ?? 'total';
  const limit = Math.min(filters.limit ?? 10, 50);
  const pipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
    { $unwind: '$studentDoc' },
    ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
    ...(typeof filters.supervision === 'boolean' ? [{ $match: { 'studentDoc.supervision': filters.supervision } }] : []),
    {
      $group: {
        _id: '$student',
        studentDoc: { $first: '$studentDoc' },
        entriesCount: { $sum: 1 },
        testsGiven: { $sum: '$testsGiven' },
        testsMissed: { $sum: '$testsMissed' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        lastEntry: { $max: '$reportDate' },
        newTanbih: { $sum: { $cond: ['$newTest.given', '$newTest.tanbih', 0] } },
        newFath: { $sum: { $cond: ['$newTest.given', '$newTest.fath', 0] } },
        newGiven: { $sum: { $cond: ['$newTest.given', 1, 0] } },
        recentTanbih: { $sum: { $cond: ['$recentTest.given', '$recentTest.tanbih', 0] } },
        recentFath: { $sum: { $cond: ['$recentTest.given', '$recentTest.fath', 0] } },
        recentGiven: { $sum: { $cond: ['$recentTest.given', 1, 0] } },
        olderTanbih: { $sum: { $cond: ['$olderTest.given', '$olderTest.tanbih', 0] } },
        olderFath: { $sum: { $cond: ['$olderTest.given', '$olderTest.fath', 0] } },
        olderGiven: { $sum: { $cond: ['$olderTest.given', 1, 0] } },
      },
    },
  ];
  const rows = await QuranEntry.aggregate(pipeline);
  type Row = {
    _id: Types.ObjectId;
    studentDoc: { _id: Types.ObjectId; studentId: number; nameEn: string; nameBn?: string; class: string; supervision: boolean };
    entriesCount: number;
    testsGiven: number;
    testsMissed: number;
    totalTanbih: number;
    totalFath: number;
    totalMistakes: number;
    lastEntry: Date;
    newTanbih: number;
    newFath: number;
    newGiven: number;
    recentTanbih: number;
    recentFath: number;
    recentGiven: number;
    olderTanbih: number;
    olderFath: number;
    olderGiven: number;
  };
  type PerformerStudent = {
    _id: string;
    studentId: number;
    nameEn: string;
    nameBn: string;
    class: string;
    supervision: boolean;
  };
  const list: Array<{
    student: PerformerStudent;
    stats: IPerformersReport['topPerformers'][0]['stats'];
    trend: 'improving' | 'declining' | 'stable';
    lastEntry: string;
  }> = [];
  for (const r of rows as Row[]) {
    const possible = r.entriesCount * 3;
    const completionRate = possible > 0 ? (r.testsGiven / possible) * 100 : 0;
    const avgTanbih = r.entriesCount > 0 ? r.totalTanbih / r.entriesCount : 0;
    const avgFath = r.entriesCount > 0 ? r.totalFath / r.entriesCount : 0;
    const avgMistakes = r.entriesCount > 0 ? r.totalMistakes / r.entriesCount : 0;
    const student: PerformerStudent = {
      _id: String(r.studentDoc._id),
      studentId: r.studentDoc.studentId,
      nameEn: r.studentDoc.nameEn,
      nameBn: r.studentDoc.nameBn ?? '',
      class: r.studentDoc.class,
      supervision: r.studentDoc.supervision,
    };
    list.push({
      student,
      stats: {
        entriesCount: r.entriesCount,
        testsGiven: r.testsGiven,
        testsMissed: r.testsMissed,
        totalTanbih: r.totalTanbih,
        totalFath: r.totalFath,
        totalMistakes: r.totalMistakes,
        avgTanbih: Number(avgTanbih.toFixed(2)),
        avgFath: Number(avgFath.toFixed(2)),
        avgMistakes: Number(avgMistakes.toFixed(2)),
        testCompletionRate: Number(completionRate.toFixed(2)),
      },
      trend: 'stable',
      lastEntry: r.lastEntry ? new Date(r.lastEntry).toISOString().slice(0, 10) : '',
    });
  }
  const sortKey = metric === 'tanbih' ? 'avgTanbih' : metric === 'fath' ? 'avgFath' : metric === 'completion_rate' ? 'testCompletionRate' : 'avgMistakes';
  const asc = metric === 'completion_rate';
  list.sort((a, b) => (asc ? (b.stats[sortKey] as number) - (a.stats[sortKey] as number) : (a.stats[sortKey] as number) - (b.stats[sortKey] as number)));
  const topPerformers = list.slice(0, limit).map((item, i) => ({ rank: i + 1, student: item.student, stats: item.stats, trend: item.trend, lastEntry: item.lastEntry }));
  const worstPerformers = list.slice(-limit).reverse().map((item, i) => ({ rank: i + 1, student: item.student, stats: item.stats, trend: item.trend, lastEntry: item.lastEntry }));
  type ByTestTypeItem = { student: IQuranStudent; avgMistakes: number };
  const byTestType = {
    new: { top: [] as ByTestTypeItem[], worst: [] as ByTestTypeItem[] },
    recent: { top: [] as ByTestTypeItem[], worst: [] as ByTestTypeItem[] },
    older: { top: [] as ByTestTypeItem[], worst: [] as ByTestTypeItem[] },
  };
  for (const r of rows as Row[]) {
    const avgNew = r.newGiven > 0 ? (r.newTanbih + r.newFath) / r.newGiven : 0;
    const avgRecent = r.recentGiven > 0 ? (r.recentTanbih + r.recentFath) / r.recentGiven : 0;
    const avgOlder = r.olderGiven > 0 ? (r.olderTanbih + r.olderFath) / r.olderGiven : 0;
    const st: IQuranStudent = {
      _id: String(r.studentDoc._id),
      studentId: r.studentDoc.studentId,
      nameEn: r.studentDoc.nameEn,
      nameBn: r.studentDoc.nameBn ?? '',
      class: r.studentDoc.class,
      supervision: r.studentDoc.supervision,
      active: true,
    };
    byTestType.new.top.push({ student: st, avgMistakes: Number(avgNew.toFixed(2)) });
    byTestType.recent.top.push({ student: st, avgMistakes: Number(avgRecent.toFixed(2)) });
    byTestType.older.top.push({ student: st, avgMistakes: Number(avgOlder.toFixed(2)) });
  }
  byTestType.new.top.sort((a, b) => a.avgMistakes - b.avgMistakes);
  byTestType.new.worst = [...byTestType.new.top].reverse().slice(0, limit);
  byTestType.new.top = byTestType.new.top.slice(0, limit);
  byTestType.recent.top.sort((a, b) => a.avgMistakes - b.avgMistakes);
  byTestType.recent.worst = [...byTestType.recent.top].reverse().slice(0, limit);
  byTestType.recent.top = byTestType.recent.top.slice(0, limit);
  byTestType.older.top.sort((a, b) => a.avgMistakes - b.avgMistakes);
  byTestType.older.worst = [...byTestType.older.top].reverse().slice(0, limit);
  byTestType.older.top = byTestType.older.top.slice(0, limit);
  return {
    filters: {
      dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
      class: filters.class,
      supervision: filters.supervision,
      testType,
      metric,
    },
    topPerformers,
    worstPerformers,
    byTestType,
  };
};

export const getSupervisionDetailedReport = async (
  filters: TQuranReportFiltersExtended,
): Promise<ISupervisionDetailedReport> => {
  const dateRange = getDateRange(filters);
  const groupBy = filters.groupBy ?? 'week';
  const pipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
    { $unwind: '$studentDoc' },
    ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
    {
      $group: {
        _id: { ...getGroupByExpr(groupBy), supervision: '$studentDoc.supervision' },
        reportDate: { $first: '$reportDate' },
        entries: { $sum: 1 },
        studentIds: { $addToSet: '$student' },
        totalTanbih: { $sum: '$totalTanbih' },
        totalFath: { $sum: '$totalFath' },
        totalMistakes: { $sum: '$totalMistakes' },
        testsGiven: { $sum: '$testsGiven' },
        newTanbih: { $sum: { $cond: ['$newTest.given', '$newTest.tanbih', 0] } },
        newFath: { $sum: { $cond: ['$newTest.given', '$newTest.fath', 0] } },
        newGiven: { $sum: { $cond: ['$newTest.given', 1, 0] } },
        recentTanbih: { $sum: { $cond: ['$recentTest.given', '$recentTest.tanbih', 0] } },
        recentFath: { $sum: { $cond: ['$recentTest.given', '$recentTest.fath', 0] } },
        recentGiven: { $sum: { $cond: ['$recentTest.given', 1, 0] } },
        olderTanbih: { $sum: { $cond: ['$olderTest.given', '$olderTest.tanbih', 0] } },
        olderFath: { $sum: { $cond: ['$olderTest.given', '$olderTest.fath', 0] } },
        olderGiven: { $sum: { $cond: ['$olderTest.given', 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1, '_id.month': 1, '_id.day': 1 } },
  ];
  const rows = await QuranEntry.aggregate(pipeline);
  const sup: { entries: number; tanbih: number; fath: number; mistakes: number; testsGiven: number; newGiven: number; newTanbih: number; newFath: number; recentGiven: number; recentTanbih: number; recentFath: number; olderGiven: number; olderTanbih: number; olderFath: number } = { entries: 0, tanbih: 0, fath: 0, mistakes: 0, testsGiven: 0, newGiven: 0, newTanbih: 0, newFath: 0, recentGiven: 0, recentTanbih: 0, recentFath: 0, olderGiven: 0, olderTanbih: 0, olderFath: 0 };
  const unsup = { ...sup };
  const timelineByPeriod = new Map<string, { supervised: { entries: number; tanbih: number; fath: number }; unsupervised: { entries: number; tanbih: number; fath: number } }>();
  for (const r of rows as Array<Record<string, unknown> & { _id: { supervision: boolean; year: number; week?: number; month?: number; day?: number }; reportDate: Date }>) {
    const d = new Date(r.reportDate);
    const key = getPeriodKey(d, groupBy);
    if (r._id.supervision === true) {
      sup.entries += (r.entries as number) ?? 0;
      sup.tanbih += (r.totalTanbih as number) ?? 0;
      sup.fath += (r.totalFath as number) ?? 0;
      sup.mistakes += (r.totalMistakes as number) ?? 0;
      sup.testsGiven += (r.testsGiven as number) ?? 0;
      sup.newGiven += (r.newGiven as number) ?? 0;
      sup.newTanbih += (r.newTanbih as number) ?? 0;
      sup.newFath += (r.newFath as number) ?? 0;
      sup.recentGiven += (r.recentGiven as number) ?? 0;
      sup.recentTanbih += (r.recentTanbih as number) ?? 0;
      sup.recentFath += (r.recentFath as number) ?? 0;
      sup.olderGiven += (r.olderGiven as number) ?? 0;
      sup.olderTanbih += (r.olderTanbih as number) ?? 0;
      sup.olderFath += (r.olderFath as number) ?? 0;
    } else {
      unsup.entries += (r.entries as number) ?? 0;
      unsup.tanbih += (r.totalTanbih as number) ?? 0;
      unsup.fath += (r.totalFath as number) ?? 0;
      unsup.mistakes += (r.totalMistakes as number) ?? 0;
      unsup.testsGiven += (r.testsGiven as number) ?? 0;
      unsup.newGiven += (r.newGiven as number) ?? 0;
      unsup.newTanbih += (r.newTanbih as number) ?? 0;
      unsup.newFath += (r.newFath as number) ?? 0;
      unsup.recentGiven += (r.recentGiven as number) ?? 0;
      unsup.recentTanbih += (r.recentTanbih as number) ?? 0;
      unsup.recentFath += (r.recentFath as number) ?? 0;
      unsup.olderGiven += (r.olderGiven as number) ?? 0;
      unsup.olderTanbih += (r.olderTanbih as number) ?? 0;
      unsup.olderFath += (r.olderFath as number) ?? 0;
    }
    if (!timelineByPeriod.has(key)) timelineByPeriod.set(key, { supervised: { entries: 0, tanbih: 0, fath: 0 }, unsupervised: { entries: 0, tanbih: 0, fath: 0 } });
    const row = timelineByPeriod.get(key)!;
    if (r._id.supervision === true) {
      row.supervised.entries += (r.entries as number) ?? 0;
      row.supervised.tanbih += (r.totalTanbih as number) ?? 0;
      row.supervised.fath += (r.totalFath as number) ?? 0;
    } else {
      row.unsupervised.entries += (r.entries as number) ?? 0;
      row.unsupervised.tanbih += (r.totalTanbih as number) ?? 0;
      row.unsupervised.fath += (r.totalFath as number) ?? 0;
    }
  }
  const supPossible = sup.entries * 3;
  const unsupPossible = unsup.entries * 3;
  const supCompletion = supPossible > 0 ? (sup.testsGiven / supPossible) * 100 : 0;
  const unsupCompletion = unsupPossible > 0 ? (unsup.testsGiven / unsupPossible) * 100 : 0;
  const conclusion =
    supCompletion > 0 || unsupCompletion > 0
      ? `Supervised students: ${supCompletion.toFixed(1)}% completion, avg ${sup.entries > 0 ? (sup.mistakes / sup.entries).toFixed(1) : 0} mistakes/entry. Unsupervised: ${unsupCompletion.toFixed(1)}% completion, avg ${unsup.entries > 0 ? (unsup.mistakes / unsup.entries).toFixed(1) : 0} mistakes/entry.`
      : 'Insufficient data.';
  const timeline = Array.from(timelineByPeriod.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, row]) => ({ period, ...row }));
  return {
    dateRange: { start: dateRange.start.toISOString().slice(0, 10), end: dateRange.end.toISOString().slice(0, 10) },
    summary: {
      supervised: {
        studentCount: 0,
        entryCount: sup.entries,
        avgTanbih: sup.entries > 0 ? Number((sup.tanbih / sup.entries).toFixed(2)) : 0,
        avgFath: sup.entries > 0 ? Number((sup.fath / sup.entries).toFixed(2)) : 0,
        avgMistakes: sup.entries > 0 ? Number((sup.mistakes / sup.entries).toFixed(2)) : 0,
        testCompletionRate: Number(supCompletion.toFixed(2)),
        improvementRate: 0,
      },
      unsupervised: {
        studentCount: 0,
        entryCount: unsup.entries,
        avgTanbih: unsup.entries > 0 ? Number((unsup.tanbih / unsup.entries).toFixed(2)) : 0,
        avgFath: unsup.entries > 0 ? Number((unsup.fath / unsup.entries).toFixed(2)) : 0,
        avgMistakes: unsup.entries > 0 ? Number((unsup.mistakes / unsup.entries).toFixed(2)) : 0,
        testCompletionRate: Number(unsupCompletion.toFixed(2)),
        improvementRate: 0,
      },
      difference: {
        tanbihDiff: Number(((sup.entries > 0 ? sup.tanbih / sup.entries : 0) - (unsup.entries > 0 ? unsup.tanbih / unsup.entries : 0)).toFixed(2)),
        fathDiff: Number(((sup.entries > 0 ? sup.fath / sup.entries : 0) - (unsup.entries > 0 ? unsup.fath / unsup.entries : 0)).toFixed(2)),
        mistakesDiff: Number((((sup.entries > 0 ? sup.mistakes / sup.entries : 0) - (unsup.entries > 0 ? unsup.mistakes / unsup.entries : 0)).toFixed(2))),
        completionRateDiff: Number((supCompletion - unsupCompletion).toFixed(2)),
        conclusion,
      },
    },
    byTestType: {
      new: {
        supervised: { avgTanbih: sup.newGiven > 0 ? Number((sup.newTanbih / sup.newGiven).toFixed(2)) : 0, avgFath: sup.newGiven > 0 ? Number((sup.newFath / sup.newGiven).toFixed(2)) : 0, count: sup.newGiven },
        unsupervised: { avgTanbih: unsup.newGiven > 0 ? Number((unsup.newTanbih / unsup.newGiven).toFixed(2)) : 0, avgFath: unsup.newGiven > 0 ? Number((unsup.newFath / unsup.newGiven).toFixed(2)) : 0, count: unsup.newGiven },
      },
      recent: {
        supervised: { avgTanbih: sup.recentGiven > 0 ? Number((sup.recentTanbih / sup.recentGiven).toFixed(2)) : 0, avgFath: sup.recentGiven > 0 ? Number((sup.recentFath / sup.recentGiven).toFixed(2)) : 0, count: sup.recentGiven },
        unsupervised: { avgTanbih: unsup.recentGiven > 0 ? Number((unsup.recentTanbih / unsup.recentGiven).toFixed(2)) : 0, avgFath: unsup.recentGiven > 0 ? Number((unsup.recentFath / unsup.recentGiven).toFixed(2)) : 0, count: unsup.recentGiven },
      },
      older: {
        supervised: { avgTanbih: sup.olderGiven > 0 ? Number((sup.olderTanbih / sup.olderGiven).toFixed(2)) : 0, avgFath: sup.olderGiven > 0 ? Number((sup.olderFath / sup.olderGiven).toFixed(2)) : 0, count: sup.olderGiven },
        unsupervised: { avgTanbih: unsup.olderGiven > 0 ? Number((unsup.olderTanbih / unsup.olderGiven).toFixed(2)) : 0, avgFath: unsup.olderGiven > 0 ? Number((unsup.olderFath / unsup.olderGiven).toFixed(2)) : 0, count: unsup.olderGiven },
      },
    },
    timeline,
  };
};

/** Progress report (7.2): mastery, improvement velocity, milestones, distribution */
export const getProgressReport = async (
  filters: TQuranProgressFilters,
): Promise<IProgressReport> => {
  const dateRange = getDateRange(filters);
  const startStr = dateRange.start.toISOString().slice(0, 10);
  const endStr = dateRange.end.toISOString().slice(0, 10);

  const studentMatch: Record<string, unknown> = { 'studentDoc.active': true };
  if (filters.class) (studentMatch as Record<string, unknown>)['studentDoc.class'] = filters.class;
  if (filters.studentId) (studentMatch as Record<string, unknown>)['student'] = new Types.ObjectId(filters.studentId);

  const pipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    { $match: studentMatch },
    {
      $group: {
        _id: '$student',
        studentDoc: { $first: '$studentDoc' },
        entries: {
          $push: {
            reportDate: '$reportDate',
            totalTanbih: '$totalTanbih',
            totalFath: '$totalFath',
            totalMistakes: '$totalMistakes',
            testsGiven: '$testsGiven',
          },
        },
      },
    },
    { $match: { $expr: { $gte: [{ $size: '$entries' }, 2] } } },
  ];

  const grouped = await QuranEntry.aggregate<{
    _id: Types.ObjectId;
    studentDoc: IQuranStudent & { _id: Types.ObjectId };
    entries: Array<{
      reportDate: Date;
      totalTanbih: number;
      totalFath: number;
      totalMistakes: number;
      testsGiven: number;
    }>;
  }>(pipeline);

  const students: IProgressReport['students'] = [];
  const improvementLeaderboardData: Array<{
    student: IProgressReport['students'][0]['student'];
    improvementVelocity: number;
    previousAvgMistakes: number;
    currentAvgMistakes: number;
  }> = [];
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  for (const row of grouped) {
    const entries = row.entries as IEntryForProgress[];
    const student = row.studentDoc;
    const masteryScore = calculateMasteryScore(entries);
    const grade = masteryGradeFromScore(masteryScore);
    gradeCounts[grade] += 1;
    const improvementVelocity = calculateImprovementVelocity(entries);
    const sortedByDate = [...entries].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime(),
    );
    const midpoint = Math.floor(sortedByDate.length / 2);
    const firstHalf = sortedByDate.slice(0, midpoint);
    const secondHalf = sortedByDate.slice(midpoint);
    const previousAvgMistakes =
      firstHalf.reduce((s, e) => s + e.totalMistakes, 0) / firstHalf.length;
    const currentAvgMistakes =
      secondHalf.reduce((s, e) => s + e.totalMistakes, 0) / secondHalf.length;
    const trend = computeTrend(
      firstHalf.reduce((s, e) => s + e.totalMistakes, 0) / firstHalf.length,
      secondHalf.reduce((s, e) => s + e.totalMistakes, 0) / secondHalf.length,
    );

    const byMonth = new Map<
      string,
      IEntryForProgress[]
    >();
    for (const e of entries) {
      const month = new Date(e.reportDate).toISOString().slice(0, 7);
      const list = byMonth.get(month) ?? [];
      list.push(e);
      byMonth.set(month, list);
    }
    const monthlyScores: IProgressReport['students'][0]['progress']['monthlyScores'] = Array.from(
      byMonth.entries(),
    )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, monthEntries]) => ({
        month,
        masteryScore: calculateMasteryScore(monthEntries),
        avgMistakes: Number(
          (
            monthEntries.reduce((s, x) => s + x.totalMistakes, 0) / monthEntries.length
          ).toFixed(2),
        ),
      }));

    const milestones: IProgressReport['students'][0]['progress']['milestones'] = [];
    if (grade === 'A' || grade === 'B') {
      const lastEntry = entries.reduce((a, e) =>
        new Date(e.reportDate) > new Date(a.reportDate) ? e : a,
      );
      milestones.push({
        type: 'mastery_level',
        description: `Mastery grade ${grade}`,
        date: new Date(lastEntry.reportDate).toISOString().slice(0, 10),
        value: grade,
      });
    }

    students.push({
      student: {
        _id: String(student._id),
        studentId: student.studentId,
        nameEn: student.nameEn,
        nameBn: student.nameBn,
        class: student.class,
      },
      progress: {
        masteryScore,
        masteryGrade: grade,
        improvementVelocity,
        trend,
        memorization: {
          surahsCompleted: [],
          surahsInProgress: [],
          juzCompleted: [],
          estimatedCompletion: '',
          progressPercentage: 0,
        },
        monthlyScores,
        milestones,
      },
    });
    improvementLeaderboardData.push({
      student: {
        _id: String(student._id),
        studentId: student.studentId,
        nameEn: student.nameEn,
        nameBn: student.nameBn,
        class: student.class,
      },
      improvementVelocity,
      previousAvgMistakes,
      currentAvgMistakes,
    });
  }

  const improvementLeaderboard: IProgressReport['improvementLeaderboard'] = [...improvementLeaderboardData]
    .sort((a, b) => b.improvementVelocity - a.improvementVelocity)
    .slice(0, 20)
    .map((item, i) => ({
      rank: i + 1,
      student: item.student,
      improvementVelocity: item.improvementVelocity,
      previousAvgMistakes: Number(item.previousAvgMistakes.toFixed(2)),
      currentAvgMistakes: Number(item.currentAvgMistakes.toFixed(2)),
    }));

  const studentsImproving = students.filter((s) => s.progress.trend === 'improving').length;
  const studentsDeclining = students.filter((s) => s.progress.trend === 'declining').length;
  const studentsStable = students.filter((s) => s.progress.trend === 'stable').length;

  const summary: IProgressReport['summary'] = {
    totalStudents: students.length,
    avgMasteryScore:
      students.length > 0
        ? Number(
            (
              students.reduce((s, x) => s + x.progress.masteryScore, 0) / students.length
            ).toFixed(1),
          )
        : 0,
    avgImprovementVelocity:
      students.length > 0
        ? Number(
            (
              students.reduce((s, x) => s + x.progress.improvementVelocity, 0) /
              students.length
            ).toFixed(1),
          )
        : 0,
    studentsImproving,
    studentsDeclining,
    studentsStable,
  };

  return {
    filters: {
      dateRange: { start: startStr, end: endStr },
      ...(filters.class && { class: filters.class }),
      ...(filters.studentId && { studentId: filters.studentId }),
    },
    summary,
    students,
    improvementLeaderboard,
    masteryDistribution: gradeCounts,
  };
};

/** Consistency report (7.1): attendance, streaks, calendar, leaderboard */
export const getConsistencyReport = async (
  filters: TQuranConsistencyFilters,
): Promise<IConsistencyReport> => {
  const dateRange = getDateRange(filters);
  const startStr = dateRange.start.toISOString().slice(0, 10);
  const endStr = dateRange.end.toISOString().slice(0, 10);
  const weeksInRange = getAllWeeksInRange(dateRange.start, dateRange.end);
  const minEntries = filters.minEntries ?? 4;

  const studentMatch: Record<string, unknown> = { 'studentDoc.active': true };
  if (filters.class) (studentMatch as Record<string, unknown>)['studentDoc.class'] = filters.class;
  if (filters.studentId) (studentMatch as Record<string, unknown>)['student'] = new Types.ObjectId(filters.studentId);

  const pipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    { $match: studentMatch },
    {
      $group: {
        _id: '$student',
        studentDoc: { $first: '$studentDoc' },
        entries: {
          $push: {
            reportDate: '$reportDate',
            testsGiven: '$testsGiven',
            testsMissed: '$testsMissed',
          },
        },
      },
    },
    { $match: { $expr: { $gte: [{ $size: '$entries' }, minEntries] } } },
  ];

  const grouped = await QuranEntry.aggregate<{
    _id: Types.ObjectId;
    studentDoc: IQuranStudent & { _id: Types.ObjectId };
    entries: Array<{ reportDate: Date; testsGiven: number; testsMissed: number }>;
  }>(pipeline);

  const students: IConsistencyReport['students'] = [];
  const calendarByDate = new Map<string, { count: number; totalTests: number; expected: number }>();
  const oneDayMs = 24 * 60 * 60 * 1000;
  for (let d = dateRange.start.getTime(); d <= dateRange.end.getTime(); d += oneDayMs) {
    calendarByDate.set(new Date(d).toISOString().slice(0, 10), { count: 0, totalTests: 0, expected: 0 });
  }

  for (const row of grouped) {
    const entries = row.entries as Array<{ reportDate: Date; testsGiven: number; testsMissed: number }>;
    const student = row.studentDoc;
    const totalActualEntries = entries.length;
    const totalTestsGiven = entries.reduce((s, e) => s + (e.testsGiven ?? 0), 0);
    const totalTestsPossible = totalActualEntries * 3;
    const attendanceRate = weeksInRange.length > 0
      ? (new Set(entries.map((e) => getWeekStart(new Date(e.reportDate)).toISOString().slice(0, 10))).size / weeksInRange.length) * 100
      : 0;
    const testRegularityScore = totalTestsPossible > 0 ? (totalTestsGiven / totalTestsPossible) * 100 : 0;
    const { currentStreak, longestStreak, consecutiveMissedWeeks } = calculateStreaks(
      entries.map((e) => ({ reportDate: e.reportDate })),
      dateRange.start,
      dateRange.end,
    );
    const weeksWithEntry = new Set(entries.map((e) => getWeekStart(new Date(e.reportDate)).toISOString().slice(0, 10)));
    const missedWeeks = weeksInRange.length - weeksWithEntry.size;
    const lastEntry = entries.length
      ? entries.reduce((a, e) => (new Date(e.reportDate) > new Date(a.reportDate) ? e : a), entries[0])
      : null;
    const lastEntryDate = lastEntry ? new Date(lastEntry.reportDate).toISOString().slice(0, 10) : null;
    const daysSinceLastEntry = lastEntry
      ? Math.floor((dateRange.end.getTime() - new Date(lastEntry.reportDate).getTime()) / oneDayMs)
      : null;

    const weeklyDetail: IConsistencyReport['students'][0]['weeklyDetail'] = weeksInRange.map((weekStart) => {
      const hasEntry = weeksWithEntry.has(weekStart);
      const weekEntries = entries.filter(
        (e) => getWeekStart(new Date(e.reportDate)).toISOString().slice(0, 10) === weekStart,
      );
      const testsGiven = weekEntries.reduce((s, e) => s + (e.testsGiven ?? 0), 0);
      const testsMissed = weekEntries.reduce((s, e) => s + (e.testsMissed ?? 0), 0);
      return { weekStart, hasEntry, testsGiven, testsMissed };
    });

    let status: 'excellent' | 'good' | 'warning' | 'critical' = 'good';
    if (attendanceRate >= 90 && testRegularityScore >= 85 && consecutiveMissedWeeks === 0) status = 'excellent';
    else if (attendanceRate < 50 || testRegularityScore < 50 || consecutiveMissedWeeks >= 3) status = 'critical';
    else if (attendanceRate < 70 || testRegularityScore < 70 || consecutiveMissedWeeks >= 2) status = 'warning';

    entries.forEach((e) => {
      const day = new Date(e.reportDate).toISOString().slice(0, 10);
      const rec = calendarByDate.get(day);
      if (rec) {
        rec.count += 1;
        rec.totalTests += e.testsGiven ?? 0;
        rec.expected += 3;
      }
    });

    students.push({
      student: {
        _id: String(student._id),
        studentId: student.studentId,
        nameEn: student.nameEn,
        nameBn: student.nameBn,
        class: student.class,
      },
      metrics: {
        currentStreak,
        longestStreak,
        attendanceRate: Number(attendanceRate.toFixed(1)),
        testRegularityScore: Number(testRegularityScore.toFixed(1)),
        missedWeeks,
        consecutiveMissedWeeks,
        lastEntryDate,
        daysSinceLastEntry,
      },
      weeklyDetail,
      status,
    });
  }

  const streakLeaderboard: IConsistencyReport['streakLeaderboard'] = [...students]
    .sort((a, b) => b.metrics.currentStreak - a.metrics.currentStreak)
    .slice(0, 20)
    .map((s, i) => ({
      rank: i + 1,
      student: s.student,
      currentStreak: s.metrics.currentStreak,
      longestStreak: s.metrics.longestStreak,
    }));

  const summary = {
    totalStudents: students.length,
    avgAttendanceRate: students.length
      ? Number((students.reduce((s, x) => s + x.metrics.attendanceRate, 0) / students.length).toFixed(1))
      : 0,
    avgTestRegularityScore: students.length
      ? Number((students.reduce((s, x) => s + x.metrics.testRegularityScore, 0) / students.length).toFixed(1))
      : 0,
    studentsWithPerfectAttendance: students.filter((s) => s.metrics.attendanceRate >= 100).length,
    studentsAtRisk: students.filter((s) => s.status === 'critical').length,
  };

  const calendarData: IConsistencyReport['calendarData'] = Array.from(calendarByDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rec]) => ({
      date,
      entriesCount: rec.count,
      status: (rec.count === 0 ? 'missing' : rec.totalTests >= rec.expected * 0.8 ? 'full' : 'partial') as 'full' | 'partial' | 'missing',
    }));

  return {
    filters: {
      dateRange: { start: startStr, end: endStr },
      ...(filters.class && { class: filters.class }),
      ...(filters.studentId && { studentId: filters.studentId }),
      ...(filters.minEntries != null && { minEntries: filters.minEntries }),
    },
    summary,
    students,
    calendarData,
    streakLeaderboard,
  };
};

/** Calculate percentile: 0 = worst, 100 = best (higher score = better position) */
function calculatePercentile(studentScore: number, allScores: number[], higherIsBetter: boolean): number {
  if (allScores.length === 0) return 0;
  const sorted = [...allScores].sort((a, b) => a - b);
  const index = sorted.findIndex((score) => (higherIsBetter ? score >= studentScore : score <= studentScore));
  const pos = index < 0 ? (higherIsBetter ? 0 : sorted.length) : index;
  return higherIsBetter
    ? Math.round((pos / sorted.length) * 100)
    : Math.round((1 - pos / sorted.length) * 100);
}

/** Comparative report (7.3): class rankings, student rankings, peer comparison, ustad effectiveness, distribution */
export const getComparativeReport = async (
  filters: TQuranComparativeFilters,
): Promise<IComparativeReport> => {
  const dateRange = getDateRange(filters);
  const startStr = dateRange.start.toISOString().slice(0, 10);
  const endStr = dateRange.end.toISOString().slice(0, 10);
  const compareBy = filters.compareBy ?? 'all';

  const studentMatch: Record<string, unknown> = { 'studentDoc.active': true };
  if (filters.class) (studentMatch as Record<string, unknown>)['studentDoc.class'] = filters.class;
  if (typeof filters.supervision === 'boolean') (studentMatch as Record<string, unknown>)['studentDoc.supervision'] = filters.supervision;

  const pipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    { $match: studentMatch },
    {
      $group: {
        _id: '$student',
        studentDoc: { $first: '$studentDoc' },
        entries: {
          $push: {
            reportDate: '$reportDate',
            totalTanbih: '$totalTanbih',
            totalFath: '$totalFath',
            totalMistakes: '$totalMistakes',
            testsGiven: '$testsGiven',
          },
        },
      },
    },
    { $match: { $expr: { $gte: [{ $size: '$entries' }, 1] } } },
  ];

  type StudentRow = {
    _id: Types.ObjectId;
    studentDoc: IQuranStudent & { _id: Types.ObjectId };
    entries: IEntryForProgress[];
  };

  const grouped = await QuranEntry.aggregate<StudentRow>(pipeline);

  const studentMetricsList: Array<{
    student: IQuranStudent & { _id: Types.ObjectId };
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    masteryScore: number;
    testCompletionRate: number;
    improvementVelocity: number;
  }> = [];

  for (const row of grouped) {
    const entries = row.entries as IEntryForProgress[];
    const student = row.studentDoc;
    const avgTanbih = entries.length > 0
      ? entries.reduce((s, e) => s + e.totalTanbih, 0) / entries.length
      : 0;
    const avgFath = entries.length > 0
      ? entries.reduce((s, e) => s + e.totalFath, 0) / entries.length
      : 0;
    const avgMistakes = entries.length > 0
      ? entries.reduce((s, e) => s + e.totalMistakes, 0) / entries.length
      : 0;
    const testsPossible = entries.length * 3;
    const testsGiven = entries.reduce((s, e) => s + (e.testsGiven ?? 0), 0);
    const testCompletionRate = testsPossible > 0 ? (testsGiven / testsPossible) * 100 : 0;
    const masteryScore = calculateMasteryScore(entries);
    const improvementVelocity = calculateImprovementVelocity(entries);
    studentMetricsList.push({
      student,
      avgTanbih: Number(avgTanbih.toFixed(2)),
      avgFath: Number(avgFath.toFixed(2)),
      avgMistakes: Number(avgMistakes.toFixed(2)),
      masteryScore,
      testCompletionRate: Number(testCompletionRate.toFixed(2)),
      improvementVelocity,
    });
  }

  const previousPeriodLength = dateRange.end.getTime() - dateRange.start.getTime();
  const previousEnd = new Date(dateRange.start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - previousPeriodLength);

  const previousPipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: previousStart, $lte: previousEnd } } },
    {
      $lookup: {
        from: 'quranstudents',
        localField: 'student',
        foreignField: '_id',
        as: 'studentDoc',
      },
    },
    { $unwind: '$studentDoc' },
    { $match: studentMatch },
    {
      $group: {
        _id: '$student',
        entries: { $push: { reportDate: '$reportDate', totalMistakes: '$totalMistakes' } },
      },
    },
  ];

  const previousGrouped = await QuranEntry.aggregate<{ _id: Types.ObjectId; entries: Array<{ reportDate: Date; totalMistakes: number }> }>(previousPipeline);
  const previousMasteryByStudent = new Map<string, number>();
  for (const row of previousGrouped) {
    const entries = row.entries.map((e) => ({
      reportDate: e.reportDate,
      totalTanbih: 0,
      totalFath: 0,
      totalMistakes: e.totalMistakes,
      testsGiven: 3,
    })) as IEntryForProgress[];
    const score = calculateMasteryScore(entries);
    previousMasteryByStudent.set(String(row._id), score);
  }

  const masteryScores = studentMetricsList.map((m) => m.masteryScore);
  const mistakeScores = studentMetricsList.map((m) => m.avgMistakes);

  const sortedByMastery = [...studentMetricsList].sort((a, b) => b.masteryScore - a.masteryScore);
  const studentRankings: IComparativeReport['studentRankings'] = sortedByMastery.map((m, i) => {
    const rank = i + 1;
    const percentile = masteryScores.length > 0
      ? Math.round((1 - (rank - 1) / masteryScores.length) * 100)
      : 0;
    const prevMastery = previousMasteryByStudent.get(String(m.student._id));
    const prevRanks = prevMastery != null
      ? sortedByMastery.filter((x) => previousMasteryByStudent.get(String(x.student._id)) != null).length
      : 0;
    const prevSorted = [...studentMetricsList]
      .filter((x) => previousMasteryByStudent.has(String(x.student._id)))
      .sort((a, b) => (previousMasteryByStudent.get(String(b.student._id)) ?? 0) - (previousMasteryByStudent.get(String(a.student._id)) ?? 0));
    const prevRank = prevSorted.findIndex((x) => String(x.student._id) === String(m.student._id)) + 1;
    const rankChange = prevRank > 0 ? prevRank - rank : 0;

    const studentPojo: IQuranStudent = {
      _id: String(m.student._id),
      studentId: m.student.studentId,
      nameEn: m.student.nameEn,
      nameBn: m.student.nameBn,
      class: m.student.class,
      supervision: m.student.supervision,
      active: m.student.active ?? true,
    };
    return {
      rank,
      student: studentPojo,
      avgMistakes: m.avgMistakes,
      masteryScore: m.masteryScore,
      percentile,
      rankChange,
    };
  });

  const byClass = new Map<string, typeof studentMetricsList>();
  for (const m of studentMetricsList) {
    const c = m.student.class;
    if (!byClass.has(c)) byClass.set(c, []);
    byClass.get(c)!.push(m);
  }

  const classRankingsData: Array<{
    class: string;
    totalStudents: number;
    avgMistakes: number;
    avgMasteryScore: number;
    topPerformer: typeof studentMetricsList[0];
    mostImproved: typeof studentMetricsList[0];
  }> = [];
  for (const [cls, list] of byClass.entries()) {
    if (filters.class && cls !== filters.class) continue;
    const totalStudents = list.length;
    const avgMistakes = list.length > 0
      ? list.reduce((s, x) => s + x.avgMistakes, 0) / list.length
      : 0;
    const avgMasteryScore = list.length > 0
      ? list.reduce((s, x) => s + x.masteryScore, 0) / list.length
      : 0;
    const topPerformer = list.reduce((a, b) => (a.masteryScore >= b.masteryScore ? a : b));
    const mostImproved = list.reduce((a, b) => (a.improvementVelocity >= b.improvementVelocity ? a : b));
    classRankingsData.push({
      class: cls,
      totalStudents,
      avgMistakes: Number(avgMistakes.toFixed(2)),
      avgMasteryScore: Number(avgMasteryScore.toFixed(1)),
      topPerformer,
      mostImproved,
    });
  }
  classRankingsData.sort((a, b) => b.avgMasteryScore - a.avgMasteryScore);
  const classRankings: IComparativeReport['classRankings'] = classRankingsData.map((row, i) => ({
    class: row.class,
    rank: i + 1,
    totalStudents: row.totalStudents,
    avgMistakes: row.avgMistakes,
    avgMasteryScore: row.avgMasteryScore,
    topPerformer: {
      _id: String(row.topPerformer.student._id),
      studentId: row.topPerformer.student.studentId,
      nameEn: row.topPerformer.student.nameEn,
      nameBn: row.topPerformer.student.nameBn,
      class: row.topPerformer.student.class,
      supervision: row.topPerformer.student.supervision,
      active: row.topPerformer.student.active ?? true,
    },
    mostImproved: {
      _id: String(row.mostImproved.student._id),
      studentId: row.mostImproved.student.studentId,
      nameEn: row.mostImproved.student.nameEn,
      nameBn: row.mostImproved.student.nameBn,
      class: row.mostImproved.student.class,
      supervision: row.mostImproved.student.supervision,
      active: row.mostImproved.student.active ?? true,
    },
  }));

  let peerComparison: IComparativeReport['peerComparison'];
  if (filters.studentId) {
    const target = studentMetricsList.find((m) => String(m.student._id) === filters.studentId);
    if (target) {
      const targetClass = target.student.class;
      const classMates = studentMetricsList.filter((m) => m.student.class === targetClass);
      const classAvgTanbih = classMates.length > 0
        ? classMates.reduce((s, x) => s + x.avgTanbih, 0) / classMates.length
        : 0;
      const classAvgFath = classMates.length > 0
        ? classMates.reduce((s, x) => s + x.avgFath, 0) / classMates.length
        : 0;
      const classAvgMastery = classMates.length > 0
        ? classMates.reduce((s, x) => s + x.masteryScore, 0) / classMates.length
        : 0;
      const classAvgCompletion = classMates.length > 0
        ? classMates.reduce((s, x) => s + x.testCompletionRate, 0) / classMates.length
        : 0;
      const topQuartileList = [...classMates].sort((a, b) => b.masteryScore - a.masteryScore).slice(0, Math.max(1, Math.ceil(classMates.length / 4)));
      const topQuartile = {
        avgTanbih: topQuartileList.length > 0 ? topQuartileList.reduce((s, x) => s + x.avgTanbih, 0) / topQuartileList.length : 0,
        avgFath: topQuartileList.length > 0 ? topQuartileList.reduce((s, x) => s + x.avgFath, 0) / topQuartileList.length : 0,
        masteryScore: topQuartileList.length > 0 ? topQuartileList.reduce((s, x) => s + x.masteryScore, 0) / topQuartileList.length : 0,
      };
      const vsTanbihAvg = classAvgTanbih > 0 ? Number((((classAvgTanbih - target.avgTanbih) / classAvgTanbih) * 100).toFixed(1)) : 0;
      const vsFathAvg = classAvgFath > 0 ? Number((((classAvgFath - target.avgFath) / classAvgFath) * 100).toFixed(1)) : 0;
      const vsMasteryAvg = classAvgMastery > 0 ? Number(((target.masteryScore - classAvgMastery) / classAvgMastery * 100).toFixed(1)) : 0;
      const vsCompletionAvg = classAvgCompletion > 0 ? Number(((target.testCompletionRate - classAvgCompletion) / classAvgCompletion * 100).toFixed(1)) : 0;
      const classSortedByMastery = [...classMates].sort((a, b) => b.masteryScore - a.masteryScore);
      const targetRankInClass = classSortedByMastery.findIndex((x) => String(x.student._id) === filters.studentId) + 1;
      const percentileInClass = classMates.length > 0 ? Math.round((1 - (targetRankInClass - 1) / classMates.length) * 100) : 0;
      let overallPosition: string;
      if (percentileInClass >= 90) overallPosition = 'Top 10%';
      else if (percentileInClass >= 75) overallPosition = 'Top 25%';
      else if (percentileInClass >= 50) overallPosition = 'Above Average';
      else if (percentileInClass >= 25) overallPosition = 'Below Average';
      else overallPosition = 'Needs Improvement';
      peerComparison = {
        targetStudent: {
          _id: String(target.student._id),
          metrics: {
            avgTanbih: target.avgTanbih,
            avgFath: target.avgFath,
            masteryScore: target.masteryScore,
            testCompletionRate: target.testCompletionRate,
          },
        },
        classAverage: {
          avgTanbih: Number(classAvgTanbih.toFixed(2)),
          avgFath: Number(classAvgFath.toFixed(2)),
          masteryScore: Number(classAvgMastery.toFixed(1)),
          testCompletionRate: Number(classAvgCompletion.toFixed(2)),
        },
        topQuartile: {
          avgTanbih: Number(topQuartile.avgTanbih.toFixed(2)),
          avgFath: Number(topQuartile.avgFath.toFixed(2)),
          masteryScore: Number(topQuartile.masteryScore.toFixed(1)),
        },
        comparison: {
          vsTanbihAvg,
          vsFathAvg,
          vsMasteryAvg,
          vsCompletionAvg,
          overallPosition,
        },
      };
    }
  }

  const ustadPipeline: PipelineStage[] = [
    { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    ...(filters.class || typeof filters.supervision === 'boolean'
      ? [
          { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
          { $unwind: '$studentDoc' },
          ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
          ...(typeof filters.supervision === 'boolean' ? [{ $match: { 'studentDoc.supervision': filters.supervision } }] : []),
        ]
      : []),
    {
      $group: {
        _id: { ustad: { $ifNull: ['$ustadName', '(Unspecified)'] }, student: '$student' },
        totalMistakes: { $sum: '$totalMistakes' },
        testsGiven: { $sum: '$testsGiven' },
        entriesCount: { $sum: 1 },
        entries: { $push: { reportDate: '$reportDate', totalMistakes: '$totalMistakes', testsGiven: '$testsGiven' } },
      },
    },
    {
      $group: {
        _id: '$_id.ustad',
        studentsCount: { $addToSet: '$_id.student' },
        entriesCount: { $sum: '$entriesCount' },
        studentMistakes: { $push: { totalMistakes: '$totalMistakes', entriesCount: '$entriesCount', entries: '$entries', testsGiven: '$testsGiven' } },
      },
    },
  ];
  const ustadRows = await QuranEntry.aggregate(ustadPipeline as PipelineStage[]);
  const ustadComparison: IComparativeReport['ustadComparison'] = [];
  for (const ur of ustadRows as Array<{
    _id: string;
    studentsCount: unknown[];
    entriesCount: number;
    studentMistakes: Array<{ totalMistakes: number; entriesCount: number; entries: unknown[]; testsGiven: number }>;
  }>) {
    const studentsCount = ur.studentsCount?.length ?? 0;
    const entriesCount = ur.entriesCount ?? 0;
    const possibleTests = entriesCount * 3;
    const testsGiven = ur.studentMistakes.reduce((s, x) => s + (x.testsGiven ?? 0), 0);
    const testCompletionRate = possibleTests > 0 ? (testsGiven / possibleTests) * 100 : 0;
    const avgStudentMistakes = ur.studentMistakes.length > 0
      ? ur.studentMistakes.reduce((s, x) => s + (x.totalMistakes / (x.entriesCount || 1)), 0) / ur.studentMistakes.length
      : 0;
    const improvements: number[] = [];
    for (const sm of ur.studentMistakes) {
      const entries = (sm.entries as Array<{ reportDate: Date; totalMistakes: number }>).sort(
        (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime(),
      );
      if (entries.length >= 2) {
        const mid = Math.floor(entries.length / 2);
        const firstAvg = entries.slice(0, mid).reduce((s, e) => s + e.totalMistakes, 0) / mid;
        const secondAvg = entries.slice(mid).reduce((s, e) => s + e.totalMistakes, 0) / (entries.length - mid);
        if (firstAvg > 0) improvements.push(((firstAvg - secondAvg) / firstAvg) * 100);
      }
    }
    const avgStudentImprovement = improvements.length > 0 ? improvements.reduce((a, b) => a + b, 0) / improvements.length : 0;
    let effectiveness: 'high' | 'medium' | 'low' = 'medium';
    if (avgStudentImprovement > 10 && testCompletionRate >= 70) effectiveness = 'high';
    else if (avgStudentImprovement < -5 || testCompletionRate < 50) effectiveness = 'low';
    ustadComparison.push({
      ustadName: ur._id,
      studentsCount,
      entriesCount,
      avgStudentMistakes: Number(avgStudentMistakes.toFixed(2)),
      avgStudentImprovement: Number(avgStudentImprovement.toFixed(1)),
      testCompletionRate: Number(testCompletionRate.toFixed(2)),
      effectiveness,
    });
  }
  ustadComparison.sort((a, b) => b.avgStudentImprovement - a.avgStudentImprovement);

  const mistakeBuckets = ['0-2', '2-5', '5-10', '10-20', '20+'];
  const masteryBuckets = ['0-60', '60-70', '70-80', '80-90', '90-100'];
  const mistakesHistogram = mistakeBuckets.map((range) => {
    const [lo, hi] = range === '20+' ? [20, 999] : range.split('-').map(Number);
    const count = studentMetricsList.filter((m) => (hi === 999 ? m.avgMistakes >= lo : m.avgMistakes >= lo && m.avgMistakes < hi)).length;
    return { range, count };
  });
  const masteryHistogram = masteryBuckets.map((range) => {
    const [lo, hi] = range.split('-').map(Number);
    const count = studentMetricsList.filter((m) => m.masteryScore >= lo && (hi === 100 ? m.masteryScore <= 100 : m.masteryScore < hi)).length;
    return { range, count };
  });

  return {
    filters: {
      dateRange: { start: startStr, end: endStr },
      ...(filters.class && { class: filters.class }),
      ...(filters.studentId && { studentId: filters.studentId }),
      compareBy,
    },
    classRankings,
    studentRankings,
    peerComparison,
    ustadComparison,
    distribution: { mistakesHistogram, masteryHistogram },
  };
};

export const QuranReportsServices = {
  getOverallReport,
  getWeeklySummary,
  getWeeklySupervisionComparison,
  getClassBreakdown,
  getStudentReport,
  getSupervisionComparison,
  getUstadSummary,
  getTestTypeAnalysisReport,
  getTimeAnalysisReport,
  getStudentTrendReport,
  getStudentContentReport,
  getSurahAnalysisReport,
  getJuzAnalysisReport,
  getPerformersReport,
  getSupervisionDetailedReport,
  getConsistencyReport,
  getProgressReport,
  getComparativeReport,
};
