// src/app/modules/master/class/class.type.ts

export interface IClass {
  /** MongoDB document ID */
  _id?: string;

  /** Display name of the class (e.g. “Class 10”) */
  name: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}
