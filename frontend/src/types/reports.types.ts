// src/types/reports.types.ts

export type VideoStatus = 'unassigned' | 'assigned' | 'reviewed' | 'published';

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
  commentRate: number;
}

export interface ITeacherPerformanceReport {
  teachers: ITeacherPerformanceScore[]; // Active teachers only (for backward compatibility)
  activeTeachers: ITeacherPerformanceScore[];
  deactivatedTeachers: ITeacherPerformanceScore[];
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
  period: string;
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
    assigned: number;
    reviewed: number;
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
  teacherCommentRate: number;
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
  systemHealthScore: number;
  statusSummary: {
    unassigned: number;
    assigned: number;
    reviewed: number;
    published: number;
  };
}

export interface TReportsParams extends IDateRangeFilter {
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface IPendingVideo {
  videoId: string;
  teacherName: string;
  teacherEmail: string;
  className: string;
  sectionName: string;
  subjectName: string;
  date: string;
  youtubeUrl: string;
  assignedReviewerName?: string;
  assignedReviewerEmail?: string;
  daysInStatus: number;
  status: 'assigned' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}

export interface IPendingVideosReport {
  pendingReview: {
    total: number;
    videos: IPendingVideo[];
    averageDays: number;
    exceedingSLA: number;
  };
  pendingPublication: {
    total: number;
    videos: IPendingVideo[];
    averageDays: number;
    exceedingSLA: number;
  };
}

