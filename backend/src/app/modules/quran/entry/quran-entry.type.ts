// src/app/modules/quran/entry/quran-entry.type.ts

import { Types } from 'mongoose';

/** Structured content for a test (Surah range, Juz, or custom) */
export interface IQuranContent {
  /** Content type */
  type: 'surah' | 'juz' | 'custom';

  /** For Surah-based content */
  surahNumber?: number;
  surahName?: string;
  ayahStart?: number;
  ayahEnd?: number;

  /** For Juz-based content */
  juzNumber?: number;

  /** For custom/partial content */
  customDescription?: string;
}

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
  /** Structured content (Surah/Juz/custom) */
  content?: IQuranContent;
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

  /** Content completion tracking (optional) */
  contentCompletion?: {
    surahCompleted: boolean;
    juzCompleted: boolean;
    ayahsCovered: number;
  };

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
