// src/app/modules/quran/entry/quran-entry.type.ts

import { Types } from 'mongoose';

/** Single test (New / Recent / Older) structure */
export interface IQuranTest {
  /** Was the test given? */
  given: boolean;
  /** Tanbih mistake count */
  tanbih: number;
  /** Fath mistake count */
  fath: number;
  /** Note for this test */
  note?: string;
}

/** Tajweed / pronunciation notes */
export interface ITajweedNotes {
  /** Letter pronunciation issues */
  harf?: string;
  /** Nasal sound issues */
  ghunna?: string;
  /** Elongation issues */
  madd?: string;
  /** Other issues */
  other?: string;
}

export interface IQuranEntry {
  /** MongoDB document ID */
  _id?: string;

  /** Reference to QuranStudent */
  student: Types.ObjectId;

  /** Date of the weekly report */
  reportDate: Date;

  /** New Test */
  newTest: IQuranTest;

  /** Recent Test */
  recentTest: IQuranTest;

  /** Older Test */
  olderTest: IQuranTest;

  /** Tajweed / pronunciation notes */
  tajweedNotes: ITajweedNotes;

  /** General observation */
  generalNote?: string;

  /** Teacher who conducted the test */
  ustadName?: string;

  /** Signature or initials */
  signature?: string;

  /** Computed: count of tests given (0–3) */
  testsGiven: number;

  /** Computed: count of tests missed (0–3) */
  testsMissed: number;

  /** Computed: sum of all Tanbih */
  totalTanbih: number;

  /** Computed: sum of all Fath */
  totalFath: number;

  /** Computed: totalTanbih + totalFath */
  totalMistakes: number;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}

/** Payload for creating an entry (student as ID, tests optional with defaults) */
export type TCreateQuranEntry = Omit<
  IQuranEntry,
  | '_id'
  | 'testsGiven'
  | 'testsMissed'
  | 'totalTanbih'
  | 'totalFath'
  | 'totalMistakes'
  | 'createdAt'
  | 'updatedAt'
> & {
  newTest?: Partial<IQuranTest>;
  recentTest?: Partial<IQuranTest>;
  olderTest?: Partial<IQuranTest>;
  tajweedNotes?: Partial<ITajweedNotes>;
};

export type TUpdateQuranEntry = Partial<Omit<TCreateQuranEntry, 'student' | 'reportDate'>> & {
  newTest?: Partial<IQuranTest>;
  recentTest?: Partial<IQuranTest>;
  olderTest?: Partial<IQuranTest>;
  tajweedNotes?: Partial<ITajweedNotes>;
};
