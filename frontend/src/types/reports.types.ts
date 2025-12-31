// src/types/reports.types.ts

export interface ITeacherPerformanceMetrics {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  totalVideos: number;
  publishedVideos: number;
  reviewedVideos: number;
  averageRating: number;
  criteriaAverages: {
    subjectKnowledge: number;
    engagementWithStudents: number;
    useOfTeachingAids: number;
    interactionAndQuestionHandling: number;
    studentDiscipline: number;
    teachersControlOverClass: number;
    participationLevelOfStudents: number;
    completionOfPlannedSyllabus: number;
  };
  responseRate: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  lastReviewDate?: string;
}

export interface ITeacherPerformanceFilters {
  dateFrom?: string;
  dateTo?: string;
  subjectId?: string;
  classId?: string;
  minRating?: number;
  maxRating?: number;
}

export interface ITeacherActivityBySubject {
  subjectId: string;
  subjectName: string;
  videoCount: number;
  averageRating: number;
}

export interface ITeacherActivityByClass {
  classId: string;
  className: string;
  videoCount: number;
  averageRating: number;
}

export interface ITeacherPerformanceSummary {
  totalTeachers: number;
  teachersWithVideos: number;
  averageOverallRating: number;
  topPerformers: ITeacherPerformanceMetrics[];
  needsImprovement: ITeacherPerformanceMetrics[];
}

