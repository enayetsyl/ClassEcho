// src/app/modules/quran/reports/quran-reports.service.ts

import { Types } from 'mongoose';
import { QuranEntry } from '../entry/quran-entry.model';
import { QuranStudent } from '../student/quran-student.model';
import { IQuranEntryDocument } from '../entry/quran-entry.model';
import {
  TQuranReportFilters,
  IQuranOverallReport,
  IQuranWeeklySummary,
  IQuranWeeklyTrendReport,
  IQuranWeeklySupervisionReport,
  IQuranWeeklySupervisionRow,
  IQuranClassBreakdown,
  IQuranStudentReport,
  IQuranSupervisionComparison,
  IQuranUstadSummary,
  IQuranUstadSummaryItem,
} from './quran-reports.type';
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

  const byWeekRows = await QuranEntry.aggregate(pipeline);

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

/** Weekly comparison: supervised vs unsupervised Fath and Tanbih per week */
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
          supervision: '$studentDoc.supervision',
        },
        reportDate: { $first: '$reportDate' },
        totalFath: { $sum: '$totalFath' },
        totalTanbih: { $sum: '$totalTanbih' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ];

  const rows = await QuranEntry.aggregate(pipeline);

  const byWeekKey = new Map<
    string,
    {
      weekStart: Date;
      supervised: { fath: number; tanbih: number };
      nonSupervised: { fath: number; tanbih: number };
    }
  >();

  for (const row of rows as Array<{
    _id: { year: number; week: number; supervision: boolean };
    reportDate: Date;
    totalFath: number;
    totalTanbih: number;
  }>) {
    const d = new Date(row.reportDate);
    const weekStart = getWeekStart(d);
    const key = weekStart.toISOString().slice(0, 10);
    const existing = byWeekKey.get(key);
    const fath = row.totalFath ?? 0;
    const tanbih = row.totalTanbih ?? 0;
    if (row._id.supervision === true) {
      if (existing) {
        existing.supervised.fath += fath;
        existing.supervised.tanbih += tanbih;
      } else {
        byWeekKey.set(key, {
          weekStart,
          supervised: { fath, tanbih },
          nonSupervised: { fath: 0, tanbih: 0 },
        });
      }
    } else {
      if (existing) {
        existing.nonSupervised.fath += fath;
        existing.nonSupervised.tanbih += tanbih;
      } else {
        byWeekKey.set(key, {
          weekStart,
          supervised: { fath: 0, tanbih: 0 },
          nonSupervised: { fath, tanbih },
        });
      }
    }
  }

  const result: IQuranWeeklySupervisionRow[] = Array.from(byWeekKey.entries())
    .map(([, v]) => ({
      weekStart: v.weekStart,
      weekEnd: getWeekEnd(v.weekStart),
      supervised: { totalFath: v.supervised.fath, totalTanbih: v.supervised.tanbih },
      nonSupervised: { totalFath: v.nonSupervised.fath, totalTanbih: v.nonSupervised.tanbih },
    }))
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

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

  const result = await QuranEntry.aggregate(pipeline);
  return result.map((r: Record<string, unknown>) => ({
    class: r.class,
    studentCount: r.studentCount,
    entryCount: r.entryCount,
    avgTanbih: Number((r.avgTanbih ?? 0).toFixed(2)),
    avgFath: Number((r.avgFath ?? 0).toFixed(2)),
    avgTotalMistakes: Number((r.avgTotalMistakes ?? 0).toFixed(2)),
    testCompletionRate: Number((r.testCompletionRate ?? 0).toFixed(2)),
  }));
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

  const result = await QuranEntry.aggregate(pipeline);
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

  const result = await QuranEntry.aggregate(pipeline);
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

export const QuranReportsServices = {
  getOverallReport,
  getWeeklySummary,
  getWeeklySupervisionComparison,
  getClassBreakdown,
  getStudentReport,
  getSupervisionComparison,
  getUstadSummary,
};
