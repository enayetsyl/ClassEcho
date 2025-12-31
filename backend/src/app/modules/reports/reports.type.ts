// src/app/modules/reports/reports.type.ts

import { VideoStatus } from '../master/video/video.type';

export interface IDateRangeFilter {
  dateFrom?: string;
  dateTo?: string;
}

export interface IStatusDistribution {
  status: VideoStatus;
  count: number;
  percentage: number;
}

export interface IStatusDistributionReport {
  total: number;
  distributions: IStatusDistribution[];
  byClass?: Record<string, IStatusDistribution[]>;
  bySection?: Record<string, IStatusDistribution[]>;
  bySubject?: Record<string, IStatusDistribution[]>;
}

export interface ITurnaroundTime {
  averageDays: number;
  minDays: number;
  maxDays: number;
  medianDays: number;
}

export interface ITurnaroundTimeReport {
  uploadToAssignment: ITurnaroundTime;
  assignmentToReview: ITurnaroundTime;
  reviewToPublication: ITurnaroundTime;
  totalCycleTime: ITurnaroundTime;
}

export interface ITeacherPerformanceScore {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  totalVideos: number;
  publishedVideos: number;
  averageRating: number;
  criteriaScores: {
    subjectKnowledge: number;
    engagementWithStudents: number;
    useOfTeachingAids: number;
    interactionAndQuestionHandling: number;
    studentDiscipline: number;
    teachersControlOverClass: number;
    participationLevelOfStudents: number;
    completionOfPlannedSyllabus: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  commentRate: number; // percentage of published videos with teacher comments
}

export interface ITeacherPerformanceReport {
  teachers: ITeacherPerformanceScore[];
  overallAverage: number;
  topPerformers: ITeacherPerformanceScore[];
  needsImprovement: ITeacherPerformanceScore[];
}

export interface IReviewerProductivity {
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  totalReviews: number;
  pendingReviews: number;
  averageCompletionDays: number;
  reviewsThisMonth: number;
  reviewsLastMonth: number;
}

export interface IReviewerProductivityReport {
  reviewers: IReviewerProductivity[];
  totalPendingReviews: number;
  averageCompletionTime: number;
}

export interface ISubjectAnalytics {
  subjectId: string;
  subjectName: string;
  totalVideos: number;
  averageRating: number;
  videosByStatus: {
    unassigned: number;
    assigned: number;
    reviewed: number;
    published: number;
  };
}

export interface IClassAnalytics {
  classId: string;
  className: string;
  totalVideos: number;
  averageRating: number;
  videosByStatus: {
    unassigned: number;
    assigned: number;
    reviewed: number;
    published: number;
  };
}

export interface ISectionAnalytics {
  sectionId: string;
  sectionName: string;
  totalVideos: number;
  averageRating: number;
  videosByStatus: {
    unassigned: number;
    assigned: number;
    reviewed: number;
    published: number;
  };
}

export interface ILanguageReviewCompliance {
  totalVideos: number;
  videosWithLanguageReview: number;
  complianceRate: number;
  criteriaCompliance: {
    classStartedOnTime: { yes: number; no: number; percentage: number };
    classPerformedAsTraining: { yes: number; no: number; percentage: number };
    canMaintainDiscipline: { yes: number; no: number; percentage: number };
    studentsUnderstandLesson: { yes: number; no: number; percentage: number };
    isClassInteractive: { yes: number; no: number; percentage: number };
    teacherSignsHomeworkDiary: { yes: number; no: number; percentage: number };
    teacherChecksDiary: { yes: number; no: number; percentage: number };
  };
}

export interface ITimeTrend {
  period: string; // '2024-01', '2024-02', etc.
  videosUploaded: number;
  videosReviewed: number;
  videosPublished: number;
  averageRating: number;
}

export interface ITimeTrendReport {
  trends: ITimeTrend[];
  period: 'daily' | 'weekly' | 'monthly';
}

export interface IOperationalEfficiency {
  reviewQueueSize: number;
  publicationQueueSize: number;
  averageDaysInUnassigned: number;
  averageDaysInAssigned: number;
  averageDaysInReviewed: number;
  videosExceedingSLA: {
    assigned: number; // videos in assigned status > 7 days
    reviewed: number; // videos in reviewed status > 3 days
  };
}

export interface IQualityMetrics {
  averageRatingDistribution: {
    rating1: number;
    rating2: number;
    rating3: number;
    rating4: number;
    rating5: number;
  };
  reviewsWithDetails: {
    withStrengths: number;
    withImprovements: number;
    withSuggestions: number;
    percentage: number;
  };
  teacherCommentRate: number; // percentage of published videos with teacher comments
  dataCompleteness: {
    videosWithReviews: number;
    videosWithLanguageReviews: number;
    completenessPercentage: number;
  };
}

export interface IManagementDashboard {
  totalVideos: number;
  videosPublishedThisMonth: number;
  averageTeacherPerformanceScore: number;
  reviewCompletionRate: number;
  averageReviewTurnaroundTime: number;
  activeTeachersCount: number;
  activeReviewersCount: number;
  systemHealthScore: number; // 0-100 calculated score
  statusSummary: {
    unassigned: number;
    assigned: number;
    reviewed: number;
    published: number;
  };
}

