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
exports.QuranReportsServices = exports.getUstadSummary = exports.getSupervisionComparison = exports.getStudentReport = exports.getClassBreakdown = exports.getWeeklySupervisionComparison = exports.getWeeklySummary = exports.getOverallReport = void 0;
const mongoose_1 = require("mongoose");
const quran_entry_model_1 = require("../entry/quran-entry.model");
const quran_student_model_1 = require("../student/quran-student.model");
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
exports.QuranReportsServices = {
    getOverallReport: exports.getOverallReport,
    getWeeklySummary: exports.getWeeklySummary,
    getWeeklySupervisionComparison: exports.getWeeklySupervisionComparison,
    getClassBreakdown: exports.getClassBreakdown,
    getStudentReport: exports.getStudentReport,
    getSupervisionComparison: exports.getSupervisionComparison,
    getUstadSummary: exports.getUstadSummary,
};
