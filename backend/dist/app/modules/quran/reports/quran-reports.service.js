"use strict";
// src/app/modules/quran/reports/quran-reports.service.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranReportsServices = exports.getComparativeReport = exports.getConsistencyReport = exports.getProgressReport = exports.getSupervisionDetailedReport = exports.getPerformersReport = exports.getJuzAnalysisReport = exports.getSurahAnalysisReport = exports.getStudentContentReport = exports.getStudentTrendReport = exports.getTimeAnalysisReport = exports.getTestTypeAnalysisReport = exports.getUstadSummary = exports.getSupervisionComparison = exports.getStudentReport = exports.getClassBreakdown = exports.getWeeklySupervisionComparison = exports.getWeeklySummary = exports.getOverallReport = void 0;
const mongoose_1 = require("mongoose");
const quran_entry_model_1 = require("../entry/quran-entry.model");
const quran_student_model_1 = require("../student/quran-student.model");
const surah_data_1 = require("../reference/surah-data");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
/** Get date range for report (default: last 365 days when no filter) */
function getDateRange(filters) {
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
function buildFilterStages(filters, dateRange) {
    const stages = [
        { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
    ];
    if (filters.class || typeof filters.supervision === 'boolean' || filters.studentId) {
        stages.push({ $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } }, { $unwind: '$studentDoc' });
        if (filters.studentId)
            stages.push({ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } });
        if (filters.class)
            stages.push({ $match: { 'studentDoc.class': filters.class } });
        if (typeof filters.supervision === 'boolean')
            stages.push({ $match: { 'studentDoc.supervision': filters.supervision } });
    }
    return stages;
}
/** Get period key for grouping (day: YYYY-MM-DD, week: start of week ISO, month: YYYY-MM) */
function getPeriodKey(d, groupBy) {
    if (groupBy === 'day')
        return d.toISOString().slice(0, 10);
    if (groupBy === 'month')
        return d.toISOString().slice(0, 7);
    const weekStart = getWeekStart(d);
    return weekStart.toISOString().slice(0, 10);
}
/** Compute trend from first-half vs second-half average */
function computeTrend(firstAvg, secondAvg) {
    if (firstAvg <= 0)
        return 'stable';
    const pct = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (pct < -5)
        return 'improving';
    if (pct > 5)
        return 'declining';
    return 'stable';
}
const getOverallReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const dateRange = getDateRange(filters);
    const [totalStudents, activeCount, aggResult] = yield Promise.all([
        quran_student_model_1.QuranStudent.countDocuments(),
        quran_student_model_1.QuranStudent.countDocuments({ active: true }),
        quran_entry_model_1.QuranEntry.aggregate([
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
                        ? [{ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } }]
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
            totalTestsGiven: (_a = r.totalTestsGiven) !== null && _a !== void 0 ? _a : 0,
            totalTestsMissed: (_b = r.totalTestsMissed) !== null && _b !== void 0 ? _b : 0,
            totalTanbih: (_c = r.totalTanbih) !== null && _c !== void 0 ? _c : 0,
            totalFath: (_d = r.totalFath) !== null && _d !== void 0 ? _d : 0,
            totalMistakes: (_e = r.totalMistakes) !== null && _e !== void 0 ? _e : 0,
            avgMistakesPerStudent,
        },
        byTestType: {
            new: { tanbih: (_f = r.newTanbih) !== null && _f !== void 0 ? _f : 0, fath: (_g = r.newFath) !== null && _g !== void 0 ? _g : 0, givenCount: (_h = r.newGiven) !== null && _h !== void 0 ? _h : 0 },
            recent: {
                tanbih: (_j = r.recentTanbih) !== null && _j !== void 0 ? _j : 0,
                fath: (_k = r.recentFath) !== null && _k !== void 0 ? _k : 0,
                givenCount: (_l = r.recentGiven) !== null && _l !== void 0 ? _l : 0,
            },
            older: { tanbih: (_m = r.olderTanbih) !== null && _m !== void 0 ? _m : 0, fath: (_o = r.olderFath) !== null && _o !== void 0 ? _o : 0, givenCount: (_p = r.olderGiven) !== null && _p !== void 0 ? _p : 0 },
        },
    };
});
exports.getOverallReport = getOverallReport;
/** Get start of week (Sunday) for a date */
function getWeekStart(d) {
    const x = new Date(d);
    const day = x.getDay();
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
}
/** Get end of week (Saturday 23:59:59) */
function getWeekEnd(d) {
    const x = new Date(d);
    const day = x.getDay();
    x.setDate(x.getDate() + (6 - day));
    x.setHours(23, 59, 59, 999);
    return x;
}
/** Get all week-start dates (ISO string) in range for consistency report */
function getAllWeeksInRange(start, end) {
    const weeks = [];
    const cur = getWeekStart(new Date(start));
    const endWeek = getWeekStart(new Date(end));
    while (cur.getTime() <= endWeek.getTime()) {
        weeks.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 7);
    }
    return weeks;
}
/** Calculate current streak, longest streak, and consecutive missed weeks from entries */
function calculateStreaks(entries, startDate, endDate) {
    const weekMap = new Set();
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
            if (currentStreak === 0)
                currentStreak = tempStreak;
        }
        else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0;
            if (currentStreak === 0)
                consecutiveMissed += 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    return { currentStreak, longestStreak, consecutiveMissedWeeks: consecutiveMissed };
}
/** Mastery score 0-100 from entries (plan 7.2.3) */
function calculateMasteryScore(entries) {
    if (entries.length === 0)
        return 0;
    const TANBIH_WEIGHT = 0.4;
    const FATH_WEIGHT = 0.6;
    const COMPLETION_WEIGHT = 0.2;
    const maxMistakesPerTest = 20;
    const sorted = [...entries].sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
    let totalScore = 0;
    let totalWeight = 0;
    sorted.forEach((entry, index) => {
        const recencyWeight = 1 + (index / sorted.length) * 0.5;
        const testsGiven = entry.testsGiven || 1;
        const tanbihScore = Math.max(0, 100 - (entry.totalTanbih / testsGiven) * (100 / maxMistakesPerTest));
        const fathScore = Math.max(0, 100 - (entry.totalFath / testsGiven) * (100 / maxMistakesPerTest));
        const completionBonus = (entry.testsGiven / 3) * 100;
        const entryScore = tanbihScore * TANBIH_WEIGHT +
            fathScore * FATH_WEIGHT +
            completionBonus * COMPLETION_WEIGHT;
        totalScore += entryScore * recencyWeight;
        totalWeight += recencyWeight;
    });
    return Math.round(totalScore / totalWeight);
}
/** Improvement velocity (% change per month; negative = fewer mistakes = improving) */
function calculateImprovementVelocity(entries) {
    if (entries.length < 4)
        return 0;
    const sorted = [...entries].sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);
    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.totalMistakes, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.totalMistakes, 0) / secondHalf.length;
    if (firstHalfAvg === 0)
        return 0;
    const velocity = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * -100;
    return Math.round(velocity * 10) / 10;
}
function masteryGradeFromScore(score) {
    if (score >= 90)
        return 'A';
    if (score >= 80)
        return 'B';
    if (score >= 70)
        return 'C';
    if (score >= 60)
        return 'D';
    return 'F';
}
const getWeeklySummary = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const dateRange = getDateRange(filters);
    const pipeline = [
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
                    ? [{ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } }]
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
    const byWeekRows = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const weeks = byWeekRows.map((row) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const d = new Date(row.reportDate);
        const weekStart = getWeekStart(d);
        return {
            weekStart,
            weekEnd: getWeekEnd(weekStart),
            reports: (_a = row.reports) !== null && _a !== void 0 ? _a : 0,
            testsMissed: (_b = row.testsMissed) !== null && _b !== void 0 ? _b : 0,
            totalTanbih: (_c = row.totalTanbih) !== null && _c !== void 0 ? _c : 0,
            totalFath: (_d = row.totalFath) !== null && _d !== void 0 ? _d : 0,
            totalMistakes: (_e = row.totalMistakes) !== null && _e !== void 0 ? _e : 0,
            byTestType: {
                newTanbih: (_f = row.newTanbih) !== null && _f !== void 0 ? _f : 0,
                newFath: (_g = row.newFath) !== null && _g !== void 0 ? _g : 0,
                recentTanbih: (_h = row.recentTanbih) !== null && _h !== void 0 ? _h : 0,
                recentFath: (_j = row.recentFath) !== null && _j !== void 0 ? _j : 0,
                olderTanbih: (_k = row.olderTanbih) !== null && _k !== void 0 ? _k : 0,
                olderFath: (_l = row.olderFath) !== null && _l !== void 0 ? _l : 0,
            },
        };
    });
    // Trend: compare first half vs second half average totalMistakes
    let trend = 'stable';
    let avgMistakesChange = 0;
    if (weeks.length >= 2) {
        const mid = Math.floor(weeks.length / 2);
        const firstHalf = weeks.slice(0, mid);
        const secondHalf = weeks.slice(mid);
        const avgFirst = firstHalf.reduce((s, w) => s + w.totalMistakes, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((s, w) => s + w.totalMistakes, 0) / secondHalf.length;
        if (avgFirst > 0) {
            avgMistakesChange = ((avgSecond - avgFirst) / avgFirst) * 100;
            if (avgMistakesChange < -5)
                trend = 'improving';
            else if (avgMistakesChange > 5)
                trend = 'declining';
        }
    }
    return { weeks, trend, avgMistakesChange };
});
exports.getWeeklySummary = getWeeklySummary;
/** Weekly comparison by class: supervised vs unsupervised Fath and Tanbih per week; includes testsGiven and per-test rates */
const getWeeklySupervisionComparison = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const dateRange = getDateRange(filters);
    const pipeline = [
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
    const rows = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const byClass = new Map();
    for (const row of rows) {
        const className = (_a = row._id.class) !== null && _a !== void 0 ? _a : '(Unspecified)';
        if (!byClass.has(className)) {
            byClass.set(className, new Map());
        }
        const byWeek = byClass.get(className);
        const d = new Date(row.reportDate);
        const weekStart = getWeekStart(d);
        const key = weekStart.toISOString().slice(0, 10);
        const existing = byWeek.get(key);
        const fath = (_b = row.totalFath) !== null && _b !== void 0 ? _b : 0;
        const tanbih = (_c = row.totalTanbih) !== null && _c !== void 0 ? _c : 0;
        const tests = (_d = row.testsGiven) !== null && _d !== void 0 ? _d : 0;
        if (row._id.supervision === true) {
            if (existing) {
                existing.supervised.fath += fath;
                existing.supervised.tanbih += tanbih;
                existing.supervised.testsGiven += tests;
            }
            else {
                byWeek.set(key, {
                    weekStart,
                    supervised: { fath, tanbih, testsGiven: tests },
                    nonSupervised: { fath: 0, tanbih: 0, testsGiven: 0 },
                });
            }
        }
        else {
            if (existing) {
                existing.nonSupervised.fath += fath;
                existing.nonSupervised.tanbih += tanbih;
                existing.nonSupervised.testsGiven += tests;
            }
            else {
                byWeek.set(key, {
                    weekStart,
                    supervised: { fath: 0, tanbih: 0, testsGiven: 0 },
                    nonSupervised: { fath, tanbih, testsGiven: tests },
                });
            }
        }
    }
    const result = [];
    for (const [className, byWeek] of byClass.entries()) {
        const weeks = Array.from(byWeek.entries())
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
                    fathPerTest: nonSupTests > 0 ? Number((v.nonSupervised.fath / nonSupTests).toFixed(2)) : 0,
                    tanbihPerTest: nonSupTests > 0 ? Number((v.nonSupervised.tanbih / nonSupTests).toFixed(2)) : 0,
                },
            };
        })
            .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
        result.push({ class: className, weeks });
    }
    result.sort((a, b) => a.class.localeCompare(b.class));
    return result;
});
exports.getWeeklySupervisionComparison = getWeeklySupervisionComparison;
const getClassBreakdown = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const dateRange = getDateRange(filters);
    const pipeline = [
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
        ...(filters.studentId ? [{ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } }] : []),
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
    const result = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    return result.map((r) => {
        var _a, _b, _c;
        return ({
            class: String((_a = r.class) !== null && _a !== void 0 ? _a : ''),
            studentCount: Number((_b = r.studentCount) !== null && _b !== void 0 ? _b : 0),
            entryCount: Number((_c = r.entryCount) !== null && _c !== void 0 ? _c : 0),
            avgTanbih: Number((Number(r.avgTanbih) || 0).toFixed(2)),
            avgFath: Number((Number(r.avgFath) || 0).toFixed(2)),
            avgTotalMistakes: Number((Number(r.avgTotalMistakes) || 0).toFixed(2)),
            testCompletionRate: Number((Number(r.testCompletionRate) || 0).toFixed(2)),
        });
    });
});
exports.getClassBreakdown = getClassBreakdown;
const getStudentReport = (studentId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    const student = yield quran_student_model_1.QuranStudent.findById(studentId);
    if (!student) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    }
    const dateRange = getDateRange(filters);
    const query = {
        student: new mongoose_1.Types.ObjectId(studentId),
        reportDate: { $gte: dateRange.start, $lte: dateRange.end },
    };
    const entries = yield quran_entry_model_1.QuranEntry.find(query).sort({ reportDate: -1 }).populate('student').lean();
    const entryDocs = entries;
    const totalEntries = entryDocs.length;
    const totalTanbih = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.totalTanbih) !== null && _a !== void 0 ? _a : 0); }, 0);
    const totalFath = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.totalFath) !== null && _a !== void 0 ? _a : 0); }, 0);
    const totalMistakes = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.totalMistakes) !== null && _a !== void 0 ? _a : 0); }, 0);
    const testsGiven = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.testsGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
    const possibleTests = totalEntries * 3;
    const testCompletionRate = possibleTests > 0 ? (testsGiven / possibleTests) * 100 : 0;
    // Weekly trend for this student
    const byWeek = new Map();
    for (const e of entryDocs) {
        const d = new Date(e.reportDate);
        const weekStart = getWeekStart(d);
        const key = weekStart.toISOString().slice(0, 10);
        const existing = byWeek.get(key);
        const byTestType = {
            newTanbih: ((_a = e.newTest) === null || _a === void 0 ? void 0 : _a.given) ? ((_b = e.newTest.tanbih) !== null && _b !== void 0 ? _b : 0) : 0,
            newFath: ((_c = e.newTest) === null || _c === void 0 ? void 0 : _c.given) ? ((_d = e.newTest.fath) !== null && _d !== void 0 ? _d : 0) : 0,
            recentTanbih: ((_e = e.recentTest) === null || _e === void 0 ? void 0 : _e.given) ? ((_f = e.recentTest.tanbih) !== null && _f !== void 0 ? _f : 0) : 0,
            recentFath: ((_g = e.recentTest) === null || _g === void 0 ? void 0 : _g.given) ? ((_h = e.recentTest.fath) !== null && _h !== void 0 ? _h : 0) : 0,
            olderTanbih: ((_j = e.olderTest) === null || _j === void 0 ? void 0 : _j.given) ? ((_k = e.olderTest.tanbih) !== null && _k !== void 0 ? _k : 0) : 0,
            olderFath: ((_l = e.olderTest) === null || _l === void 0 ? void 0 : _l.given) ? ((_m = e.olderTest.fath) !== null && _m !== void 0 ? _m : 0) : 0,
        };
        if (existing) {
            existing.reports += 1;
            existing.testsMissed += (_o = e.testsMissed) !== null && _o !== void 0 ? _o : 0;
            existing.totalMistakes += (_p = e.totalMistakes) !== null && _p !== void 0 ? _p : 0;
            existing.totalTanbih += (_q = e.totalTanbih) !== null && _q !== void 0 ? _q : 0;
            existing.totalFath += (_r = e.totalFath) !== null && _r !== void 0 ? _r : 0;
            existing.byTestType.newTanbih += byTestType.newTanbih;
            existing.byTestType.newFath += byTestType.newFath;
            existing.byTestType.recentTanbih += byTestType.recentTanbih;
            existing.byTestType.recentFath += byTestType.recentFath;
            existing.byTestType.olderTanbih += byTestType.olderTanbih;
            existing.byTestType.olderFath += byTestType.olderFath;
        }
        else {
            byWeek.set(key, {
                reports: 1,
                testsMissed: (_s = e.testsMissed) !== null && _s !== void 0 ? _s : 0,
                totalMistakes: (_t = e.totalMistakes) !== null && _t !== void 0 ? _t : 0,
                totalTanbih: (_u = e.totalTanbih) !== null && _u !== void 0 ? _u : 0,
                totalFath: (_v = e.totalFath) !== null && _v !== void 0 ? _v : 0,
                byTestType,
            });
        }
    }
    const weeklyTrend = Array.from(byWeek.entries())
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
    const harf = [];
    const ghunna = [];
    const madd = [];
    const other = [];
    for (const e of entryDocs) {
        const t = e.tajweedNotes;
        if ((_w = t === null || t === void 0 ? void 0 : t.harf) === null || _w === void 0 ? void 0 : _w.trim())
            harf.push(t.harf.trim());
        if ((_x = t === null || t === void 0 ? void 0 : t.ghunna) === null || _x === void 0 ? void 0 : _x.trim())
            ghunna.push(t.ghunna.trim());
        if ((_y = t === null || t === void 0 ? void 0 : t.madd) === null || _y === void 0 ? void 0 : _y.trim())
            madd.push(t.madd.trim());
        if ((_z = t === null || t === void 0 ? void 0 : t.other) === null || _z === void 0 ? void 0 : _z.trim())
            other.push(t.other.trim());
    }
    const studentPojo = {
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
        entries: entryDocs.map((doc) => (Object.assign(Object.assign({}, doc), { _id: doc.id, student: doc.student }))),
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
});
exports.getStudentReport = getStudentReport;
const getSupervisionComparison = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const dateRange = getDateRange(filters);
    const pipeline = [
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
        ...(filters.studentId ? [{ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } }] : []),
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
    const result = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const supervised = result.find((r) => r._id === true);
    const nonSupervised = result.find((r) => r._id === false);
    const toGroup = (r) => {
        var _a, _b, _c, _d, _e;
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
        const entryCount = (_a = r.entryCount) !== null && _a !== void 0 ? _a : 0;
        const studentCount = Array.isArray(r.studentIds) ? r.studentIds.length : 0;
        const totalMistakes = (_b = r.totalMistakes) !== null && _b !== void 0 ? _b : 0;
        const testsGiven = (_c = r.testsGiven) !== null && _c !== void 0 ? _c : 0;
        const possible = entryCount * 3;
        return {
            studentCount,
            entryCount,
            totalTanbih: (_d = r.totalTanbih) !== null && _d !== void 0 ? _d : 0,
            totalFath: (_e = r.totalFath) !== null && _e !== void 0 ? _e : 0,
            totalMistakes,
            avgMistakesPerEntry: entryCount > 0 ? totalMistakes / entryCount : 0,
            testCompletionRate: possible > 0 ? (testsGiven / possible) * 100 : 0,
        };
    };
    return {
        supervised: toGroup(supervised),
        nonSupervised: toGroup(nonSupervised),
    };
});
exports.getSupervisionComparison = getSupervisionComparison;
const getUstadSummary = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const dateRange = getDateRange(filters);
    const pipeline = [
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
                    ? [{ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } }]
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
    const result = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    return result.map((r) => {
        var _a, _b;
        return ({
            ustadName: r.ustadName,
            entryCount: r.entryCount,
            studentCount: r.studentCount,
            totalTanbih: r.totalTanbih,
            totalFath: r.totalFath,
            totalMistakes: r.totalMistakes,
            avgMistakesPerEntry: Number(((_a = r.avgMistakesPerEntry) !== null && _a !== void 0 ? _a : 0).toFixed(2)),
            testCompletionRate: Number(((_b = r.testCompletionRate) !== null && _b !== void 0 ? _b : 0).toFixed(2)),
        });
    });
});
exports.getUstadSummary = getUstadSummary;
// ---------- Phase 2: New Report Endpoints ----------
function getGroupByExpr(groupBy) {
    if (groupBy === 'day')
        return { year: { $year: '$reportDate' }, month: { $month: '$reportDate' }, day: { $dayOfMonth: '$reportDate' } };
    if (groupBy === 'month')
        return { year: { $year: '$reportDate' }, month: { $month: '$reportDate' } };
    return { year: { $year: '$reportDate' }, week: { $week: '$reportDate' } };
}
const getTestTypeAnalysisReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dateRange = getDateRange(filters);
    const groupBy = (_a = filters.groupBy) !== null && _a !== void 0 ? _a : 'week';
    const pipeline = [
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
    const periodRows = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const totalEntries = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.entries) !== null && _a !== void 0 ? _a : 0); }, 0);
    const totalPossible = totalEntries * 3;
    const newGiven = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.newGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
    const recentGiven = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.recentGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
    const olderGiven = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.olderGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
    const newTanbih = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.newTanbih) !== null && _a !== void 0 ? _a : 0); }, 0);
    const newFath = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.newFath) !== null && _a !== void 0 ? _a : 0); }, 0);
    const recentTanbih = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.recentTanbih) !== null && _a !== void 0 ? _a : 0); }, 0);
    const recentFath = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.recentFath) !== null && _a !== void 0 ? _a : 0); }, 0);
    const olderTanbih = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.olderTanbih) !== null && _a !== void 0 ? _a : 0); }, 0);
    const olderFath = periodRows.reduce((s, r) => { var _a; return s + ((_a = r.olderFath) !== null && _a !== void 0 ? _a : 0); }, 0);
    const studentIds = yield quran_entry_model_1.QuranEntry.distinct('student', Object.assign({ reportDate: { $gte: dateRange.start, $lte: dateRange.end } }, (filters.studentId ? { student: new mongoose_1.Types.ObjectId(filters.studentId) } : {})));
    const totalStudents = studentIds.length;
    const toMetrics = (given, tanbih, fath, possible) => ({
        givenCount: given,
        missedCount: possible - given,
        totalTanbih: tanbih,
        totalFath: fath,
        avgTanbih: given > 0 ? Number((tanbih / given).toFixed(2)) : 0,
        avgFath: given > 0 ? Number((fath / given).toFixed(2)) : 0,
        completionRate: possible > 0 ? Number(((given / possible) * 100).toFixed(2)) : 0,
    });
    const timeline = periodRows.map((r) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const d = new Date(r.reportDate);
        const period = getPeriodKey(d, groupBy);
        return {
            period,
            new: { tanbih: (_a = r.newTanbih) !== null && _a !== void 0 ? _a : 0, fath: (_b = r.newFath) !== null && _b !== void 0 ? _b : 0, given: (_c = r.newGiven) !== null && _c !== void 0 ? _c : 0 },
            recent: { tanbih: (_d = r.recentTanbih) !== null && _d !== void 0 ? _d : 0, fath: (_e = r.recentFath) !== null && _e !== void 0 ? _e : 0, given: (_f = r.recentGiven) !== null && _f !== void 0 ? _f : 0 },
            older: { tanbih: (_g = r.olderTanbih) !== null && _g !== void 0 ? _g : 0, fath: (_h = r.olderFath) !== null && _h !== void 0 ? _h : 0, given: (_j = r.olderGiven) !== null && _j !== void 0 ? _j : 0 },
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
});
exports.getTestTypeAnalysisReport = getTestTypeAnalysisReport;
const getTimeAnalysisReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    const dateRange = getDateRange(filters);
    const granularity = (_a = filters.granularity) !== null && _a !== void 0 ? _a : 'week';
    const testType = (_b = filters.testType) !== null && _b !== void 0 ? _b : 'all';
    const pipeline = [
        { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
        { $unwind: '$studentDoc' },
        ...(filters.studentId ? [{ $match: { student: new mongoose_1.Types.ObjectId(filters.studentId) } }] : []),
        ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
        ...(typeof filters.supervision === 'boolean' ? [{ $match: { 'studentDoc.supervision': filters.supervision } }] : []),
        {
            $group: {
                _id: Object.assign(Object.assign({}, getGroupByExpr(granularity)), { supervision: '$studentDoc.supervision' }),
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
    const rows = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const byPeriod = new Map();
    for (const r of rows) {
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
        row.entries += (_c = r.entries) !== null && _c !== void 0 ? _c : 0;
        for (const id of (_d = r.studentIds) !== null && _d !== void 0 ? _d : [])
            row.students.add(id);
        row.testsGiven += (_e = r.testsGiven) !== null && _e !== void 0 ? _e : 0;
        row.testsMissed += (_f = r.testsMissed) !== null && _f !== void 0 ? _f : 0;
        row.totalTanbih += (_g = r.totalTanbih) !== null && _g !== void 0 ? _g : 0;
        row.totalFath += (_h = r.totalFath) !== null && _h !== void 0 ? _h : 0;
        row.totalMistakes += (_j = r.totalMistakes) !== null && _j !== void 0 ? _j : 0;
        row.newTanbih += (_k = r.newTanbih) !== null && _k !== void 0 ? _k : 0;
        row.newFath += (_l = r.newFath) !== null && _l !== void 0 ? _l : 0;
        row.newGiven += (_m = r.newGiven) !== null && _m !== void 0 ? _m : 0;
        row.recentTanbih += (_o = r.recentTanbih) !== null && _o !== void 0 ? _o : 0;
        row.recentFath += (_p = r.recentFath) !== null && _p !== void 0 ? _p : 0;
        row.recentGiven += (_q = r.recentGiven) !== null && _q !== void 0 ? _q : 0;
        row.olderTanbih += (_r = r.olderTanbih) !== null && _r !== void 0 ? _r : 0;
        row.olderFath += (_s = r.olderFath) !== null && _s !== void 0 ? _s : 0;
        row.olderGiven += (_t = r.olderGiven) !== null && _t !== void 0 ? _t : 0;
        if (r._id.supervision === true) {
            row.supEntries += (_u = r.entries) !== null && _u !== void 0 ? _u : 0;
            row.supTanbih += (_v = r.totalTanbih) !== null && _v !== void 0 ? _v : 0;
            row.supFath += (_w = r.totalFath) !== null && _w !== void 0 ? _w : 0;
        }
        else {
            row.unsupEntries += (_x = r.entries) !== null && _x !== void 0 ? _x : 0;
            row.unsupTanbih += (_y = r.totalTanbih) !== null && _y !== void 0 ? _y : 0;
            row.unsupFath += (_z = r.totalFath) !== null && _z !== void 0 ? _z : 0;
        }
    }
    const data = Array.from(byPeriod.entries())
        .sort((a, b) => a[1].periodStart.getTime() - b[1].periodStart.getTime())
        .map(([period, row]) => {
        const testsGiven = row.testsGiven;
        const testsMissed = row.testsMissed;
        let tanbih = row.totalTanbih, fath = row.totalFath;
        if (testType === 'new') {
            tanbih = row.newTanbih;
            fath = row.newFath;
        }
        else if (testType === 'recent') {
            tanbih = row.recentTanbih;
            fath = row.recentFath;
        }
        else if (testType === 'older') {
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
    const avg = (arr, key) => {
        const sum = arr.reduce((s, d) => { var _a; return s + ((_a = d.metrics[key]) !== null && _a !== void 0 ? _a : 0); }, 0);
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
});
exports.getTimeAnalysisReport = getTimeAnalysisReport;
const getStudentTrendReport = (studentId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    const student = yield quran_student_model_1.QuranStudent.findById(studentId);
    if (!student)
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    const dateRange = getDateRange(filters);
    const granularity = (_a = filters.granularity) !== null && _a !== void 0 ? _a : 'week';
    const entries = yield quran_entry_model_1.QuranEntry.find({
        student: new mongoose_1.Types.ObjectId(studentId),
        reportDate: { $gte: dateRange.start, $lte: dateRange.end },
    })
        .sort({ reportDate: 1 })
        .lean();
    const entryDocs = entries;
    const totalEntries = entryDocs.length;
    const totalTanbih = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.totalTanbih) !== null && _a !== void 0 ? _a : 0); }, 0);
    const totalFath = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.totalFath) !== null && _a !== void 0 ? _a : 0); }, 0);
    const totalMistakes = totalTanbih + totalFath;
    const testsGiven = entryDocs.reduce((s, e) => { var _a; return s + ((_a = e.testsGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
    const possibleTests = totalEntries * 3;
    const testCompletionRate = possibleTests > 0 ? (testsGiven / possibleTests) * 100 : 0;
    const byPeriod = new Map();
    for (const e of entryDocs) {
        const d = new Date(e.reportDate);
        const key = getPeriodKey(d, granularity);
        const periodStart = granularity === 'day' ? d : granularity === 'month' ? new Date(d.getFullYear(), d.getMonth(), 1) : getWeekStart(d);
        if (!byPeriod.has(key)) {
            byPeriod.set(key, { tanbih: 0, fath: 0, total: 0, testsGiven: 0, testsMissed: 0, entries: [] });
        }
        const row = byPeriod.get(key);
        row.tanbih += (_b = e.totalTanbih) !== null && _b !== void 0 ? _b : 0;
        row.fath += (_c = e.totalFath) !== null && _c !== void 0 ? _c : 0;
        row.total += e.totalTanbih + e.totalFath;
        row.testsGiven += (_d = e.testsGiven) !== null && _d !== void 0 ? _d : 0;
        row.testsMissed += (_e = e.testsMissed) !== null && _e !== void 0 ? _e : 0;
        row.entries.push({
            date: new Date(e.reportDate).toISOString().slice(0, 10),
            newTest: { tanbih: ((_f = e.newTest) === null || _f === void 0 ? void 0 : _f.given) ? ((_g = e.newTest.tanbih) !== null && _g !== void 0 ? _g : 0) : 0, fath: ((_h = e.newTest) === null || _h === void 0 ? void 0 : _h.given) ? ((_j = e.newTest.fath) !== null && _j !== void 0 ? _j : 0) : 0 },
            recentTest: { tanbih: ((_k = e.recentTest) === null || _k === void 0 ? void 0 : _k.given) ? ((_l = e.recentTest.tanbih) !== null && _l !== void 0 ? _l : 0) : 0, fath: ((_m = e.recentTest) === null || _m === void 0 ? void 0 : _m.given) ? ((_o = e.recentTest.fath) !== null && _o !== void 0 ? _o : 0) : 0 },
            olderTest: { tanbih: ((_p = e.olderTest) === null || _p === void 0 ? void 0 : _p.given) ? ((_q = e.olderTest.tanbih) !== null && _q !== void 0 ? _q : 0) : 0, fath: ((_r = e.olderTest) === null || _r === void 0 ? void 0 : _r.given) ? ((_s = e.olderTest.fath) !== null && _s !== void 0 ? _s : 0) : 0 },
        });
    }
    const timeline = Array.from(byPeriod.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([period, row]) => (Object.assign({ period }, row)));
    const half = Math.floor(timeline.length / 2);
    const firstHalfAvg = half > 0 ? timeline.slice(0, half).reduce((s, t) => s + t.total, 0) / half : 0;
    const secondHalfAvg = timeline.length - half > 0 ? timeline.slice(half).reduce((s, t) => s + t.total, 0) / (timeline.length - half) : 0;
    const trend = computeTrend(firstHalfAvg, secondHalfAvg);
    const improvementRate = firstHalfAvg > 0 ? (((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100) : 0;
    const newAvg = entryDocs.filter((e) => { var _a; return (_a = e.newTest) === null || _a === void 0 ? void 0 : _a.given; }).reduce((s, e) => { var _a, _b; return s + ((_a = e.newTest.tanbih) !== null && _a !== void 0 ? _a : 0) + ((_b = e.newTest.fath) !== null && _b !== void 0 ? _b : 0); }, 0);
    const newCount = entryDocs.filter((e) => { var _a; return (_a = e.newTest) === null || _a === void 0 ? void 0 : _a.given; }).length;
    const recentAvg = entryDocs.filter((e) => { var _a; return (_a = e.recentTest) === null || _a === void 0 ? void 0 : _a.given; }).reduce((s, e) => { var _a, _b; return s + ((_a = e.recentTest.tanbih) !== null && _a !== void 0 ? _a : 0) + ((_b = e.recentTest.fath) !== null && _b !== void 0 ? _b : 0); }, 0);
    const recentCount = entryDocs.filter((e) => { var _a; return (_a = e.recentTest) === null || _a === void 0 ? void 0 : _a.given; }).length;
    const olderAvg = entryDocs.filter((e) => { var _a; return (_a = e.olderTest) === null || _a === void 0 ? void 0 : _a.given; }).reduce((s, e) => { var _a, _b; return s + ((_a = e.olderTest.tanbih) !== null && _a !== void 0 ? _a : 0) + ((_b = e.olderTest.fath) !== null && _b !== void 0 ? _b : 0); }, 0);
    const olderCount = entryDocs.filter((e) => { var _a; return (_a = e.olderTest) === null || _a === void 0 ? void 0 : _a.given; }).length;
    const movingWindow = 4;
    const movingAverage = [];
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
            nameBn: (_t = student.nameBn) !== null && _t !== void 0 ? _t : '',
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
});
exports.getStudentTrendReport = getStudentTrendReport;
const getStudentContentReport = (studentId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const student = yield quran_student_model_1.QuranStudent.findById(studentId);
    if (!student)
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Quran student not found');
    const dateRange = getDateRange(filters);
    const minTests = (_a = filters.minTests) !== null && _a !== void 0 ? _a : 2;
    const entries = yield quran_entry_model_1.QuranEntry.find({
        student: new mongoose_1.Types.ObjectId(studentId),
        reportDate: { $gte: dateRange.start, $lte: dateRange.end },
    })
        .sort({ reportDate: -1 })
        .lean();
    const entryDocs = entries;
    const surahMap = new Map();
    const juzMap = new Map();
    const pushTest = (type, key, tanbih, fath, date, surahName) => {
        if (type === 'surah') {
            if (!surahMap.has(key))
                surahMap.set(key, { tanbih: [], fath: [], dates: [], name: surahName !== null && surahName !== void 0 ? surahName : '' });
            const s = surahMap.get(key);
            s.tanbih.push(tanbih);
            s.fath.push(fath);
            s.dates.push(date);
        }
        else {
            if (!juzMap.has(key))
                juzMap.set(key, { tanbih: [], fath: [] });
            const j = juzMap.get(key);
            j.tanbih.push(tanbih);
            j.fath.push(fath);
        }
    };
    for (const e of entryDocs) {
        const dateStr = new Date(e.reportDate).toISOString().slice(0, 10);
        for (const test of [e.newTest, e.recentTest, e.olderTest]) {
            if (!(test === null || test === void 0 ? void 0 : test.given))
                continue;
            const c = test.content;
            if ((c === null || c === void 0 ? void 0 : c.type) === 'surah' && c.surahNumber) {
                pushTest('surah', c.surahNumber, (_b = test.tanbih) !== null && _b !== void 0 ? _b : 0, (_c = test.fath) !== null && _c !== void 0 ? _c : 0, dateStr, c.surahName);
            }
            else if ((c === null || c === void 0 ? void 0 : c.type) === 'juz' && c.juzNumber) {
                pushTest('juz', c.juzNumber, (_d = test.tanbih) !== null && _d !== void 0 ? _d : 0, (_e = test.fath) !== null && _e !== void 0 ? _e : 0, dateStr);
            }
        }
    }
    const surahAll = [];
    for (const [num, v] of surahMap.entries()) {
        if (v.tanbih.length < minTests)
            continue;
        const surah = (0, surah_data_1.getSurahByNumber)(num);
        const avgTanbih = v.tanbih.reduce((a, b) => a + b, 0) / v.tanbih.length;
        const avgFath = v.fath.reduce((a, b) => a + b, 0) / v.fath.length;
        const avgMistakes = avgTanbih + avgFath;
        surahAll.push({
            surahNumber: num,
            surahName: (_g = (_f = surah === null || surah === void 0 ? void 0 : surah.nameEnglish) !== null && _f !== void 0 ? _f : v.name) !== null && _g !== void 0 ? _g : `Surah ${num}`,
            testsCount: v.tanbih.length,
            avgTanbih: Number(avgTanbih.toFixed(2)),
            avgFath: Number(avgFath.toFixed(2)),
            avgMistakes: Number(avgMistakes.toFixed(2)),
            latestTest: (_h = v.dates[0]) !== null && _h !== void 0 ? _h : '',
            trend: 'stable',
        });
    }
    surahAll.sort((a, b) => a.avgMistakes - b.avgMistakes);
    const strongSurah = surahAll.slice(0, Math.ceil(surahAll.length / 2));
    const weakSurah = surahAll.slice(Math.ceil(surahAll.length / 2)).map((s) => (Object.assign(Object.assign({}, s), { recommendation: 'Needs more revision' })));
    const juzAll = [];
    for (const [num, v] of juzMap.entries()) {
        if (v.tanbih.length < minTests)
            continue;
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
    const recommendations = [];
    for (const s of weakSurah) {
        recommendations.push({ type: 'revision_needed', content: `Surah ${s.surahName} needs revision`, priority: 'high', basedOn: `Avg ${s.avgMistakes} mistakes in ${s.testsCount} tests` });
    }
    const studentPojo = {
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
});
exports.getStudentContentReport = getStudentContentReport;
function buildPerformerRow(d) {
    var _a, _b, _c;
    return {
        student: {
            _id: typeof d.student._id === 'string' ? d.student._id : String(d.student._id),
            studentId: d.student.studentId,
            nameEn: d.student.nameEn,
            nameBn: (_a = d.student.nameBn) !== null && _a !== void 0 ? _a : '',
            class: d.student.class,
        },
        testsCount: d.testsCount,
        avgTanbih: d.avgTanbih,
        avgFath: d.avgFath,
        avgMistakes: d.avgMistakes,
        latestScore: { tanbih: (_b = d.latestTanbih) !== null && _b !== void 0 ? _b : 0, fath: (_c = d.latestFath) !== null && _c !== void 0 ? _c : 0 },
    };
}
const getSurahAnalysisReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const dateRange = getDateRange(filters);
    const testType = (_a = filters.testType) !== null && _a !== void 0 ? _a : 'all';
    const limit = Math.min((_b = filters.limit) !== null && _b !== void 0 ? _b : 10, 50);
    const query = { reportDate: { $gte: dateRange.start, $lte: dateRange.end } };
    if (filters.surahNumber) {
        query.$or = [
            { 'newTest.content.surahNumber': filters.surahNumber },
            { 'recentTest.content.surahNumber': filters.surahNumber },
            { 'olderTest.content.surahNumber': filters.surahNumber },
        ];
    }
    const entries = yield quran_entry_model_1.QuranEntry.find(query).populate('student').lean();
    const byStudent = new Map();
    for (const e of entries) {
        const pop = e.student;
        if (!pop)
            continue;
        if (filters.class && pop.class !== filters.class)
            continue;
        const sid = String(pop._id);
        const tests = [e.newTest, e.recentTest, e.olderTest];
        for (const t of tests) {
            if (!(t === null || t === void 0 ? void 0 : t.given))
                continue;
            if (testType !== 'all' && testType === 'new' && t !== e.newTest)
                continue;
            if (testType === 'recent' && t !== e.recentTest)
                continue;
            if (testType === 'older' && t !== e.olderTest)
                continue;
            const c = t.content;
            if ((c === null || c === void 0 ? void 0 : c.type) !== 'surah' || !c.surahNumber)
                continue;
            if (filters.surahNumber && c.surahNumber !== filters.surahNumber)
                continue;
            if (!byStudent.has(sid)) {
                byStudent.set(sid, {
                    student: { _id: sid, studentId: pop.studentId, nameEn: pop.nameEn, nameBn: pop.nameBn, class: pop.class, supervision: (_c = pop.supervision) !== null && _c !== void 0 ? _c : false, active: true },
                    tanbih: [],
                    fath: [],
                    lastTanbih: 0,
                    lastFath: 0,
                });
            }
            const row = byStudent.get(sid);
            row.tanbih.push((_d = t.tanbih) !== null && _d !== void 0 ? _d : 0);
            row.fath.push((_e = t.fath) !== null && _e !== void 0 ? _e : 0);
            row.lastTanbih = (_f = t.tanbih) !== null && _f !== void 0 ? _f : 0;
            row.lastFath = (_g = t.fath) !== null && _g !== void 0 ? _g : 0;
        }
    }
    const performersList = [];
    for (const [, row] of byStudent) {
        const n = row.tanbih.length;
        if (n === 0)
            continue;
        const avgTanbih = row.tanbih.reduce((a, b) => a + b, 0) / n;
        const avgFath = row.fath.reduce((a, b) => a + b, 0) / n;
        performersList.push(buildPerformerRow({
            student: row.student,
            testsCount: n,
            avgTanbih: Number(avgTanbih.toFixed(2)),
            avgFath: Number(avgFath.toFixed(2)),
            avgMistakes: Number((avgTanbih + avgFath).toFixed(2)),
            latestTanbih: row.lastTanbih,
            latestFath: row.lastFath,
        }));
    }
    performersList.sort((a, b) => a.avgMistakes - b.avgMistakes);
    const top = performersList.slice(0, limit);
    const worst = performersList.slice(-limit).reverse();
    const surahOverview = filters.surahNumber ? undefined : [];
    const byClass = [];
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
});
exports.getSurahAnalysisReport = getSurahAnalysisReport;
const getJuzAnalysisReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const dateRange = getDateRange(filters);
    const testType = (_a = filters.testType) !== null && _a !== void 0 ? _a : 'all';
    const limit = Math.min((_b = filters.limit) !== null && _b !== void 0 ? _b : 10, 50);
    const entries = yield quran_entry_model_1.QuranEntry.find(Object.assign({ reportDate: { $gte: dateRange.start, $lte: dateRange.end } }, (filters.juzNumber
        ? {
            $or: [
                { 'newTest.content.juzNumber': filters.juzNumber },
                { 'recentTest.content.juzNumber': filters.juzNumber },
                { 'olderTest.content.juzNumber': filters.juzNumber },
            ],
        }
        : {})))
        .populate('student')
        .lean();
    const byStudent = new Map();
    for (const e of entries) {
        const pop = e.student;
        if (!pop)
            continue;
        if (filters.class && pop.class !== filters.class)
            continue;
        const sid = String(pop._id);
        const tests = [e.newTest, e.recentTest, e.olderTest];
        for (const t of tests) {
            if (!(t === null || t === void 0 ? void 0 : t.given))
                continue;
            const c = t.content;
            if ((c === null || c === void 0 ? void 0 : c.type) !== 'juz' || !c.juzNumber)
                continue;
            if (filters.juzNumber && c.juzNumber !== filters.juzNumber)
                continue;
            if (!byStudent.has(sid)) {
                byStudent.set(sid, {
                    student: { _id: sid, studentId: pop.studentId, nameEn: pop.nameEn, nameBn: pop.nameBn, class: pop.class, supervision: (_c = pop.supervision) !== null && _c !== void 0 ? _c : false, active: true },
                    tanbih: [],
                    fath: [],
                    lastTanbih: 0,
                    lastFath: 0,
                });
            }
            const row = byStudent.get(sid);
            row.tanbih.push((_d = t.tanbih) !== null && _d !== void 0 ? _d : 0);
            row.fath.push((_e = t.fath) !== null && _e !== void 0 ? _e : 0);
            row.lastTanbih = (_f = t.tanbih) !== null && _f !== void 0 ? _f : 0;
            row.lastFath = (_g = t.fath) !== null && _g !== void 0 ? _g : 0;
        }
    }
    const performersList = [];
    for (const [, row] of byStudent) {
        const n = row.tanbih.length;
        if (n === 0)
            continue;
        const avgTanbih = row.tanbih.reduce((a, b) => a + b, 0) / n;
        const avgFath = row.fath.reduce((a, b) => a + b, 0) / n;
        performersList.push(buildPerformerRow({
            student: row.student,
            testsCount: n,
            avgTanbih: Number(avgTanbih.toFixed(2)),
            avgFath: Number(avgFath.toFixed(2)),
            avgMistakes: Number((avgTanbih + avgFath).toFixed(2)),
            latestTanbih: row.lastTanbih,
            latestFath: row.lastFath,
        }));
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
});
exports.getJuzAnalysisReport = getJuzAnalysisReport;
const getPerformersReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const dateRange = getDateRange(filters);
    const testType = (_a = filters.testType) !== null && _a !== void 0 ? _a : 'all';
    const metric = (_b = filters.metric) !== null && _b !== void 0 ? _b : 'total';
    const limit = Math.min((_c = filters.limit) !== null && _c !== void 0 ? _c : 10, 50);
    const pipeline = [
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
    const rows = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const list = [];
    for (const r of rows) {
        const possible = r.entriesCount * 3;
        const completionRate = possible > 0 ? (r.testsGiven / possible) * 100 : 0;
        const avgTanbih = r.entriesCount > 0 ? r.totalTanbih / r.entriesCount : 0;
        const avgFath = r.entriesCount > 0 ? r.totalFath / r.entriesCount : 0;
        const avgMistakes = r.entriesCount > 0 ? r.totalMistakes / r.entriesCount : 0;
        const student = {
            _id: String(r.studentDoc._id),
            studentId: r.studentDoc.studentId,
            nameEn: r.studentDoc.nameEn,
            nameBn: (_d = r.studentDoc.nameBn) !== null && _d !== void 0 ? _d : '',
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
    list.sort((a, b) => (asc ? b.stats[sortKey] - a.stats[sortKey] : a.stats[sortKey] - b.stats[sortKey]));
    const topPerformers = list.slice(0, limit).map((item, i) => ({ rank: i + 1, student: item.student, stats: item.stats, trend: item.trend, lastEntry: item.lastEntry }));
    const worstPerformers = list.slice(-limit).reverse().map((item, i) => ({ rank: i + 1, student: item.student, stats: item.stats, trend: item.trend, lastEntry: item.lastEntry }));
    const byTestType = {
        new: { top: [], worst: [] },
        recent: { top: [], worst: [] },
        older: { top: [], worst: [] },
    };
    for (const r of rows) {
        const avgNew = r.newGiven > 0 ? (r.newTanbih + r.newFath) / r.newGiven : 0;
        const avgRecent = r.recentGiven > 0 ? (r.recentTanbih + r.recentFath) / r.recentGiven : 0;
        const avgOlder = r.olderGiven > 0 ? (r.olderTanbih + r.olderFath) / r.olderGiven : 0;
        const st = {
            _id: String(r.studentDoc._id),
            studentId: r.studentDoc.studentId,
            nameEn: r.studentDoc.nameEn,
            nameBn: (_e = r.studentDoc.nameBn) !== null && _e !== void 0 ? _e : '',
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
});
exports.getPerformersReport = getPerformersReport;
const getSupervisionDetailedReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10;
    const dateRange = getDateRange(filters);
    const groupBy = (_a = filters.groupBy) !== null && _a !== void 0 ? _a : 'week';
    const pipeline = [
        { $match: { reportDate: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentDoc' } },
        { $unwind: '$studentDoc' },
        ...(filters.class ? [{ $match: { 'studentDoc.class': filters.class } }] : []),
        {
            $group: {
                _id: Object.assign(Object.assign({}, getGroupByExpr(groupBy)), { supervision: '$studentDoc.supervision' }),
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
    const rows = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const sup = { entries: 0, tanbih: 0, fath: 0, mistakes: 0, testsGiven: 0, newGiven: 0, newTanbih: 0, newFath: 0, recentGiven: 0, recentTanbih: 0, recentFath: 0, olderGiven: 0, olderTanbih: 0, olderFath: 0 };
    const unsup = Object.assign({}, sup);
    const timelineByPeriod = new Map();
    for (const r of rows) {
        const d = new Date(r.reportDate);
        const key = getPeriodKey(d, groupBy);
        if (r._id.supervision === true) {
            sup.entries += (_b = r.entries) !== null && _b !== void 0 ? _b : 0;
            sup.tanbih += (_c = r.totalTanbih) !== null && _c !== void 0 ? _c : 0;
            sup.fath += (_d = r.totalFath) !== null && _d !== void 0 ? _d : 0;
            sup.mistakes += (_e = r.totalMistakes) !== null && _e !== void 0 ? _e : 0;
            sup.testsGiven += (_f = r.testsGiven) !== null && _f !== void 0 ? _f : 0;
            sup.newGiven += (_g = r.newGiven) !== null && _g !== void 0 ? _g : 0;
            sup.newTanbih += (_h = r.newTanbih) !== null && _h !== void 0 ? _h : 0;
            sup.newFath += (_j = r.newFath) !== null && _j !== void 0 ? _j : 0;
            sup.recentGiven += (_k = r.recentGiven) !== null && _k !== void 0 ? _k : 0;
            sup.recentTanbih += (_l = r.recentTanbih) !== null && _l !== void 0 ? _l : 0;
            sup.recentFath += (_m = r.recentFath) !== null && _m !== void 0 ? _m : 0;
            sup.olderGiven += (_o = r.olderGiven) !== null && _o !== void 0 ? _o : 0;
            sup.olderTanbih += (_p = r.olderTanbih) !== null && _p !== void 0 ? _p : 0;
            sup.olderFath += (_q = r.olderFath) !== null && _q !== void 0 ? _q : 0;
        }
        else {
            unsup.entries += (_r = r.entries) !== null && _r !== void 0 ? _r : 0;
            unsup.tanbih += (_s = r.totalTanbih) !== null && _s !== void 0 ? _s : 0;
            unsup.fath += (_t = r.totalFath) !== null && _t !== void 0 ? _t : 0;
            unsup.mistakes += (_u = r.totalMistakes) !== null && _u !== void 0 ? _u : 0;
            unsup.testsGiven += (_v = r.testsGiven) !== null && _v !== void 0 ? _v : 0;
            unsup.newGiven += (_w = r.newGiven) !== null && _w !== void 0 ? _w : 0;
            unsup.newTanbih += (_x = r.newTanbih) !== null && _x !== void 0 ? _x : 0;
            unsup.newFath += (_y = r.newFath) !== null && _y !== void 0 ? _y : 0;
            unsup.recentGiven += (_z = r.recentGiven) !== null && _z !== void 0 ? _z : 0;
            unsup.recentTanbih += (_0 = r.recentTanbih) !== null && _0 !== void 0 ? _0 : 0;
            unsup.recentFath += (_1 = r.recentFath) !== null && _1 !== void 0 ? _1 : 0;
            unsup.olderGiven += (_2 = r.olderGiven) !== null && _2 !== void 0 ? _2 : 0;
            unsup.olderTanbih += (_3 = r.olderTanbih) !== null && _3 !== void 0 ? _3 : 0;
            unsup.olderFath += (_4 = r.olderFath) !== null && _4 !== void 0 ? _4 : 0;
        }
        if (!timelineByPeriod.has(key))
            timelineByPeriod.set(key, { supervised: { entries: 0, tanbih: 0, fath: 0 }, unsupervised: { entries: 0, tanbih: 0, fath: 0 } });
        const row = timelineByPeriod.get(key);
        if (r._id.supervision === true) {
            row.supervised.entries += (_5 = r.entries) !== null && _5 !== void 0 ? _5 : 0;
            row.supervised.tanbih += (_6 = r.totalTanbih) !== null && _6 !== void 0 ? _6 : 0;
            row.supervised.fath += (_7 = r.totalFath) !== null && _7 !== void 0 ? _7 : 0;
        }
        else {
            row.unsupervised.entries += (_8 = r.entries) !== null && _8 !== void 0 ? _8 : 0;
            row.unsupervised.tanbih += (_9 = r.totalTanbih) !== null && _9 !== void 0 ? _9 : 0;
            row.unsupervised.fath += (_10 = r.totalFath) !== null && _10 !== void 0 ? _10 : 0;
        }
    }
    const supPossible = sup.entries * 3;
    const unsupPossible = unsup.entries * 3;
    const supCompletion = supPossible > 0 ? (sup.testsGiven / supPossible) * 100 : 0;
    const unsupCompletion = unsupPossible > 0 ? (unsup.testsGiven / unsupPossible) * 100 : 0;
    const conclusion = supCompletion > 0 || unsupCompletion > 0
        ? `Supervised students: ${supCompletion.toFixed(1)}% completion, avg ${sup.entries > 0 ? (sup.mistakes / sup.entries).toFixed(1) : 0} mistakes/entry. Unsupervised: ${unsupCompletion.toFixed(1)}% completion, avg ${unsup.entries > 0 ? (unsup.mistakes / unsup.entries).toFixed(1) : 0} mistakes/entry.`
        : 'Insufficient data.';
    const timeline = Array.from(timelineByPeriod.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([period, row]) => (Object.assign({ period }, row)));
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
});
exports.getSupervisionDetailedReport = getSupervisionDetailedReport;
/** Progress report (7.2): mastery, improvement velocity, milestones, distribution */
const getProgressReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dateRange = getDateRange(filters);
    const startStr = dateRange.start.toISOString().slice(0, 10);
    const endStr = dateRange.end.toISOString().slice(0, 10);
    const studentMatch = { 'studentDoc.active': true };
    if (filters.class)
        studentMatch['studentDoc.class'] = filters.class;
    if (filters.studentId)
        studentMatch['student'] = new mongoose_1.Types.ObjectId(filters.studentId);
    const pipeline = [
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
    const grouped = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const students = [];
    const improvementLeaderboardData = [];
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const row of grouped) {
        const entries = row.entries;
        const student = row.studentDoc;
        const masteryScore = calculateMasteryScore(entries);
        const grade = masteryGradeFromScore(masteryScore);
        gradeCounts[grade] += 1;
        const improvementVelocity = calculateImprovementVelocity(entries);
        const sortedByDate = [...entries].sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
        const midpoint = Math.floor(sortedByDate.length / 2);
        const firstHalf = sortedByDate.slice(0, midpoint);
        const secondHalf = sortedByDate.slice(midpoint);
        const previousAvgMistakes = firstHalf.reduce((s, e) => s + e.totalMistakes, 0) / firstHalf.length;
        const currentAvgMistakes = secondHalf.reduce((s, e) => s + e.totalMistakes, 0) / secondHalf.length;
        const trend = computeTrend(firstHalf.reduce((s, e) => s + e.totalMistakes, 0) / firstHalf.length, secondHalf.reduce((s, e) => s + e.totalMistakes, 0) / secondHalf.length);
        const byMonth = new Map();
        for (const e of entries) {
            const month = new Date(e.reportDate).toISOString().slice(0, 7);
            const list = (_a = byMonth.get(month)) !== null && _a !== void 0 ? _a : [];
            list.push(e);
            byMonth.set(month, list);
        }
        const monthlyScores = Array.from(byMonth.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, monthEntries]) => ({
            month,
            masteryScore: calculateMasteryScore(monthEntries),
            avgMistakes: Number((monthEntries.reduce((s, x) => s + x.totalMistakes, 0) / monthEntries.length).toFixed(2)),
        }));
        const milestones = [];
        if (grade === 'A' || grade === 'B') {
            const lastEntry = entries.reduce((a, e) => new Date(e.reportDate) > new Date(a.reportDate) ? e : a);
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
    const improvementLeaderboard = [...improvementLeaderboardData]
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
    const summary = {
        totalStudents: students.length,
        avgMasteryScore: students.length > 0
            ? Number((students.reduce((s, x) => s + x.progress.masteryScore, 0) / students.length).toFixed(1))
            : 0,
        avgImprovementVelocity: students.length > 0
            ? Number((students.reduce((s, x) => s + x.progress.improvementVelocity, 0) /
                students.length).toFixed(1))
            : 0,
        studentsImproving,
        studentsDeclining,
        studentsStable,
    };
    return {
        filters: Object.assign(Object.assign({ dateRange: { start: startStr, end: endStr } }, (filters.class && { class: filters.class })), (filters.studentId && { studentId: filters.studentId })),
        summary,
        students,
        improvementLeaderboard,
        masteryDistribution: gradeCounts,
    };
});
exports.getProgressReport = getProgressReport;
/** Consistency report (7.1): attendance, streaks, calendar, leaderboard */
const getConsistencyReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const dateRange = getDateRange(filters);
    const startStr = dateRange.start.toISOString().slice(0, 10);
    const endStr = dateRange.end.toISOString().slice(0, 10);
    const weeksInRange = getAllWeeksInRange(dateRange.start, dateRange.end);
    const minEntries = (_a = filters.minEntries) !== null && _a !== void 0 ? _a : 4;
    const studentMatch = { 'studentDoc.active': true };
    if (filters.class)
        studentMatch['studentDoc.class'] = filters.class;
    if (filters.studentId)
        studentMatch['student'] = new mongoose_1.Types.ObjectId(filters.studentId);
    const pipeline = [
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
    const grouped = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const students = [];
    const calendarByDate = new Map();
    const oneDayMs = 24 * 60 * 60 * 1000;
    for (let d = dateRange.start.getTime(); d <= dateRange.end.getTime(); d += oneDayMs) {
        calendarByDate.set(new Date(d).toISOString().slice(0, 10), { count: 0, totalTests: 0, expected: 0 });
    }
    for (const row of grouped) {
        const entries = row.entries;
        const student = row.studentDoc;
        const totalActualEntries = entries.length;
        const totalTestsGiven = entries.reduce((s, e) => { var _a; return s + ((_a = e.testsGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
        const totalTestsPossible = totalActualEntries * 3;
        const attendanceRate = weeksInRange.length > 0
            ? (new Set(entries.map((e) => getWeekStart(new Date(e.reportDate)).toISOString().slice(0, 10))).size / weeksInRange.length) * 100
            : 0;
        const testRegularityScore = totalTestsPossible > 0 ? (totalTestsGiven / totalTestsPossible) * 100 : 0;
        const { currentStreak, longestStreak, consecutiveMissedWeeks } = calculateStreaks(entries.map((e) => ({ reportDate: e.reportDate })), dateRange.start, dateRange.end);
        const weeksWithEntry = new Set(entries.map((e) => getWeekStart(new Date(e.reportDate)).toISOString().slice(0, 10)));
        const missedWeeks = weeksInRange.length - weeksWithEntry.size;
        const lastEntry = entries.length
            ? entries.reduce((a, e) => (new Date(e.reportDate) > new Date(a.reportDate) ? e : a), entries[0])
            : null;
        const lastEntryDate = lastEntry ? new Date(lastEntry.reportDate).toISOString().slice(0, 10) : null;
        const daysSinceLastEntry = lastEntry
            ? Math.floor((dateRange.end.getTime() - new Date(lastEntry.reportDate).getTime()) / oneDayMs)
            : null;
        const weeklyDetail = weeksInRange.map((weekStart) => {
            const hasEntry = weeksWithEntry.has(weekStart);
            const weekEntries = entries.filter((e) => getWeekStart(new Date(e.reportDate)).toISOString().slice(0, 10) === weekStart);
            const testsGiven = weekEntries.reduce((s, e) => { var _a; return s + ((_a = e.testsGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
            const testsMissed = weekEntries.reduce((s, e) => { var _a; return s + ((_a = e.testsMissed) !== null && _a !== void 0 ? _a : 0); }, 0);
            return { weekStart, hasEntry, testsGiven, testsMissed };
        });
        let status = 'good';
        if (attendanceRate >= 90 && testRegularityScore >= 85 && consecutiveMissedWeeks === 0)
            status = 'excellent';
        else if (attendanceRate < 50 || testRegularityScore < 50 || consecutiveMissedWeeks >= 3)
            status = 'critical';
        else if (attendanceRate < 70 || testRegularityScore < 70 || consecutiveMissedWeeks >= 2)
            status = 'warning';
        entries.forEach((e) => {
            var _a;
            const day = new Date(e.reportDate).toISOString().slice(0, 10);
            const rec = calendarByDate.get(day);
            if (rec) {
                rec.count += 1;
                rec.totalTests += (_a = e.testsGiven) !== null && _a !== void 0 ? _a : 0;
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
    const streakLeaderboard = [...students]
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
    const calendarData = Array.from(calendarByDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, rec]) => ({
        date,
        entriesCount: rec.count,
        status: (rec.count === 0 ? 'missing' : rec.totalTests >= rec.expected * 0.8 ? 'full' : 'partial'),
    }));
    return {
        filters: Object.assign(Object.assign(Object.assign({ dateRange: { start: startStr, end: endStr } }, (filters.class && { class: filters.class })), (filters.studentId && { studentId: filters.studentId })), (filters.minEntries != null && { minEntries: filters.minEntries })),
        summary,
        students,
        calendarData,
        streakLeaderboard,
    };
});
exports.getConsistencyReport = getConsistencyReport;
/** Calculate percentile: 0 = worst, 100 = best (higher score = better position) */
function calculatePercentile(studentScore, allScores, higherIsBetter) {
    if (allScores.length === 0)
        return 0;
    const sorted = [...allScores].sort((a, b) => a - b);
    const index = sorted.findIndex((score) => (higherIsBetter ? score >= studentScore : score <= studentScore));
    const pos = index < 0 ? (higherIsBetter ? 0 : sorted.length) : index;
    return higherIsBetter
        ? Math.round((pos / sorted.length) * 100)
        : Math.round((1 - pos / sorted.length) * 100);
}
/** Comparative report (7.3): class rankings, student rankings, peer comparison, ustad effectiveness, distribution */
const getComparativeReport = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const dateRange = getDateRange(filters);
    const startStr = dateRange.start.toISOString().slice(0, 10);
    const endStr = dateRange.end.toISOString().slice(0, 10);
    const compareBy = (_a = filters.compareBy) !== null && _a !== void 0 ? _a : 'all';
    const studentMatch = { 'studentDoc.active': true };
    if (filters.class)
        studentMatch['studentDoc.class'] = filters.class;
    if (typeof filters.supervision === 'boolean')
        studentMatch['studentDoc.supervision'] = filters.supervision;
    const pipeline = [
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
    const grouped = yield quran_entry_model_1.QuranEntry.aggregate(pipeline);
    const studentMetricsList = [];
    for (const row of grouped) {
        const entries = row.entries;
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
        const testsGiven = entries.reduce((s, e) => { var _a; return s + ((_a = e.testsGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
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
    const previousPipeline = [
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
    const previousGrouped = yield quran_entry_model_1.QuranEntry.aggregate(previousPipeline);
    const previousMasteryByStudent = new Map();
    for (const row of previousGrouped) {
        const entries = row.entries.map((e) => ({
            reportDate: e.reportDate,
            totalTanbih: 0,
            totalFath: 0,
            totalMistakes: e.totalMistakes,
            testsGiven: 3,
        }));
        const score = calculateMasteryScore(entries);
        previousMasteryByStudent.set(String(row._id), score);
    }
    const masteryScores = studentMetricsList.map((m) => m.masteryScore);
    const mistakeScores = studentMetricsList.map((m) => m.avgMistakes);
    const sortedByMastery = [...studentMetricsList].sort((a, b) => b.masteryScore - a.masteryScore);
    const studentRankings = sortedByMastery.map((m, i) => {
        var _a;
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
            .sort((a, b) => { var _a, _b; return ((_a = previousMasteryByStudent.get(String(b.student._id))) !== null && _a !== void 0 ? _a : 0) - ((_b = previousMasteryByStudent.get(String(a.student._id))) !== null && _b !== void 0 ? _b : 0); });
        const prevRank = prevSorted.findIndex((x) => String(x.student._id) === String(m.student._id)) + 1;
        const rankChange = prevRank > 0 ? prevRank - rank : 0;
        const studentPojo = {
            _id: String(m.student._id),
            studentId: m.student.studentId,
            nameEn: m.student.nameEn,
            nameBn: m.student.nameBn,
            class: m.student.class,
            supervision: m.student.supervision,
            active: (_a = m.student.active) !== null && _a !== void 0 ? _a : true,
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
    const byClass = new Map();
    for (const m of studentMetricsList) {
        const c = m.student.class;
        if (!byClass.has(c))
            byClass.set(c, []);
        byClass.get(c).push(m);
    }
    const classRankingsData = [];
    for (const [cls, list] of byClass.entries()) {
        if (filters.class && cls !== filters.class)
            continue;
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
    const classRankings = classRankingsData.map((row, i) => {
        var _a, _b;
        return ({
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
                active: (_a = row.topPerformer.student.active) !== null && _a !== void 0 ? _a : true,
            },
            mostImproved: {
                _id: String(row.mostImproved.student._id),
                studentId: row.mostImproved.student.studentId,
                nameEn: row.mostImproved.student.nameEn,
                nameBn: row.mostImproved.student.nameBn,
                class: row.mostImproved.student.class,
                supervision: row.mostImproved.student.supervision,
                active: (_b = row.mostImproved.student.active) !== null && _b !== void 0 ? _b : true,
            },
        });
    });
    let peerComparison;
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
            let overallPosition;
            if (percentileInClass >= 90)
                overallPosition = 'Top 10%';
            else if (percentileInClass >= 75)
                overallPosition = 'Top 25%';
            else if (percentileInClass >= 50)
                overallPosition = 'Above Average';
            else if (percentileInClass >= 25)
                overallPosition = 'Below Average';
            else
                overallPosition = 'Needs Improvement';
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
    const ustadPipeline = [
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
    const ustadRows = yield quran_entry_model_1.QuranEntry.aggregate(ustadPipeline);
    const ustadComparison = [];
    for (const ur of ustadRows) {
        const studentsCount = (_c = (_b = ur.studentsCount) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
        const entriesCount = (_d = ur.entriesCount) !== null && _d !== void 0 ? _d : 0;
        const possibleTests = entriesCount * 3;
        const testsGiven = ur.studentMistakes.reduce((s, x) => { var _a; return s + ((_a = x.testsGiven) !== null && _a !== void 0 ? _a : 0); }, 0);
        const testCompletionRate = possibleTests > 0 ? (testsGiven / possibleTests) * 100 : 0;
        const avgStudentMistakes = ur.studentMistakes.length > 0
            ? ur.studentMistakes.reduce((s, x) => s + (x.totalMistakes / (x.entriesCount || 1)), 0) / ur.studentMistakes.length
            : 0;
        const improvements = [];
        for (const sm of ur.studentMistakes) {
            const entries = sm.entries.sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime());
            if (entries.length >= 2) {
                const mid = Math.floor(entries.length / 2);
                const firstAvg = entries.slice(0, mid).reduce((s, e) => s + e.totalMistakes, 0) / mid;
                const secondAvg = entries.slice(mid).reduce((s, e) => s + e.totalMistakes, 0) / (entries.length - mid);
                if (firstAvg > 0)
                    improvements.push(((firstAvg - secondAvg) / firstAvg) * 100);
            }
        }
        const avgStudentImprovement = improvements.length > 0 ? improvements.reduce((a, b) => a + b, 0) / improvements.length : 0;
        let effectiveness = 'medium';
        if (avgStudentImprovement > 10 && testCompletionRate >= 70)
            effectiveness = 'high';
        else if (avgStudentImprovement < -5 || testCompletionRate < 50)
            effectiveness = 'low';
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
        filters: Object.assign(Object.assign(Object.assign({ dateRange: { start: startStr, end: endStr } }, (filters.class && { class: filters.class })), (filters.studentId && { studentId: filters.studentId })), { compareBy }),
        classRankings,
        studentRankings,
        peerComparison,
        ustadComparison,
        distribution: { mistakesHistogram, masteryHistogram },
    };
});
exports.getComparativeReport = getComparativeReport;
exports.QuranReportsServices = {
    getOverallReport: exports.getOverallReport,
    getWeeklySummary: exports.getWeeklySummary,
    getWeeklySupervisionComparison: exports.getWeeklySupervisionComparison,
    getClassBreakdown: exports.getClassBreakdown,
    getStudentReport: exports.getStudentReport,
    getSupervisionComparison: exports.getSupervisionComparison,
    getUstadSummary: exports.getUstadSummary,
    getTestTypeAnalysisReport: exports.getTestTypeAnalysisReport,
    getTimeAnalysisReport: exports.getTimeAnalysisReport,
    getStudentTrendReport: exports.getStudentTrendReport,
    getStudentContentReport: exports.getStudentContentReport,
    getSurahAnalysisReport: exports.getSurahAnalysisReport,
    getJuzAnalysisReport: exports.getJuzAnalysisReport,
    getPerformersReport: exports.getPerformersReport,
    getSupervisionDetailedReport: exports.getSupervisionDetailedReport,
    getConsistencyReport: exports.getConsistencyReport,
    getProgressReport: exports.getProgressReport,
    getComparativeReport: exports.getComparativeReport,
};
