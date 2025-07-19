// src/types/video.types.ts

import { IClass } from "./class.types";
import { ISection } from "./section.types";
import { ISubject } from "./subject.types";


export interface TLanguageReviewCriterion {
  answeredYes: boolean;
  comment:     string;
}

export interface TLanguageReview {
  reviewer:                   string;
  classStartedOnTime:         TLanguageReviewCriterion;
  classPerformedAsTraining:   TLanguageReviewCriterion;
  canMaintainDiscipline:      TLanguageReviewCriterion;
  studentsUnderstandLesson:   TLanguageReviewCriterion;
  isClassInteractive:         TLanguageReviewCriterion;
  teacherSignsHomeworkDiary:  TLanguageReviewCriterion;
  teacherChecksDiary:         TLanguageReviewCriterion;
  otherComments?:             string;
  reviewedAt:                 string;
}

export interface TReviewCriterion {
  rating: number;
  comment: string;
}

export interface TReview {
  reviewer: string;
  subjectKnowledge: TReviewCriterion;
  engagementWithStudents: TReviewCriterion;
  useOfTeachingAids: TReviewCriterion;
  interactionAndQuestionHandling: TReviewCriterion;
  studentDiscipline: TReviewCriterion;
  teachersControlOverClass: TReviewCriterion;
  participationLevelOfStudents: TReviewCriterion;
  completionOfPlannedSyllabus: TReviewCriterion;
  overallComments: string;
  strengthsObserved?: string;
  areasForImprovement?: string;
  immediateSuggestions?: string;
  reviewedAt: string;
}

/** Comment added by the class teacher */
export interface TTeacherComment {
  commenter: string;
  comment: string;
  commentedAt: string;         
}

export interface TTeacherID {
  _id: string;
  name: string;
  email: string;
}

/** Main Video record */
export interface TVideo {
  _id: string;
  teacher: TTeacherID;
  class: IClass;
  section: ISection;
  subject: ISubject;
  date: string;                // ISO date
  youtubeUrl: string;
  uploadedBy: string;
  status: 'unassigned' | 'assigned' | 'reviewed' | 'published';
  assignedReviewer?: TTeacherID;
  review?: TReview;
  languageReview?: TLanguageReview; 
  teacherComment?: TTeacherComment;
  createdAt: string;           // ISO date
  updatedAt: string;           // ISO date
}

/** Payload to create a new video record */
export interface TCreateVideoPayload {
  teacherId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  date: string;        // ISO date
  videoUrl: string;
}

/** Optional filters for listing videos */
export interface TListVideosParams {
  status?: TVideo['status'];
  assignedReviewer?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  dateFrom?: string;   // ISO date
  dateTo?: string;     // ISO date
}

/** Payload to assign/reassign a reviewer */
export interface TAssignReviewerPayload {
  id: string;          // video _id
  reviewerId: string;
}

/** Payload to submit a review */
export interface TReviewCriterionPayload {
  rating: number;
  comment: string;
}

export interface TSubmitReviewPayload {
  subjectKnowledge:            TReviewCriterionPayload;
  engagementWithStudents:      TReviewCriterionPayload;
  useOfTeachingAids:           TReviewCriterionPayload;
  interactionAndQuestionHandling: TReviewCriterionPayload;
  studentDiscipline:           TReviewCriterionPayload;
  teachersControlOverClass:    TReviewCriterionPayload;
  participationLevelOfStudents: TReviewCriterionPayload;
  completionOfPlannedSyllabus: TReviewCriterionPayload;

  overallComments:             string;
  strengthsObserved?:          string;
  areasForImprovement?:        string;
  immediateSuggestions?:       string;
}

/** Payload to add a comment as teacher */
export interface TTeacherCommentPayload {
  comment: string;
}
