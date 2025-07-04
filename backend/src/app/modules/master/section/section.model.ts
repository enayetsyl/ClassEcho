// src/app/modules/master/section/section.model.ts

import { Schema, model, Document } from 'mongoose';
import { ISection } from './section.type';

export interface ISectionDocument extends Omit<ISection, '_id'>, Document {}

const SectionSchema = new Schema<ISectionDocument>(
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

export const Section = model<ISectionDocument>('Section', SectionSchema);
