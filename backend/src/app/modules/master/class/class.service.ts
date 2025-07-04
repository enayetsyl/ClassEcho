import { Class } from './class.model';
import { IClass } from './class.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const getAllClasses = async (): Promise<IClass[]> => {
  const docs = await Class.find().sort('name');
  return docs.map(doc => ({
    _id: doc.id,               // string
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
};

const createClass = async (data: IClass): Promise<IClass> => {
  const existing = await Class.findOne({ name: data.name });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Class name already exists');
  }
  const doc = await Class.create(data);
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const updateClass = async (
  id: string,
  data: Partial<IClass>
): Promise<IClass> => {
  const doc = await Class.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const deleteClass = async (id: string): Promise<void> => {
  const deleted = await Class.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
};

export const ClassServices = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
};
