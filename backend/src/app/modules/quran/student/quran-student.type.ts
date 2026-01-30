// src/app/modules/quran/student/quran-student.type.ts

export interface IQuranStudent {
  /** MongoDB document ID */
  _id?: string;

  /** Unique student ID (from Excel / external system) */
  studentId: number;

  /** English name */
  nameEn: string;

  /** Bengali name (optional) */
  nameBn?: string;

  /** Class name or number (e.g. "1-5" or "Hifz 1st Year Boys") */
  class: string;

  /** Whether student is under special supervision */
  supervision: boolean;

  /** Whether student is active */
  active: boolean;

  /** General notes */
  notes?: string;

  /** Photo URL (optional, for student card) */
  photo?: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;

  /** Computed consistency (optional; populated by cron or report) */
  consistencyStats?: {
    currentStreak: number;
    longestStreak: number;
    lastEntryDate?: Date;
    totalExpectedEntries: number;
    totalActualEntries: number;
    attendanceRate: number;
    testRegularityScore: number;
  };
}

export type TCreateQuranStudent = Omit<IQuranStudent, '_id' | 'createdAt' | 'updatedAt'>;

export type TUpdateQuranStudent = Partial<TCreateQuranStudent>;
