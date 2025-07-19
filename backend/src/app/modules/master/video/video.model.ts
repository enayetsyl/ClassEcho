// src/app/modules/video/video.model.ts

import { Schema, model, Types, Document } from 'mongoose';
import { ILanguageReview, IReview, VideoStatus } from './video.type';

// src/app/modules/video/video.model.ts
const SubCriterionSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);


const SubReviewSchema = new Schema(
  {
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectKnowledge:           { type: SubCriterionSchema, required: true },
    engagementWithStudents:     { type: SubCriterionSchema, required: true },
    useOfTeachingAids:          { type: SubCriterionSchema, required: true },
    interactionAndQuestionHandling: { type: SubCriterionSchema, required: true },
    studentDiscipline:          { type: SubCriterionSchema, required: true },
    teachersControlOverClass:   { type: SubCriterionSchema, required: true },
    participationLevelOfStudents:{ type: SubCriterionSchema, required: true },
    completionOfPlannedSyllabus:{ type: SubCriterionSchema, required: true },
    overallComments:            { type: String, trim: true, required: true },
    strengthsObserved:          { type: String, trim: true, default: '' },
    areasForImprovement:        { type: String, trim: true, default: '' },
    immediateSuggestions:       { type: String, trim: true, default: '' },
    reviewedAt:                 { type: Date, required: true },
  },
  { _id: false },
);

export interface IVideoDocument extends Document {
  teacher: Types.ObjectId;
  class: Types.ObjectId;
  section: Types.ObjectId;
  subject: Types.ObjectId;
  date: Date;
  youtubeUrl: string;
  uploadedBy: Types.ObjectId;
  status: VideoStatus;
  assignedReviewer?: Types.ObjectId;
  review?: IReview;
  languageReview?: ILanguageReview;
  teacherComment?: {   
    commenter: Types.ObjectId;
    comment: string;
    commentedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}



const SubTeacherCommentSchema = new Schema(
  {
    commenter:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment:     { type: String,                          required: true },
    commentedAt: { type: Date,                            required: true },
  },
  { _id: false }
);

const LanguageSubReviewSchema = new Schema<ILanguageReview>(
  {
    reviewer:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classStartedOnTime: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    classPerformedAsTraining: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    canMaintainDiscipline: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    studentsUnderstandLesson: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    isClassInteractive: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    teacherSignsHomeworkDiary: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    teacherChecksDiary: {
      answeredYes: { type: Boolean, required: true },
      comment:     { type: String, required: true, trim: true },
    },
    otherComments:   { type: String, trim: true, default: '' },
    reviewedAt:      { type: Date, required: true },
  },
  { _id: false },
);


const VideoSchema = new Schema<IVideoDocument>(
  {
    teacher:          { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    class:            { type: Schema.Types.ObjectId, ref: 'Class',   required: true },
    section:          { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subject:          { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    date:             { type: Date,                         required: true },
    youtubeUrl:       { type: String,                       required: true, trim: true },
    uploadedBy:       { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    status: {
      type: String,
      enum: ['unassigned','assigned','reviewed','published'] as VideoStatus[],
      default: 'unassigned',
    },
    assignedReviewer: { type: Schema.Types.ObjectId, ref: 'User',    default: null },
    review:           { type: SubReviewSchema,                     default: undefined },
    languageReview: { type: LanguageSubReviewSchema, default: undefined },
    teacherComment:   { type: SubTeacherCommentSchema,             default: undefined },
  },
  { timestamps: true }
);

export const Video = model<IVideoDocument>('Video', VideoSchema);
