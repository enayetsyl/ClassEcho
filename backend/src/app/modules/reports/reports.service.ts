// src/app/modules/reports/reports.service.ts

import { Video } from '../master/video/video.model';
import { User } from '../user/user.model';
import { ITeacherPerformanceMetrics, ITeacherPerformanceFilters, ITeacherActivityBySubject, ITeacherActivityByClass, ITeacherPerformanceSummary } from './reports.type';
import { Types } from 'mongoose';

// Helper to calculate average rating from review criteria
const calculateAverageRating = (review: any): number => {
  if (!review) return 0;
  
  const criteria = [
    review.subjectKnowledge?.rating,
    review.engagementWithStudents?.rating,
    review.useOfTeachingAids?.rating,
    review.interactionAndQuestionHandling?.rating,
    review.studentDiscipline?.rating,
    review.teachersControlOverClass?.rating,
    review.participationLevelOfStudents?.rating,
    review.completionOfPlannedSyllabus?.rating,
  ].filter(r => typeof r === 'number');
  
  if (criteria.length === 0) return 0;
  return criteria.reduce((sum, r) => sum + r, 0) / criteria.length;
};

// Helper to calculate criteria averages
const calculateCriteriaAverages = (videos: any[]) => {
  const criteria = [
    'subjectKnowledge',
    'engagementWithStudents',
    'useOfTeachingAids',
    'interactionAndQuestionHandling',
    'studentDiscipline',
    'teachersControlOverClass',
    'participationLevelOfStudents',
    'completionOfPlannedSyllabus',
  ];

  const averages: any = {};
  
  criteria.forEach(criterion => {
    const ratings = videos
      .map(v => v.review?.[criterion]?.rating)
      .filter((r): r is number => typeof r === 'number');
    
    averages[criterion] = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;
  });

  return averages;
};

// Helper to determine performance trend
const calculatePerformanceTrend = (videos: any[]): 'improving' | 'declining' | 'stable' => {
  if (videos.length < 2) return 'stable';
  
  const sortedVideos = videos
    .filter(v => v.review?.reviewedAt)
    .sort((a, b) => new Date(a.review.reviewedAt).getTime() - new Date(b.review.reviewedAt).getTime());
  
  if (sortedVideos.length < 2) return 'stable';
  
  const firstHalf = sortedVideos.slice(0, Math.floor(sortedVideos.length / 2));
  const secondHalf = sortedVideos.slice(Math.floor(sortedVideos.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, v) => sum + calculateAverageRating(v.review), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + calculateAverageRating(v.review), 0) / secondHalf.length;
  
  const diff = secondAvg - firstAvg;
  if (diff > 0.2) return 'improving';
  if (diff < -0.2) return 'declining';
  return 'stable';
};

// Get teacher performance metrics
export const getTeacherPerformanceMetrics = async (
  filters: ITeacherPerformanceFilters = {}
): Promise<ITeacherPerformanceMetrics[]> => {
  // Build query
  const query: any = {
    teacher: { $exists: true },
  };

  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }

  if (filters.subjectId) {
    query.subject = new Types.ObjectId(filters.subjectId);
  }

  if (filters.classId) {
    query.class = new Types.ObjectId(filters.classId);
  }

  // Get all videos matching filters
  const videos = await Video.find(query)
    .populate('teacher', 'name email')
    .populate('subject', 'name')
    .populate('class', 'name')
    .lean();

  // Group videos by teacher
  const teacherMap = new Map<string, any[]>();

  videos.forEach(video => {
    const teacherId = (video.teacher as any)._id.toString();
    if (!teacherMap.has(teacherId)) {
      teacherMap.set(teacherId, []);
    }
    teacherMap.get(teacherId)!.push(video);
  });

  // Calculate metrics for each teacher
  const metrics: ITeacherPerformanceMetrics[] = [];

  for (const [teacherId, teacherVideos] of teacherMap.entries()) {
    const teacher = teacherVideos[0].teacher as any;
    const reviewedVideos = teacherVideos.filter(v => v.review);
    const publishedVideos = teacherVideos.filter(v => v.status === 'published');
    const videosWithComments = publishedVideos.filter(v => v.teacherComment);

    // Calculate average rating from reviewed videos
    const ratings = reviewedVideos.map(v => calculateAverageRating(v.review)).filter(r => r > 0);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    // Calculate criteria averages
    const criteriaAverages = calculateCriteriaAverages(reviewedVideos);

    // Calculate response rate
    const responseRate = publishedVideos.length > 0
      ? (videosWithComments.length / publishedVideos.length) * 100
      : 0;

    // Calculate performance trend
    const performanceTrend = calculatePerformanceTrend(reviewedVideos);

    // Get last review date
    const lastReview = reviewedVideos
      .map(v => v.review?.reviewedAt)
      .filter(d => d)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0];

    // Apply rating filters if specified
    if (filters.minRating && averageRating < filters.minRating) continue;
    if (filters.maxRating && averageRating > filters.maxRating) continue;

    metrics.push({
      teacherId,
      teacherName: teacher.name || 'Unknown',
      teacherEmail: teacher.email || '',
      totalVideos: teacherVideos.length,
      publishedVideos: publishedVideos.length,
      reviewedVideos: reviewedVideos.length,
      averageRating: Math.round(averageRating * 100) / 100,
      criteriaAverages,
      responseRate: Math.round(responseRate * 100) / 100,
      performanceTrend,
      lastReviewDate: lastReview ? new Date(lastReview) : undefined,
    });
  }

  return metrics.sort((a, b) => b.averageRating - a.averageRating);
};

