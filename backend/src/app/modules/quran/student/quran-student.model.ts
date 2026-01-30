// src/app/modules/quran/student/quran-student.model.ts

import { Schema, model, Document } from 'mongoose';
import { IQuranStudent } from './quran-student.type';

export interface IQuranStudentDocument extends Omit<IQuranStudent, '_id'>, Document {}

const QuranStudentSchema = new Schema<IQuranStudentDocument>(
  {
    studentId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    nameBn: {
      type: String,
      default: '',
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    supervision: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    photo: {
      type: String,
      default: '',
      trim: true,
    },
    // Computed consistency (optional; can be updated via cron or on entry save)
    consistencyStats: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastEntryDate: { type: Date },
      totalExpectedEntries: { type: Number, default: 0 },
      totalActualEntries: { type: Number, default: 0 },
      attendanceRate: { type: Number, default: 0 },
      testRegularityScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Text search index for name search
QuranStudentSchema.index({ nameEn: 'text', nameBn: 'text' });

export const QuranStudent = model<IQuranStudentDocument>('QuranStudent', QuranStudentSchema);
