// src/app/modules/quran/entry/quran-entry.model.ts

import { Schema, model, Document } from 'mongoose';
import { IQuranEntry, IQuranTest, ITajweedNotes } from './quran-entry.type';

const defaultTest: IQuranTest = {
  given: false,
  tanbih: 0,
  fath: 0,
  note: '',
};

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
