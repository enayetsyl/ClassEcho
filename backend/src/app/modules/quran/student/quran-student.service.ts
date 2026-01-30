// src/app/modules/quran/student/quran-student.service.ts

import { QuranStudent, IQuranStudentDocument } from './quran-student.model';
import { IQuranStudent, TCreateQuranStudent } from './quran-student.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';
import { TMeta, TPaginationOptions } from '../../../types/utils';
import { paginationHelper } from '../../../utils/pagination';

export type TQuranStudentQueryFilters = {
  class?: string;
  supervision?: boolean;
  active?: boolean;
  search?: string;
};

const mapStudent = (doc: IQuranStudentDocument | Record<string, unknown>): IQuranStudent => {
  const d = doc as IQuranStudentDocument & Record<string, unknown>;
  const id = d.id ?? (d._id != null ? String(d._id) : undefined);
  return {
    _id: id != null ? String(id) : '',
    studentId: Number(d.studentId) || 0,
    nameEn: String(d.nameEn ?? ''),
    nameBn: d.nameBn != null ? String(d.nameBn) : undefined,
    class: String(d.class ?? ''),
    supervision: Boolean(d.supervision),
    active: Boolean(d.active),
    notes: d.notes,
    photo: d.photo,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
};

export const createStudent = async (data: TCreateQuranStudent): Promise<IQuranStudent> => {
  const existing = await QuranStudent.findOne({ studentId: data.studentId });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, `Student with ID ${data.studentId} already exists`);
  }
  const doc = await QuranStudent.create({
    studentId: data.studentId,
    nameEn: data.nameEn,
    nameBn: data.nameBn ?? '',
    class: data.class,
    supervision: data.supervision ?? false,
    active: data.active ?? true,
    notes: data.notes ?? '',
    photo: data.photo ?? '',
  });
  return mapStudent(doc);
};

export const listStudents = async (
  filters: TQuranStudentQueryFilters,
  options: TPaginationOptions,
): Promise<{ data: IQuranStudent[]; meta: TMeta }> => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const query: Record<string, unknown> = {};
  if (filters.class) query.class = filters.class;
  if (typeof filters.supervision === 'boolean') query.supervision = filters.supervision;
  if (typeof filters.active === 'boolean') query.active = filters.active;
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    query.$or = [{ nameEn: new RegExp(search, 'i') }, { nameBn: new RegExp(search, 'i') }];
  }

  const allowedSort = ['studentId', 'nameEn', 'class', 'createdAt'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'studentId';
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [docs, total] = await Promise.all([
    QuranStudent.find(query).sort(sort).skip(skip).limit(limit).lean(),
    QuranStudent.countDocuments(query),
  ]);

  const totalPage = Math.ceil(total / limit);
  const data = (docs as IQuranStudentDocument[]).map(mapStudent);
  return { data, meta: { page, limit, total, totalPage } };
};

export const getStudentById = async (id: string): Promise<IQuranStudent> => {
  const doc = await QuranStudent.findById(id);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  }
  return mapStudent(doc);
};

export const updateStudent = async (
  id: string,
  data: Partial<TCreateQuranStudent>,
): Promise<IQuranStudent> => {
  if (data.studentId !== undefined) {
    const existing = await QuranStudent.findOne({ studentId: data.studentId, _id: { $ne: id } });
    if (existing) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Student with ID ${data.studentId} already exists`,
      );
    }
  }
  const doc = await QuranStudent.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  }
  return mapStudent(doc);
};

/** Soft delete: set active = false */
export const deleteStudent = async (id: string): Promise<void> => {
  const doc = await QuranStudent.findByIdAndUpdate(id, { active: false }, { new: true });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  }
};

export const bulkImportStudents = async (
  students: TCreateQuranStudent[],
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;
  for (const row of students) {
    try {
      await createStudent(row);
      created += 1;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Student ID ${row.studentId} (${row.nameEn}): ${msg}`);
    }
  }
  return { created, errors };
};

export const QuranStudentServices = {
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
};
