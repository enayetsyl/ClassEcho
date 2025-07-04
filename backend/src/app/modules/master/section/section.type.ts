// src/app/modules/master/section/section.type.ts

export interface ISection {
  /** MongoDB document ID */
  _id?: string;

  /** Display name of the section (e.g. “A”, “B”) */
  name: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}
