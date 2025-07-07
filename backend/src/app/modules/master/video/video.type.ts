// src/app/modules/video/video.type.ts

import { Types } from "mongoose";
import { IClass } from "../class/class.type";
import { ISection } from "../section/section.type";
import { ISubject } from "../subject/subject.type";

export type VideoStatus = 'unassigned' | 'assigned' | 'reviewed' | 'published';

export interface IReviewCriterion {
  rating: number;
  comment: string;
}

export interface IReviewInput {
  subjectKnowledge:           IReviewCriterion;
  engagementWithStudents:     IReviewCriterion;
  useOfTeachingAids:          IReviewCriterion;
  interactionAndQuestionHandling: IReviewCriterion;
  studentDiscipline:          IReviewCriterion;
  teachersControlOverClass:   IReviewCriterion;
  participationLevelOfStudents:IReviewCriterion;
  completionOfPlannedSyllabus:IReviewCriterion;
  overallComments:            string;
  strengthsObserved?:         string;
  areasForImprovement?:       string;
  immediateSuggestions?:      string;
}

export interface IReview {
  reviewer:Types.ObjectId | string | ITeacherInfo;
  subjectKnowledge: IReviewCriterion;
  engagementWithStudents: IReviewCriterion;
  useOfTeachingAids: IReviewCriterion;
  interactionAndQuestionHandling: IReviewCriterion;
  studentDiscipline: IReviewCriterion;
  teachersControlOverClass: IReviewCriterion;
  participationLevelOfStudents: IReviewCriterion;
  completionOfPlannedSyllabus: IReviewCriterion;
  overallComments: string;
  strengthsObserved?: string;
  areasForImprovement?: string;
  immediateSuggestions?: string;
  reviewedAt: Date;
}
export interface ITeacherInfo {
  _id:   string;
  name:  string;
  email: string;
}

export interface ITeacherComment {
  commenter: string | ITeacherInfo;
  comment: string;
  commentedAt: Date;
}

export interface IVideo {
  _id?: string;
  teacher: string  | ITeacherInfo;
  class: string | IClass;
  section: string | ISection;
  subject: string | ISubject;
  date: Date;
  youtubeUrl: string;
  uploadedBy: string;
  status?: VideoStatus;
  assignedReviewer?: string  | ITeacherInfo;
  review?: IReview;                // ← newly added
  teacherComment?: ITeacherComment; // ← newly added
  createdAt?: Date;
  updatedAt?: Date;
}