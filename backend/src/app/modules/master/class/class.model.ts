// src/app/modules/master/class/class.model.ts

import { Schema, model, Document } from 'mongoose';
import { IClass } from './class.type';

export interface IClassDocument extends Omit<IClass, '_id'>, Document {}

const ClassSchema = new Schema<IClassDocument>(
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

export const Class = model<IClassDocument>('Class', ClassSchema);
