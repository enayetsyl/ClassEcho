import { Section } from './section.model';
import { ISection } from './section.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const getAllSections = async (): Promise<ISection[]> => {
  const docs = await Section.find().sort('name');
  return docs.map(doc => ({
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
};

const createSection = async (data: ISection): Promise<ISection> => {
  const existing = await Section.findOne({ name: data.name });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Section name already exists');
  }
  const doc = await Section.create(data);
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const updateSection = async (
  id: string,
  data: Partial<ISection>
): Promise<ISection> => {
  const doc = await Section.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Section not found');
  }
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const deleteSection = async (id: string): Promise<void> => {
  const deleted = await Section.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Section not found');
  }
};

export const SectionServices = {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
};
