import { Subject } from './subject.model';
import { ISubject } from './subject.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const getAllSubjects = async (): Promise<ISubject[]> => {
  const docs = await Subject.find().sort('name');
  return docs.map(doc => ({
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
};

const createSubject = async (data: ISubject): Promise<ISubject> => {
  const existing = await Subject.findOne({ name: data.name });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Subject name already exists');
  }
  const doc = await Subject.create(data);
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const updateSubject = async (
  id: string,
  data: Partial<ISubject>
): Promise<ISubject> => {
  const doc = await Subject.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subject not found');
  }
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const deleteSubject = async (id: string): Promise<void> => {
  const deleted = await Subject.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subject not found');
  }
};

export const SubjectServices = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
