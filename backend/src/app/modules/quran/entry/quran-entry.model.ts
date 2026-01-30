// src/app/modules/quran/entry/quran-entry.model.ts

import { Schema, model, Document } from 'mongoose';
import { IQuranEntry, IQuranTest, IQuranContent, ITajweedNotes } from './quran-entry.type';

const defaultContent: IQuranContent = {
  type: 'custom',
  customDescription: '',
};

const defaultTest: IQuranTest = {
  given: false,
  tanbih: 0,
  fath: 0,
  note: '',
  content: defaultContent,
};

const QuranContentSchema = new Schema<IQuranContent>(
  {
    type: {
      type: String,
      enum: ['surah', 'juz', 'custom'],
      default: 'custom',
    },
    surahNumber: { type: Number, min: 1, max: 114 },
    surahName: { type: String },
    ayahStart: { type: Number, min: 1 },
    ayahEnd: { type: Number, min: 1 },
    juzNumber: { type: Number, min: 1, max: 30 },
    customDescription: { type: String, maxlength: 200 },
  },
  { _id: false },
);

const defaultTajweedNotes: ITajweedNotes = {
  harf: '',
  ghunna: '',
  madd: '',
  other: '',
};

const QuranTestSchema = new Schema<IQuranTest>(
  {
    given: { type: Boolean, required: true, default: false },
    tanbih: { type: Number, required: true, default: 0, min: 0 },
    fath: { type: Number, required: true, default: 0, min: 0 },
    note: { type: String, default: '', trim: true },
    content: {
      type: QuranContentSchema,
      default: () => ({ ...defaultContent }),
    },
  },
  { _id: false },
);

const TajweedNotesSchema = new Schema<ITajweedNotes>(
  {
    harf: { type: String, default: '', trim: true },
    ghunna: { type: String, default: '', trim: true },
    madd: { type: String, default: '', trim: true },
    other: { type: String, default: '', trim: true },
  },
  { _id: false },
);

export interface IQuranEntryDocument extends Omit<IQuranEntry, '_id'>, Document {}

const QuranEntrySchema = new Schema<IQuranEntryDocument>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'QuranStudent',
      required: true,
      index: true,
    },
    reportDate: {
      type: Date,
      required: true,
      index: true,
    },
    newTest: {
      type: QuranTestSchema,
      required: true,
      default: () => ({ ...defaultTest }),
    },
    recentTest: {
      type: QuranTestSchema,
      required: true,
      default: () => ({ ...defaultTest }),
    },
    olderTest: {
      type: QuranTestSchema,
      required: true,
      default: () => ({ ...defaultTest }),
    },
    tajweedNotes: {
      type: TajweedNotesSchema,
      required: true,
      default: () => ({ ...defaultTajweedNotes }),
    },
    generalNote: {
      type: String,
      default: '',
      trim: true,
    },
    ustadName: {
      type: String,
      default: '',
      trim: true,
    },
    signature: {
      type: String,
      default: '',
      trim: true,
    },
    testsGiven: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 3,
    },
    testsMissed: {
      type: Number,
      required: true,
      default: 3,
      min: 0,
      max: 3,
    },
    totalTanbih: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalFath: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalMistakes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for listing entries by student and date
QuranEntrySchema.index({ student: 1, reportDate: -1 });

// Content-based indexes for analytics
QuranEntrySchema.index({ 'newTest.content.surahNumber': 1 });
QuranEntrySchema.index({ 'recentTest.content.surahNumber': 1 });
QuranEntrySchema.index({ 'olderTest.content.surahNumber': 1 });
QuranEntrySchema.index({ 'newTest.content.juzNumber': 1 });
QuranEntrySchema.index({ 'recentTest.content.juzNumber': 1 });
QuranEntrySchema.index({ 'olderTest.content.juzNumber': 1 });
QuranEntrySchema.index({ reportDate: -1, student: 1 });
QuranEntrySchema.index({ 'newTest.content.surahNumber': 1, reportDate: -1 });

/** Compute and set testsGiven, testsMissed, totalTanbih, totalFath, totalMistakes from test data */
function computeEntryFields(doc: IQuranEntryDocument): void {
  const tests = [doc.newTest, doc.recentTest, doc.olderTest];
  let testsGiven = 0;
  let totalTanbih = 0;
  let totalFath = 0;

  for (const t of tests) {
    if (t?.given) {
      testsGiven += 1;
      totalTanbih += t.tanbih ?? 0;
      totalFath += t.fath ?? 0;
    }
  }

  doc.testsGiven = testsGiven;
  doc.testsMissed = 3 - testsGiven;
  doc.totalTanbih = totalTanbih;
  doc.totalFath = totalFath;
  doc.totalMistakes = totalTanbih + totalFath;
}

QuranEntrySchema.pre('save', function (next) {
  computeEntryFields(this);
  next();
});

export const QuranEntry = model<IQuranEntryDocument>('QuranEntry', QuranEntrySchema);
