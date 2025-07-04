// src/app/modules/master/subject/subject.model.ts

import { Schema, model, Document } from 'mongoose';
import { ISubject } from './subject.type';

export interface ISubjectDocument extends Omit<ISubject, '_id'>, Document {}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subject = model<ISubjectDocument>('Subject', SubjectSchema);
