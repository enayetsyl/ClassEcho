// src/app/modules/master/subject/subject.type.ts

export interface ISubject {
  /** MongoDB document ID */
  _id?: string;

  /** Display name of the subject (e.g. “Mathematics”) */
  name: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}
