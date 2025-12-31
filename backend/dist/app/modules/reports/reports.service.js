"use strict";
// src/app/modules/reports/reports.service.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsServices = exports.getManagementDashboard = exports.getQualityMetrics = exports.getOperationalEfficiency = exports.getTimeTrends = exports.getLanguageReviewCompliance = exports.getClassAnalytics = exports.getSubjectAnalytics = exports.getReviewerProductivity = exports.getTeacherPerformance = exports.getTurnaroundTime = exports.getStatusDistribution = void 0;
const video_model_1 = require("../master/video/video.model");
const user_model_1 = require("../user/user.model");
// Helper to build date filter
const buildDateFilter = (filters) => {
    const dateFilter = {};
    if (filters.dateFrom || filters.dateTo) {
        dateFilter.date = {};
        if (filters.dateFrom)
            dateFilter.date.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            dateFilter.date.$lte = new Date(filters.dateTo);
    }
    return dateFilter;
};
// 1. Status Distribution Report
const getStatusDistribution = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const matchStage = Object.assign({}, dateFilter);
    const statusCounts = yield video_model_1.Video.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);
    const total = statusCounts.reduce((sum, item) => sum + item.count, 0);
    const distributions = ['unassigned', 'assigned', 'reviewed', 'published'].map((status) => {
        const found = statusCounts.find((s) => s._id === status);
        const count = (found === null || found === void 0 ? void 0 : found.count) || 0;
        return {
            status,
            count,
            percentage: total > 0 ? (count / total) * 100 : 0,
        };
    });
    // By Class
    const byClassAgg = yield video_model_1.Video.aggregate([
        { $match: matchStage },
        { $group: { _id: { class: '$class', status: '$status' }, count: { $sum: 1 } } },
        { $lookup: { from: 'classes', localField: '_id.class', foreignField: '_id', as: 'classInfo' } },
        { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
    ]);
    const byClass = {};
    byClassAgg.forEach((item) => {
        var _a;
        const className = ((_a = item.classInfo) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown';
        if (!byClass[className])
            byClass[className] = [];
        byClass[className].push({
            status: item._id.status,
            count: item.count,
        });
    });
    return {
        total,
        distributions,
        byClass,
    };
});
exports.getStatusDistribution = getStatusDistribution;
// 2. Turnaround Time Report
const getTurnaroundTime = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const videos = yield video_model_1.Video.find(Object.assign(Object.assign({}, dateFilter), { status: { $in: ['reviewed', 'published'] } }))
        .select('createdAt updatedAt review.assignedReviewer review.reviewedAt status')
        .lean();
    const calculateTimeDiff = (start, end) => {
        return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
    };
    const uploadToAssignment = [];
    const assignmentToReview = [];
    const reviewToPublication = [];
    const totalCycleTime = [];
    // This is simplified - you'd need to track assignment time separately
    // For now, we'll use updatedAt as proxy for assignment time
    videos.forEach((video) => {
        var _a;
        if (((_a = video.review) === null || _a === void 0 ? void 0 : _a.reviewedAt) && video.createdAt) {
            const reviewTime = calculateTimeDiff(new Date(video.createdAt), new Date(video.review.reviewedAt));
            assignmentToReview.push(reviewTime);
            if (video.status === 'published' && video.updatedAt) {
                const pubTime = calculateTimeDiff(new Date(video.review.reviewedAt), new Date(video.updatedAt));
                reviewToPublication.push(pubTime);
                totalCycleTime.push(calculateTimeDiff(new Date(video.createdAt), new Date(video.updatedAt)));
            }
        }
    });
    const calculateStats = (times) => {
        if (times.length === 0)
            return { averageDays: 0, minDays: 0, maxDays: 0, medianDays: 0 };
        const sorted = [...times].sort((a, b) => a - b);
        return {
            averageDays: times.reduce((a, b) => a + b, 0) / times.length,
            minDays: sorted[0],
            maxDays: sorted[sorted.length - 1],
            medianDays: sorted[Math.floor(sorted.length / 2)],
        };
    };
    return {
        uploadToAssignment: calculateStats(uploadToAssignment),
        assignmentToReview: calculateStats(assignmentToReview),
        reviewToPublication: calculateStats(reviewToPublication),
        totalCycleTime: calculateStats(totalCycleTime),
    };
});
exports.getTurnaroundTime = getTurnaroundTime;
// 3. Teacher Performance Report
const getTeacherPerformance = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const teacherStats = yield video_model_1.Video.aggregate([
        { $match: Object.assign(Object.assign({}, dateFilter), { review: { $exists: true, $ne: null } }) },
        {
            $group: {
                _id: '$teacher',
                totalVideos: { $sum: 1 },
                publishedVideos: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                ratings: {
                    $push: {
                        subjectKnowledge: '$review.subjectKnowledge.rating',
                        engagementWithStudents: '$review.engagementWithStudents.rating',
                        useOfTeachingAids: '$review.useOfTeachingAids.rating',
                        interactionAndQuestionHandling: '$review.interactionAndQuestionHandling.rating',
                        studentDiscipline: '$review.studentDiscipline.rating',
                        teachersControlOverClass: '$review.teachersControlOverClass.rating',
                        participationLevelOfStudents: '$review.participationLevelOfStudents.rating',
                        completionOfPlannedSyllabus: '$review.completionOfPlannedSyllabus.rating',
                    },
                },
                commentsCount: {
                    $sum: { $cond: [{ $ifNull: ['$teacherComment', false] }, 1, 0] },
                },
            },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'teacherInfo' } },
        { $unwind: { path: '$teacherInfo', preserveNullAndEmptyArrays: true } },
    ]);
    const teachers = teacherStats.map((stat) => {
        var _a, _b;
        const allRatings = [];
        const criteriaTotals = {
            subjectKnowledge: [],
            engagementWithStudents: [],
            useOfTeachingAids: [],
            interactionAndQuestionHandling: [],
            studentDiscipline: [],
            teachersControlOverClass: [],
            participationLevelOfStudents: [],
            completionOfPlannedSyllabus: [],
        };
        stat.ratings.forEach((rating) => {
            Object.keys(criteriaTotals).forEach((key) => {
                if (rating[key]) {
                    criteriaTotals[key].push(rating[key]);
                    allRatings.push(rating[key]);
                }
            });
        });
        const criteriaScores = {};
        Object.keys(criteriaTotals).forEach((key) => {
            const arr = criteriaTotals[key];
            criteriaScores[key] = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        });
        const averageRating = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
        return {
            teacherId: stat._id.toString(),
            teacherName: ((_a = stat.teacherInfo) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
            teacherEmail: ((_b = stat.teacherInfo) === null || _b === void 0 ? void 0 : _b.email) || '',
            totalVideos: stat.totalVideos,
            publishedVideos: stat.publishedVideos,
            averageRating: Math.round(averageRating * 100) / 100,
            criteriaScores: {
                subjectKnowledge: Math.round(criteriaScores.subjectKnowledge * 100) / 100,
                engagementWithStudents: Math.round(criteriaScores.engagementWithStudents * 100) / 100,
                useOfTeachingAids: Math.round(criteriaScores.useOfTeachingAids * 100) / 100,
                interactionAndQuestionHandling: Math.round(criteriaScores.interactionAndQuestionHandling * 100) / 100,
                studentDiscipline: Math.round(criteriaScores.studentDiscipline * 100) / 100,
                teachersControlOverClass: Math.round(criteriaScores.teachersControlOverClass * 100) / 100,
                participationLevelOfStudents: Math.round(criteriaScores.participationLevelOfStudents * 100) / 100,
                completionOfPlannedSyllabus: Math.round(criteriaScores.completionOfPlannedSyllabus * 100) / 100,
            },
            trend: 'stable', // Simplified - would need historical data
            commentRate: stat.publishedVideos > 0 ? (stat.commentsCount / stat.publishedVideos) * 100 : 0,
        };
    });
    const overallAverage = teachers.length > 0
        ? teachers.reduce((sum, t) => sum + t.averageRating, 0) / teachers.length
        : 0;
    const sorted = [...teachers].sort((a, b) => b.averageRating - a.averageRating);
    const topPerformers = sorted.slice(0, Math.min(5, sorted.length));
    const needsImprovement = sorted.slice(-Math.min(5, sorted.length)).reverse();
    return {
        teachers,
        overallAverage: Math.round(overallAverage * 100) / 100,
        topPerformers,
        needsImprovement,
    };
});
exports.getTeacherPerformance = getTeacherPerformance;
// 4. Reviewer Productivity Report
const getReviewerProductivity = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const reviewerStats = yield video_model_1.Video.aggregate([
        {
            $match: Object.assign(Object.assign({}, dateFilter), { assignedReviewer: { $exists: true, $ne: null } }),
        },
        {
            $group: {
                _id: '$assignedReviewer',
                totalReviews: { $sum: { $cond: [{ $ne: ['$review', null] }, 1, 0] } },
                pendingReviews: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
                reviews: {
                    $push: {
                        reviewedAt: '$review.reviewedAt',
                        assignedAt: '$updatedAt', // Approximation
                    },
                },
            },
        },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'reviewerInfo' } },
        { $unwind: { path: '$reviewerInfo', preserveNullAndEmptyArrays: true } },
    ]);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const reviewers = reviewerStats.map((stat) => {
        var _a, _b;
        const completionTimes = [];
        let reviewsThisMonth = 0;
        let reviewsLastMonth = 0;
        stat.reviews.forEach((review) => {
            if (review.reviewedAt) {
                const reviewedDate = new Date(review.reviewedAt);
                const assignedDate = review.assignedAt ? new Date(review.assignedAt) : reviewedDate;
                const days = (reviewedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24);
                completionTimes.push(days);
                if (reviewedDate.getMonth() === currentMonth &&
                    reviewedDate.getFullYear() === currentYear) {
                    reviewsThisMonth++;
                }
                const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                if (reviewedDate.getMonth() === lastMonth && reviewedDate.getFullYear() === lastMonthYear) {
                    reviewsLastMonth++;
                }
            }
        });
        return {
            reviewerId: stat._id.toString(),
            reviewerName: ((_a = stat.reviewerInfo) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
            reviewerEmail: ((_b = stat.reviewerInfo) === null || _b === void 0 ? void 0 : _b.email) || '',
            totalReviews: stat.totalReviews,
            pendingReviews: stat.pendingReviews,
            averageCompletionDays: completionTimes.length > 0
                ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
                : 0,
            reviewsThisMonth,
            reviewsLastMonth,
        };
    });
    const totalPending = reviewers.reduce((sum, r) => sum + r.pendingReviews, 0);
    const avgCompletion = reviewers.length > 0
        ? reviewers.reduce((sum, r) => sum + r.averageCompletionDays, 0) / reviewers.length
        : 0;
    return {
        reviewers,
        totalPendingReviews: totalPending,
        averageCompletionTime: Math.round(avgCompletion * 100) / 100,
    };
});
exports.getReviewerProductivity = getReviewerProductivity;
// 5. Subject Analytics
const getSubjectAnalytics = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const subjectStats = yield video_model_1.Video.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$subject',
                totalVideos: { $sum: 1 },
                unassigned: { $sum: { $cond: [{ $eq: ['$status', 'unassigned'] }, 1, 0] } },
                assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
                reviewed: { $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] } },
                published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                ratings: { $push: '$review.subjectKnowledge.rating' },
            },
        },
        { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } },
        { $unwind: { path: '$subjectInfo', preserveNullAndEmptyArrays: true } },
    ]);
    return subjectStats.map((stat) => {
        var _a;
        const validRatings = stat.ratings.filter((r) => r != null);
        const avgRating = validRatings.length > 0
            ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
            : 0;
        return {
            subjectId: stat._id.toString(),
            subjectName: ((_a = stat.subjectInfo) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
            totalVideos: stat.totalVideos,
            averageRating: Math.round(avgRating * 100) / 100,
            videosByStatus: {
                unassigned: stat.unassigned,
                assigned: stat.assigned,
                reviewed: stat.reviewed,
                published: stat.published,
            },
        };
    });
});
exports.getSubjectAnalytics = getSubjectAnalytics;
// 6. Class Analytics
const getClassAnalytics = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const classStats = yield video_model_1.Video.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$class',
                totalVideos: { $sum: 1 },
                unassigned: { $sum: { $cond: [{ $eq: ['$status', 'unassigned'] }, 1, 0] } },
                assigned: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
                reviewed: { $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] } },
                published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                ratings: { $push: '$review.subjectKnowledge.rating' },
            },
        },
        { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classInfo' } },
        { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
    ]);
    return classStats.map((stat) => {
        var _a;
        const validRatings = stat.ratings.filter((r) => r != null);
        const avgRating = validRatings.length > 0
            ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
            : 0;
        return {
            classId: stat._id.toString(),
            className: ((_a = stat.classInfo) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
            totalVideos: stat.totalVideos,
            averageRating: Math.round(avgRating * 100) / 100,
            videosByStatus: {
                unassigned: stat.unassigned,
                assigned: stat.assigned,
                reviewed: stat.reviewed,
                published: stat.published,
            },
        };
    });
});
exports.getClassAnalytics = getClassAnalytics;
// 7. Language Review Compliance
const getLanguageReviewCompliance = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const videos = yield video_model_1.Video.find(Object.assign(Object.assign({}, dateFilter), { languageReview: { $exists: true, $ne: null } })).lean();
    const totalVideos = yield video_model_1.Video.countDocuments(dateFilter);
    const videosWithLanguageReview = videos.length;
    const criteriaCounts = {
        classStartedOnTime: { yes: 0, no: 0 },
        classPerformedAsTraining: { yes: 0, no: 0 },
        canMaintainDiscipline: { yes: 0, no: 0 },
        studentsUnderstandLesson: { yes: 0, no: 0 },
        isClassInteractive: { yes: 0, no: 0 },
        teacherSignsHomeworkDiary: { yes: 0, no: 0 },
        teacherChecksDiary: { yes: 0, no: 0 },
    };
    videos.forEach((video) => {
        if (video.languageReview) {
            Object.keys(criteriaCounts).forEach((key) => {
                var _a;
                const criterion = (_a = video.languageReview) === null || _a === void 0 ? void 0 : _a[key];
                if (criterion === null || criterion === void 0 ? void 0 : criterion.answeredYes) {
                    criteriaCounts[key].yes++;
                }
                else {
                    criteriaCounts[key].no++;
                }
            });
        }
    });
    const criteriaCompliance = {};
    Object.keys(criteriaCounts).forEach((key) => {
        const { yes, no } = criteriaCounts[key];
        const total = yes + no;
        criteriaCompliance[key] = {
            yes,
            no,
            percentage: total > 0 ? (yes / total) * 100 : 0,
        };
    });
    return {
        totalVideos,
        videosWithLanguageReview,
        complianceRate: totalVideos > 0 ? (videosWithLanguageReview / totalVideos) * 100 : 0,
        criteriaCompliance,
    };
});
exports.getLanguageReviewCompliance = getLanguageReviewCompliance;
// 8. Time Trend Report
const getTimeTrends = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (period = 'monthly', filters = {}) {
    const dateFilter = buildDateFilter(filters);
    let groupFormat;
    if (period === 'daily') {
        groupFormat = {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
        };
    }
    else if (period === 'weekly') {
        groupFormat = {
            year: { $year: '$date' },
            week: { $week: '$date' },
        };
    }
    else {
        groupFormat = {
            year: { $year: '$date' },
            month: { $month: '$date' },
        };
    }
    const trends = yield video_model_1.Video.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: groupFormat,
                videosUploaded: { $sum: 1 },
                videosReviewed: {
                    $sum: { $cond: [{ $in: ['$status', ['reviewed', 'published']] }, 1, 0] },
                },
                videosPublished: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                ratings: { $push: '$review.subjectKnowledge.rating' },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } },
    ]);
    const formattedTrends = trends.map((trend) => {
        let periodStr = '';
        if (period === 'daily') {
            periodStr = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`;
        }
        else if (period === 'weekly') {
            periodStr = `${trend._id.year}-W${String(trend._id.week).padStart(2, '0')}`;
        }
        else {
            periodStr = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`;
        }
        const validRatings = trend.ratings.filter((r) => r != null);
        const avgRating = validRatings.length > 0
            ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
            : 0;
        return {
            period: periodStr,
            videosUploaded: trend.videosUploaded,
            videosReviewed: trend.videosReviewed,
            videosPublished: trend.videosPublished,
            averageRating: Math.round(avgRating * 100) / 100,
        };
    });
    return {
        trends: formattedTrends,
        period,
    };
});
exports.getTimeTrends = getTimeTrends;
// 9. Operational Efficiency
const getOperationalEfficiency = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const videos = yield video_model_1.Video.find(dateFilter)
        .select('status createdAt updatedAt review.reviewedAt')
        .lean();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    let reviewQueueSize = 0;
    let publicationQueueSize = 0;
    const daysInUnassigned = [];
    const daysInAssigned = [];
    const daysInReviewed = [];
    let assignedExceedingSLA = 0;
    let reviewedExceedingSLA = 0;
    videos.forEach((video) => {
        const created = new Date(video.createdAt);
        const updated = new Date(video.updatedAt);
        if (video.status === 'assigned') {
            reviewQueueSize++;
            const days = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
            daysInAssigned.push(days);
            if (updated < sevenDaysAgo)
                assignedExceedingSLA++;
        }
        else if (video.status === 'reviewed') {
            publicationQueueSize++;
            const days = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
            daysInReviewed.push(days);
            if (updated < threeDaysAgo)
                reviewedExceedingSLA++;
        }
        else if (video.status === 'unassigned') {
            const days = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            daysInUnassigned.push(days);
        }
    });
    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return {
        reviewQueueSize,
        publicationQueueSize,
        averageDaysInUnassigned: Math.round(avg(daysInUnassigned) * 100) / 100,
        averageDaysInAssigned: Math.round(avg(daysInAssigned) * 100) / 100,
        averageDaysInReviewed: Math.round(avg(daysInReviewed) * 100) / 100,
        videosExceedingSLA: {
            assigned: assignedExceedingSLA,
            reviewed: reviewedExceedingSLA,
        },
    };
});
exports.getOperationalEfficiency = getOperationalEfficiency;
// 10. Quality Metrics
const getQualityMetrics = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const videos = yield video_model_1.Video.find(Object.assign(Object.assign({}, dateFilter), { review: { $exists: true, $ne: null } })).lean();
    const ratingDistribution = { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 };
    let withStrengths = 0;
    let withImprovements = 0;
    let withSuggestions = 0;
    videos.forEach((video) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (video.review) {
            const ratings = [
                (_a = video.review.subjectKnowledge) === null || _a === void 0 ? void 0 : _a.rating,
                (_b = video.review.engagementWithStudents) === null || _b === void 0 ? void 0 : _b.rating,
                (_c = video.review.useOfTeachingAids) === null || _c === void 0 ? void 0 : _c.rating,
                (_d = video.review.interactionAndQuestionHandling) === null || _d === void 0 ? void 0 : _d.rating,
                (_e = video.review.studentDiscipline) === null || _e === void 0 ? void 0 : _e.rating,
                (_f = video.review.teachersControlOverClass) === null || _f === void 0 ? void 0 : _f.rating,
                (_g = video.review.participationLevelOfStudents) === null || _g === void 0 ? void 0 : _g.rating,
                (_h = video.review.completionOfPlannedSyllabus) === null || _h === void 0 ? void 0 : _h.rating,
            ].filter((r) => r != null);
            ratings.forEach((rating) => {
                if (rating === 1)
                    ratingDistribution.rating1++;
                else if (rating === 2)
                    ratingDistribution.rating2++;
                else if (rating === 3)
                    ratingDistribution.rating3++;
                else if (rating === 4)
                    ratingDistribution.rating4++;
                else if (rating === 5)
                    ratingDistribution.rating5++;
            });
            if (video.review.strengthsObserved)
                withStrengths++;
            if (video.review.areasForImprovement)
                withImprovements++;
            if (video.review.immediateSuggestions)
                withSuggestions++;
        }
    });
    const totalReviews = videos.length;
    const reviewsWithDetails = withStrengths + withImprovements + withSuggestions;
    // Teacher comment rate
    const publishedVideos = yield video_model_1.Video.countDocuments(Object.assign(Object.assign({}, dateFilter), { status: 'published' }));
    const videosWithComments = yield video_model_1.Video.countDocuments(Object.assign(Object.assign({}, dateFilter), { status: 'published', teacherComment: { $exists: true, $ne: null } }));
    // Data completeness
    const totalVideos = yield video_model_1.Video.countDocuments(dateFilter);
    const videosWithLanguageReviews = yield video_model_1.Video.countDocuments(Object.assign(Object.assign({}, dateFilter), { languageReview: { $exists: true, $ne: null } }));
    return {
        averageRatingDistribution: ratingDistribution,
        reviewsWithDetails: {
            withStrengths,
            withImprovements,
            withSuggestions,
            percentage: totalReviews > 0 ? (reviewsWithDetails / totalReviews) * 100 : 0,
        },
        teacherCommentRate: publishedVideos > 0 ? (videosWithComments / publishedVideos) * 100 : 0,
        dataCompleteness: {
            videosWithReviews: totalReviews,
            videosWithLanguageReviews,
            completenessPercentage: totalVideos > 0 ? ((totalReviews + videosWithLanguageReviews) / (totalVideos * 2)) * 100 : 0,
        },
    };
});
exports.getQualityMetrics = getQualityMetrics;
// 11. Management Dashboard (Summary)
const getManagementDashboard = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const dateFilter = buildDateFilter(filters);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalVideos, videosPublishedThisMonth, statusSummary, teacherPerf, reviewerProd, operationalEff,] = yield Promise.all([
        video_model_1.Video.countDocuments(dateFilter),
        video_model_1.Video.countDocuments(Object.assign(Object.assign({}, dateFilter), { status: 'published', updatedAt: { $gte: startOfMonth } })),
        video_model_1.Video.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        (0, exports.getTeacherPerformance)(filters),
        (0, exports.getReviewerProductivity)(filters),
        (0, exports.getOperationalEfficiency)(filters),
    ]);
    const statusMap = {};
    statusSummary.forEach((s) => {
        statusMap[s._id] = s.count;
    });
    const activeTeachers = yield user_model_1.User.countDocuments({
        roles: { $in: ['Teacher'] },
        active: true,
    });
    const activeReviewers = yield user_model_1.User.countDocuments({
        roles: { $in: ['Teacher', 'Admin', 'SeniorAdmin'] },
        active: true,
    });
    // Calculate review completion rate
    const assignedVideos = statusMap['assigned'] || 0;
    const reviewedVideos = (statusMap['reviewed'] || 0) + (statusMap['published'] || 0);
    const reviewCompletionRate = assignedVideos + reviewedVideos > 0
        ? (reviewedVideos / (assignedVideos + reviewedVideos)) * 100
        : 0;
    // System health score (0-100)
    const healthFactors = {
        reviewQueue: operationalEff.reviewQueueSize < 10 ? 100 : Math.max(0, 100 - operationalEff.reviewQueueSize * 5),
        publicationQueue: operationalEff.publicationQueueSize < 5 ? 100 : Math.max(0, 100 - operationalEff.publicationQueueSize * 10),
        slaCompliance: (operationalEff.videosExceedingSLA.assigned + operationalEff.videosExceedingSLA.reviewed) === 0 ? 100 : 50,
        reviewCompletion: reviewCompletionRate,
    };
    const systemHealthScore = Math.round((healthFactors.reviewQueue +
        healthFactors.publicationQueue +
        healthFactors.slaCompliance +
        healthFactors.reviewCompletion) /
        4);
    return {
        totalVideos,
        videosPublishedThisMonth,
        averageTeacherPerformanceScore: teacherPerf.overallAverage,
        reviewCompletionRate: Math.round(reviewCompletionRate * 100) / 100,
        averageReviewTurnaroundTime: reviewerProd.averageCompletionTime,
        activeTeachersCount: activeTeachers,
        activeReviewersCount: activeReviewers,
        systemHealthScore,
        statusSummary: {
            unassigned: statusMap['unassigned'] || 0,
            assigned: statusMap['assigned'] || 0,
            reviewed: statusMap['reviewed'] || 0,
            published: statusMap['published'] || 0,
        },
    };
});
exports.getManagementDashboard = getManagementDashboard;
exports.ReportsServices = {
    getStatusDistribution: exports.getStatusDistribution,
    getTurnaroundTime: exports.getTurnaroundTime,
    getTeacherPerformance: exports.getTeacherPerformance,
    getReviewerProductivity: exports.getReviewerProductivity,
    getSubjectAnalytics: exports.getSubjectAnalytics,
    getClassAnalytics: exports.getClassAnalytics,
    getLanguageReviewCompliance: exports.getLanguageReviewCompliance,
    getTimeTrends: exports.getTimeTrends,
    getOperationalEfficiency: exports.getOperationalEfficiency,
    getQualityMetrics: exports.getQualityMetrics,
    getManagementDashboard: exports.getManagementDashboard,
};