// Get teacher performance summary
export const getTeacherPerformanceSummary = async (
  filters: ITeacherPerformanceFilters = {}
): Promise<ITeacherPerformanceSummary> => {
  const allMetrics = await getTeacherPerformanceMetrics(filters);
  
  const totalTeachers = await User.countDocuments({ roles: 'Teacher', active: true });
  const teachersWithVideos = allMetrics.length;

  const overallRatings = allMetrics
    .map(m => m.averageRating)
    .filter(r => r > 0);
  
  const averageOverallRating = overallRatings.length > 0
    ? overallRatings.reduce((sum, r) => sum + r, 0) / overallRatings.length
    : 0;

  // Top 10 performers
  const topPerformers = allMetrics
    .filter(m => m.averageRating > 0)
    .slice(0, 10);

  // Bottom 10 (needs improvement
  const needsImprovement = allMetrics
    .filter(m => m.averageRating > 0 && m.reviewedVideos >= 2) // At least 2 reviews
    .slice(-10)
    .reverse();

  return {
    totalTeachers,
    teachersWithVideos,
    averageOverallRating: Math.round(averageOverallRating * 100) / 100,
    topPerformers,
    needsImprovement,
  };
};

// Get teacher activity by subject
export const getTeacherActivityBySubject = async (
  teacherId: string,
  filters: ITeacherPerformanceFilters = {}
): Promise<ITeacherActivityBySubject[]> => {
  const query: any = {
    teacher: new Types.ObjectId(teacherId),
  };

  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }

  const videos = await Video.find(query)
    .populate('subject', 'name')
    .lean();

  const subjectMap = new Map<string, any[]>();

  videos.forEach(video => {
    const subjectId = (video.subject as any)._id.toString();
    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, []);
    }
    subjectMap.get(subjectId)!.push(video);
  });

  const activities: ITeacherActivityBySubject[] = [];

  for (const [subjectId, subjectVideos] of subjectMap.entries()) {
    const subject = subjectVideos[0].subject as any;
    const reviewedVideos = subjectVideos.filter(v => v.review);
    
    const ratings = reviewedVideos.map(v => calculateAverageRating(v.review)).filter(r => r > 0);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    activities.push({
      subjectId,
      subjectName: subject.name || 'Unknown',
      videoCount: subjectVideos.length,
      averageRating: Math.round(averageRating * 100) / 100,
    });
  }

  return activities.sort((a, b) => b.videoCount - a.videoCount);
};

// Get teacher activity by class
export const getTeacherActivityByClass = async (
  teacherId: string,
  filters: ITeacherPerformanceFilters = {}
): Promise<ITeacherActivityByClass[]> => {
  const query: any = {
    teacher: new Types.ObjectId(teacherId),
  };

  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }

  const videos = await Video.find(query)
    .populate('class', 'name')
    .lean();

  const classMap = new Map<string, any[]>();

  videos.forEach(video => {
    const classId = (video.class as any)._id.toString();
    if (!classMap.has(classId)) {
      classMap.set(classId, []);
    }
    classMap.get(classId)!.push(video);
  });

  const activities: ITeacherActivityByClass[] = [];

  for (const [classId, classVideos] of classMap.entries()) {
    const classData = classVideos[0].class as any;
    const reviewedVideos = classVideos.filter(v => v.review);
    
    const ratings = reviewedVideos.map(v => calculateAverageRating(v.review)).filter(r => r > 0);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    activities.push({
      classId,
      className: classData.name || 'Unknown',
      videoCount: classVideos.length,
      averageRating: Math.round(averageRating * 100) / 100,
    });
  }

  return activities.sort((a, b) => b.videoCount - a.videoCount);
};

export const ReportsServices = {
  getTeacherPerformanceMetrics,
  getTeacherPerformanceSummary,
  getTeacherActivityBySubject,
  getTeacherActivityByClass,
};

