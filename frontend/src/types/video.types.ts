// src/types/video.types.ts

import { IClass } from "./class.types";
import { ISection } from "./section.types";
import { ISubject } from "./subject.types";

/** Review left by a reviewer */
export interface TReview {
  reviewer: string;
  classManagement: string;
  subjectKnowledge: string;
  otherComments: string;
  reviewedAt: string;          // ISO date
}

/** Comment added by the class teacher */
export interface TTeacherComment {
  commenter: string;
  comment: string;
  commentedAt: string;         // ISO date
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
export interface TSubmitReviewPayload {
  classManagement: string;
  subjectKnowledge: string;
  otherComments: string;
}

/** Payload to add a comment as teacher */
export interface TTeacherCommentPayload {
  comment: string;
}
