// src/app/modules/video/video.model.ts

import { Schema, model, Types, Document } from 'mongoose';
import { VideoStatus } from './video.type';

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
  review?: {                      // ← newly added
    reviewer: Types.ObjectId;
    classManagement: string;
    subjectKnowledge: string;
    otherComments: string;
    reviewedAt: Date;
  };
  teacherComment?: {               // ← newly added
    commenter: Types.ObjectId;
    comment: string;
    commentedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubReviewSchema = new Schema(
  {
    reviewer:         { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    classManagement:  { type: String,                                required: true },
    subjectKnowledge: { type: String,                                required: true },
    otherComments:    { type: String,                                required: true },
    reviewedAt:       { type: Date,                                  required: true },
  },
  { _id: false }
);

const SubTeacherCommentSchema = new Schema(
  {
    commenter:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment:     { type: String,                          required: true },
    commentedAt: { type: Date,                            required: true },
  },
  { _id: false }
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
    teacherComment:   { type: SubTeacherCommentSchema,             default: undefined },
  },
  { timestamps: true }
);

export const Video = model<IVideoDocument>('Video', VideoSchema);
