// src/app/modules/reports/reports.service.ts

import { Video } from '../master/video/video.model';
import { User } from '../user/user.model';
import { VideoStatus } from '../master/video/video.type';
import {
  IDateRangeFilter,
  IStatusDistributionReport,
  ITurnaroundTimeReport,
  ITeacherPerformanceReport,
  IReviewerProductivityReport,
  ISubjectAnalytics,
  IClassAnalytics,
  ISectionAnalytics,
  ILanguageReviewCompliance,
  ITimeTrendReport,
  IOperationalEfficiency,
  IQualityMetrics,
  IManagementDashboard,
  ITeacherPerformanceScore,
  IReviewerProductivity,
  ITimeTrend,
} from './reports.type';

// Helper to build date filter
const buildDateFilter = (filters: IDateRangeFilter) => {
  const dateFilter: any = {};
  if (filters.dateFrom || filters.dateTo) {
    dateFilter.date = {};
    if (filters.dateFrom) dateFilter.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) dateFilter.date.$lte = new Date(filters.dateTo);
  }
  return dateFilter;
};

// 1. Status Distribution Report
export const getStatusDistribution = async (
  filters: IDateRangeFilter = {},
): Promise<IStatusDistributionReport> => {
  const dateFilter = buildDateFilter(filters);
  const matchStage: any = { ...dateFilter };

  const statusCounts = await Video.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = statusCounts.reduce((sum, item) => sum + item.count, 0);
  const distributions = (['unassigned', 'assigned', 'reviewed', 'published'] as VideoStatus[]).map(
    (status) => {
      const found = statusCounts.find((s) => s._id === status);
      const count = found?.count || 0;
      return {
        status,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      };
    },
  );

  // By Class
  const byClassAgg = await Video.aggregate([
    { $match: matchStage },
    { $group: { _id: { class: '$class', status: '$status' }, count: { $sum: 1 } } },
    { $lookup: { from: 'classes', localField: '_id.class', foreignField: '_id', as: 'classInfo' } },
    { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
  ]);

  const byClass: Record<string, any[]> = {};
  byClassAgg.forEach((item) => {
    const className = item.classInfo?.name || 'Unknown';
    if (!byClass[className]) byClass[className] = [];
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
};

// 2. Turnaround Time Report
export const getTurnaroundTime = async (
  filters: IDateRangeFilter = {},
): Promise<ITurnaroundTimeReport> => {
  const dateFilter = buildDateFilter(filters);

  const videos = await Video.find({
    ...dateFilter,
    status: { $in: ['reviewed', 'published'] },
  })
    .select('createdAt updatedAt review.assignedReviewer review.reviewedAt status')
    .lean();

  const calculateTimeDiff = (start: Date, end: Date): number => {
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // days
  };

  const uploadToAssignment: number[] = [];
  const assignmentToReview: number[] = [];
  const reviewToPublication: number[] = [];
  const totalCycleTime: number[] = [];

  // This is simplified - you'd need to track assignment time separately
  // For now, we'll use updatedAt as proxy for assignment time
  videos.forEach((video) => {
    if (video.review?.reviewedAt && video.createdAt) {
      const reviewTime = calculateTimeDiff(new Date(video.createdAt), new Date(video.review.reviewedAt));
      assignmentToReview.push(reviewTime);

      if (video.status === 'published' && video.updatedAt) {
        const pubTime = calculateTimeDiff(
          new Date(video.review.reviewedAt),
          new Date(video.updatedAt),
        );
        reviewToPublication.push(pubTime);
        totalCycleTime.push(calculateTimeDiff(new Date(video.createdAt), new Date(video.updatedAt)));
      }
    }
  });

  const calculateStats = (times: number[]) => {
    if (times.length === 0) return { averageDays: 0, minDays: 0, maxDays: 0, medianDays: 0 };
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
};

// 3. Teacher Performance Report
export const getTeacherPerformance = async (
  filters: IDateRangeFilter = {},
): Promise<ITeacherPerformanceReport> => {
  const dateFilter = buildDateFilter(filters);

  const teacherStats = await Video.aggregate([
    { $match: { ...dateFilter, review: { $exists: true, $ne: null } } },
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

  const teachers: ITeacherPerformanceScore[] = teacherStats.map((stat) => {
    const allRatings: number[] = [];
    const criteriaTotals: Record<string, number[]> = {
      subjectKnowledge: [],
      engagementWithStudents: [],
      useOfTeachingAids: [],
      interactionAndQuestionHandling: [],
      studentDiscipline: [],
      teachersControlOverClass: [],
      participationLevelOfStudents: [],
      completionOfPlannedSyllabus: [],
    };

    stat.ratings.forEach((rating: any) => {
      Object.keys(criteriaTotals).forEach((key) => {
        if (rating[key]) {
          criteriaTotals[key].push(rating[key]);
          allRatings.push(rating[key]);
        }
      });
    });

    const criteriaScores: any = {};
    Object.keys(criteriaTotals).forEach((key) => {
      const arr = criteriaTotals[key];
      criteriaScores[key] = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    });

    const averageRating =
      allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;

    return {
      teacherId: stat._id.toString(),
      teacherName: stat.teacherInfo?.name || 'Unknown',
      teacherEmail: stat.teacherInfo?.email || '',
      totalVideos: stat.totalVideos,
      publishedVideos: stat.publishedVideos,
      averageRating: Math.round(averageRating * 100) / 100,
      criteriaScores: {
        subjectKnowledge: Math.round(criteriaScores.subjectKnowledge * 100) / 100,
        engagementWithStudents: Math.round(criteriaScores.engagementWithStudents * 100) / 100,
        useOfTeachingAids: Math.round(criteriaScores.useOfTeachingAids * 100) / 100,
        interactionAndQuestionHandling:
          Math.round(criteriaScores.interactionAndQuestionHandling * 100) / 100,
        studentDiscipline: Math.round(criteriaScores.studentDiscipline * 100) / 100,
        teachersControlOverClass: Math.round(criteriaScores.teachersControlOverClass * 100) / 100,
        participationLevelOfStudents:
          Math.round(criteriaScores.participationLevelOfStudents * 100) / 100,
        completionOfPlannedSyllabus:
          Math.round(criteriaScores.completionOfPlannedSyllabus * 100) / 100,
      },
      trend: 'stable' as const, // Simplified - would need historical data
      commentRate:
        stat.publishedVideos > 0 ? (stat.commentsCount / stat.publishedVideos) * 100 : 0,
    };
  });

  const overallAverage =
    teachers.length > 0
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
};

// 4. Reviewer Productivity Report
export const getReviewerProductivity = async (
  filters: IDateRangeFilter = {},
): Promise<IReviewerProductivityReport> => {
  const dateFilter = buildDateFilter(filters);

  const reviewerStats = await Video.aggregate([
    {
      $match: {
        ...dateFilter,
        assignedReviewer: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$assignedReviewer',
        totalReviews: { $sum: { $cond: [{ $ne: ['$review', null] }, 1, 0] } },
        pendingReviews: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
        reviews: {
          $push: {
            reviewedAt: '$review.reviewedAt',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
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

  const reviewers: IReviewerProductivity[] = reviewerStats.map((stat) => {
    const completionTimes: number[] = [];
    let reviewsThisMonth = 0;
    let reviewsLastMonth = 0;

    stat.reviews.forEach((review: any) => {
      if (review.reviewedAt) {
        const reviewedDate = new Date(review.reviewedAt);
        const createdAt = review.createdAt ? new Date(review.createdAt) : reviewedDate;
        const updatedAt = review.updatedAt ? new Date(review.updatedAt) : reviewedDate;
        
        // Determine assignment date:
        // 1. If updatedAt is before reviewedAt, it might be from assignment (but could be from earlier updates)
        // 2. Use the earlier of createdAt or updatedAt (before review) as assignment approximation
        // 3. Videos are typically assigned soon after creation, so createdAt is a reasonable approximation
        let assignedDate: Date;
        if (updatedAt < reviewedDate && updatedAt > createdAt) {
          // updatedAt is between creation and review - likely the assignment time
          assignedDate = updatedAt;
        } else {
          // Use createdAt as fallback (videos assigned soon after creation)
          // This is more reliable than updatedAt which can be after review (when published)
          assignedDate = createdAt;
        }
        
        const days = (reviewedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        // Only include positive or zero values (sanity check)
        if (days >= 0) {
          completionTimes.push(days);
        }

        if (
          reviewedDate.getMonth() === currentMonth &&
          reviewedDate.getFullYear() === currentYear
        ) {
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
      reviewerName: stat.reviewerInfo?.name || 'Unknown',
      reviewerEmail: stat.reviewerInfo?.email || '',
      totalReviews: stat.totalReviews,
      pendingReviews: stat.pendingReviews,
      averageCompletionDays:
        completionTimes.length > 0
          ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
          : 0,
      reviewsThisMonth,
      reviewsLastMonth,
    };
  });

  const totalPending = reviewers.reduce((sum, r) => sum + r.pendingReviews, 0);
  const avgCompletion =
    reviewers.length > 0
      ? reviewers.reduce((sum, r) => sum + r.averageCompletionDays, 0) / reviewers.length
      : 0;

  return {
    reviewers,
    totalPendingReviews: totalPending,
    averageCompletionTime: Math.round(avgCompletion * 100) / 100,
  };
};

// 5. Subject Analytics
export const getSubjectAnalytics = async (
  filters: IDateRangeFilter = {},
): Promise<ISubjectAnalytics[]> => {
  const dateFilter = buildDateFilter(filters);

  const subjectStats = await Video.aggregate([
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
    const validRatings = stat.ratings.filter((r: any) => r != null);
    const avgRating =
      validRatings.length > 0
        ? validRatings.reduce((a: number, b: number) => a + b, 0) / validRatings.length
        : 0;

    return {
      subjectId: stat._id.toString(),
      subjectName: stat.subjectInfo?.name || 'Unknown',
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
};

// 6. Class Analytics
export const getClassAnalytics = async (
  filters: IDateRangeFilter = {},
): Promise<IClassAnalytics[]> => {
  const dateFilter = buildDateFilter(filters);

  const classStats = await Video.aggregate([
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
    const validRatings = stat.ratings.filter((r: any) => r != null);
    const avgRating =
      validRatings.length > 0
        ? validRatings.reduce((a: number, b: number) => a + b, 0) / validRatings.length
        : 0;

    return {
      classId: stat._id.toString(),
      className: stat.classInfo?.name || 'Unknown',
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
};

// 7. Language Review Compliance
export const getLanguageReviewCompliance = async (
  filters: IDateRangeFilter = {},
): Promise<ILanguageReviewCompliance> => {
  const dateFilter = buildDateFilter(filters);

  const videos = await Video.find({
    ...dateFilter,
    languageReview: { $exists: true, $ne: null },
  }).lean();

  const totalVideos = await Video.countDocuments(dateFilter);
  const videosWithLanguageReview = videos.length;

  const criteriaCounts: Record<string, { yes: number; no: number }> = {
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
        const criterion = video.languageReview?.[key as keyof typeof video.languageReview] as any;
        if (criterion?.answeredYes) {
          criteriaCounts[key].yes++;
        } else {
          criteriaCounts[key].no++;
        }
      });
    }
  });

  const criteriaCompliance: any = {};
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
};

// 8. Time Trend Report
export const getTimeTrends = async (
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  filters: IDateRangeFilter = {},
): Promise<ITimeTrendReport> => {
  const dateFilter = buildDateFilter(filters);

  let groupFormat: any;
  if (period === 'daily') {
    groupFormat = {
      year: { $year: '$date' },
      month: { $month: '$date' },
      day: { $dayOfMonth: '$date' },
    };
  } else if (period === 'weekly') {
    groupFormat = {
      year: { $year: '$date' },
      week: { $week: '$date' },
    };
  } else {
    groupFormat = {
      year: { $year: '$date' },
      month: { $month: '$date' },
    };
  }

  const trends = await Video.aggregate([
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

  const formattedTrends: ITimeTrend[] = trends.map((trend) => {
    let periodStr = '';
    if (period === 'daily') {
      periodStr = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(
        trend._id.day,
      ).padStart(2, '0')}`;
    } else if (period === 'weekly') {
      periodStr = `${trend._id.year}-W${String(trend._id.week).padStart(2, '0')}`;
    } else {
      periodStr = `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`;
    }

    const validRatings = trend.ratings.filter((r: any) => r != null);
    const avgRating =
      validRatings.length > 0
        ? validRatings.reduce((a: number, b: number) => a + b, 0) / validRatings.length
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
};

// 9. Operational Efficiency
export const getOperationalEfficiency = async (
  filters: IDateRangeFilter = {},
): Promise<IOperationalEfficiency> => {
  const dateFilter = buildDateFilter(filters);

  const videos = await Video.find(dateFilter)
    .select('status createdAt updatedAt review.reviewedAt')
    .lean();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  let reviewQueueSize = 0;
  let publicationQueueSize = 0;
  const daysInUnassigned: number[] = [];
  const daysInAssigned: number[] = [];
  const daysInReviewed: number[] = [];
  let assignedExceedingSLA = 0;
  let reviewedExceedingSLA = 0;

  videos.forEach((video) => {
    const created = new Date(video.createdAt);
    const updated = new Date(video.updatedAt);

    if (video.status === 'assigned') {
      reviewQueueSize++;
      const days = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
      daysInAssigned.push(days);
      if (updated < sevenDaysAgo) assignedExceedingSLA++;
    } else if (video.status === 'reviewed') {
      publicationQueueSize++;
      const days = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
      daysInReviewed.push(days);
      if (updated < threeDaysAgo) reviewedExceedingSLA++;
    } else if (video.status === 'unassigned') {
      const days = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      daysInUnassigned.push(days);
    }
  });

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

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
};

// 10. Quality Metrics
export const getQualityMetrics = async (
  filters: IDateRangeFilter = {},
): Promise<IQualityMetrics> => {
  const dateFilter = buildDateFilter(filters);

  const videos = await Video.find({
    ...dateFilter,
    review: { $exists: true, $ne: null },
  }).lean();

  const ratingDistribution = { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 };
  let withStrengths = 0;
  let withImprovements = 0;
  let withSuggestions = 0;

  videos.forEach((video) => {
    if (video.review) {
      const ratings = [
        video.review.subjectKnowledge?.rating,
        video.review.engagementWithStudents?.rating,
        video.review.useOfTeachingAids?.rating,
        video.review.interactionAndQuestionHandling?.rating,
        video.review.studentDiscipline?.rating,
        video.review.teachersControlOverClass?.rating,
        video.review.participationLevelOfStudents?.rating,
        video.review.completionOfPlannedSyllabus?.rating,
      ].filter((r) => r != null);

      ratings.forEach((rating) => {
        if (rating === 1) ratingDistribution.rating1++;
        else if (rating === 2) ratingDistribution.rating2++;
        else if (rating === 3) ratingDistribution.rating3++;
        else if (rating === 4) ratingDistribution.rating4++;
        else if (rating === 5) ratingDistribution.rating5++;
      });

      if (video.review.strengthsObserved) withStrengths++;
      if (video.review.areasForImprovement) withImprovements++;
      if (video.review.immediateSuggestions) withSuggestions++;
    }
  });

  const totalReviews = videos.length;
  const reviewsWithDetails = withStrengths + withImprovements + withSuggestions;

  // Teacher comment rate
  const publishedVideos = await Video.countDocuments({
    ...dateFilter,
    status: 'published',
  });
  const videosWithComments = await Video.countDocuments({
    ...dateFilter,
    status: 'published',
    teacherComment: { $exists: true, $ne: null },
  });

  // Data completeness
  const totalVideos = await Video.countDocuments(dateFilter);
  const videosWithLanguageReviews = await Video.countDocuments({
    ...dateFilter,
    languageReview: { $exists: true, $ne: null },
  });

  return {
    averageRatingDistribution: ratingDistribution,
    reviewsWithDetails: {
      withStrengths,
      withImprovements,
      withSuggestions,
      percentage:
        totalReviews > 0 ? (reviewsWithDetails / totalReviews) * 100 : 0,
    },
    teacherCommentRate: publishedVideos > 0 ? (videosWithComments / publishedVideos) * 100 : 0,
    dataCompleteness: {
      videosWithReviews: totalReviews,
      videosWithLanguageReviews,
      completenessPercentage:
        totalVideos > 0 ? ((totalReviews + videosWithLanguageReviews) / (totalVideos * 2)) * 100 : 0,
    },
  };
};

// 11. Management Dashboard (Summary)
export const getManagementDashboard = async (
  filters: IDateRangeFilter = {},
): Promise<IManagementDashboard> => {
  const dateFilter = buildDateFilter(filters);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalVideos,
    videosPublishedThisMonth,
    statusSummary,
    teacherPerf,
    reviewerProd,
    operationalEff,
  ] = await Promise.all([
    Video.countDocuments(dateFilter),
    Video.countDocuments({
      ...dateFilter,
      status: 'published',
      updatedAt: { $gte: startOfMonth },
    }),
    Video.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    getTeacherPerformance(filters),
    getReviewerProductivity(filters),
    getOperationalEfficiency(filters),
  ]);

  const statusMap: Record<string, number> = {};
  statusSummary.forEach((s: any) => {
    statusMap[s._id] = s.count;
  });

  const activeTeachers = await User.countDocuments({
    roles: { $in: ['Teacher'] },
    active: true,
  });

  const activeReviewers = await User.countDocuments({
    roles: { $in: ['Teacher', 'Admin', 'SeniorAdmin'] },
    active: true,
  });

  // Calculate review completion rate
  const assignedVideos = statusMap['assigned'] || 0;
  const reviewedVideos = (statusMap['reviewed'] || 0) + (statusMap['published'] || 0);
  const reviewCompletionRate =
    assignedVideos + reviewedVideos > 0
      ? (reviewedVideos / (assignedVideos + reviewedVideos)) * 100
      : 0;

  // System health score (0-100)
  const healthFactors = {
    reviewQueue: operationalEff.reviewQueueSize < 10 ? 100 : Math.max(0, 100 - operationalEff.reviewQueueSize * 5),
    publicationQueue: operationalEff.publicationQueueSize < 5 ? 100 : Math.max(0, 100 - operationalEff.publicationQueueSize * 10),
    slaCompliance: (operationalEff.videosExceedingSLA.assigned + operationalEff.videosExceedingSLA.reviewed) === 0 ? 100 : 50,
    reviewCompletion: reviewCompletionRate,
  };
  const systemHealthScore = Math.round(
    (healthFactors.reviewQueue +
      healthFactors.publicationQueue +
      healthFactors.slaCompliance +
      healthFactors.reviewCompletion) /
      4,
  );

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
};

export const ReportsServices = {
  getStatusDistribution,
  getTurnaroundTime,
  getTeacherPerformance,
  getReviewerProductivity,
  getSubjectAnalytics,
  getClassAnalytics,
  getLanguageReviewCompliance,
  getTimeTrends,
  getOperationalEfficiency,
  getQualityMetrics,
  getManagementDashboard,
};

