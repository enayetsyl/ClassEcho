// src/app/modules/quran/entry/quran-entry.service.ts

import { Types } from 'mongoose';
import { QuranEntry, IQuranEntryDocument } from './quran-entry.model';
import { QuranStudent } from '../student/quran-student.model';
import {
  IQuranEntry,
  IQuranTest,
  ITajweedNotes,
  TCreateQuranEntry,
  TUpdateQuranEntry,
} from './quran-entry.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';
import { TMeta, TPaginationOptions } from '../../../types/utils';
import { paginationHelper } from '../../../utils/pagination';

const defaultTest: IQuranTest = {
  given: false,
  tanbih: 0,
  fath: 0,
  note: '',
};

const defaultTajweedNotes: ITajweedNotes = {
  harf: '',
  ghunna: '',
  madd: '',
  other: '',
};

function mergeTest(partial?: Partial<IQuranTest>): IQuranTest {
  return { ...defaultTest, ...partial };
}

function mergeTajweed(partial?: Partial<ITajweedNotes>): ITajweedNotes {
  return { ...defaultTajweedNotes, ...partial };
}

export type TQuranEntryQueryFilters = {
  studentId?: string;
  class?: string;
  supervision?: boolean;
  startDate?: string;
  endDate?: string;
  ustadName?: string;
};

function mapEntry(doc: IQuranEntryDocument): IQuranEntry {
  return {
    _id: doc.id,
    student: doc.student,
    reportDate: doc.reportDate,
    newTest: doc.newTest,
    recentTest: doc.recentTest,
    olderTest: doc.olderTest,
    tajweedNotes: doc.tajweedNotes,
    generalNote: doc.generalNote,
    ustadName: doc.ustadName,
    signature: doc.signature,
    testsGiven: doc.testsGiven,
    testsMissed: doc.testsMissed,
    totalTanbih: doc.totalTanbih,
    totalFath: doc.totalFath,
    totalMistakes: doc.totalMistakes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const createEntry = async (data: {
  studentId: string;
  reportDate: string;
  newTest?: Partial<IQuranTest>;
  recentTest?: Partial<IQuranTest>;
  olderTest?: Partial<IQuranTest>;
  tajweedNotes?: Partial<ITajweedNotes>;
  generalNote?: string;
  ustadName?: string;
  signature?: string;
}): Promise<IQuranEntry> => {
  const student = await QuranStudent.findById(data.studentId);
  if (!student) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Quran student not found');
  }

  const doc = await QuranEntry.create({
    student: new Types.ObjectId(data.studentId),
    reportDate: new Date(data.reportDate),
    newTest: mergeTest(data.newTest),
    recentTest: mergeTest(data.recentTest),
    olderTest: mergeTest(data.olderTest),
    tajweedNotes: mergeTajweed(data.tajweedNotes),
    generalNote: data.generalNote ?? '',
    ustadName: data.ustadName ?? '',
    signature: data.signature ?? '',
  });

  const populated = await doc.populate('student');
  return mapEntry(populated as IQuranEntryDocument);
};

export const listEntries = async (
  filters: TQuranEntryQueryFilters,
  options: TPaginationOptions,
): Promise<{ data: IQuranEntry[]; meta: TMeta }> => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);

  const query: Record<string, unknown> = {};

  if (filters.studentId) {
    query.student = new Types.ObjectId(filters.studentId);
  }

  if (filters.class || typeof filters.supervision === 'boolean') {
    const studentQuery: Record<string, unknown> = {};
    if (filters.class) studentQuery.class = filters.class;
    if (typeof filters.supervision === 'boolean') studentQuery.supervision = filters.supervision;
    const students = await QuranStudent.find(studentQuery).select('_id').lean();
    const studentIds = students.map((s) => s._id);
    if (studentIds.length === 0) {
      return { data: [], meta: { page, limit, total: 0, totalPage: 0 } };
    }
    query.student = { $in: studentIds };
  }

  if (filters.startDate || filters.endDate) {
    query.reportDate = {} as Record<string, Date>;
    if (filters.startDate)
      (query.reportDate as Record<string, Date>).$gte = new Date(filters.startDate);
    if (filters.endDate)
      (query.reportDate as Record<string, Date>).$lte = new Date(filters.endDate);
  }

  if (filters.ustadName?.trim()) {
    (query as Record<string, unknown>).ustadName = new RegExp(filters.ustadName.trim(), 'i');
  }

  const allowedSort = ['reportDate', 'createdAt', 'totalMistakes', 'ustadName'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'reportDate';
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [docs, total] = await Promise.all([
    QuranEntry.find(query).populate('student').sort(sort).skip(skip).limit(limit),
    QuranEntry.countDocuments(query),
  ]);

  const totalPage = Math.ceil(total / limit);
  const data = (docs as IQuranEntryDocument[]).map(mapEntry);
  return { data, meta: { page, limit, total, totalPage } };
};

export const getEntryById = async (id: string): Promise<IQuranEntry> => {
  const doc = await QuranEntry.findById(id).populate('student');
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran entry not found');
  }
  return mapEntry(doc as IQuranEntryDocument);
};

export const updateEntry = async (id: string, data: TUpdateQuranEntry): Promise<IQuranEntry> => {
  const doc = await QuranEntry.findById(id);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran entry not found');
  }

  if (data.newTest !== undefined) doc.newTest = mergeTest(data.newTest) as typeof doc.newTest;
  if (data.recentTest !== undefined)
    doc.recentTest = mergeTest(data.recentTest) as typeof doc.recentTest;
  if (data.olderTest !== undefined)
    doc.olderTest = mergeTest(data.olderTest) as typeof doc.olderTest;
  if (data.tajweedNotes !== undefined)
    doc.tajweedNotes = mergeTajweed(data.tajweedNotes) as typeof doc.tajweedNotes;
  if (data.generalNote !== undefined) doc.generalNote = data.generalNote;
  if (data.ustadName !== undefined) doc.ustadName = data.ustadName;
  if (data.signature !== undefined) doc.signature = data.signature;

  await doc.save();
  const populated = await doc.populate('student');
  return mapEntry(populated as IQuranEntryDocument);
};

export const deleteEntry = async (id: string): Promise<void> => {
  const doc = await QuranEntry.findByIdAndDelete(id);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran entry not found');
  }
};

export const getEntriesByStudent = async (
  studentId: string,
  options: TPaginationOptions,
): Promise<{ data: IQuranEntry[]; meta: TMeta }> => {
  const student = await QuranStudent.findById(studentId);
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Quran student not found');
  }
  return listEntries({ studentId }, options);
};

export const bulkImportEntries = async (
  entries: Array<{
    studentId: string;
    reportDate: string;
    newTest?: Partial<IQuranTest>;
    recentTest?: Partial<IQuranTest>;
    olderTest?: Partial<IQuranTest>;
    tajweedNotes?: Partial<ITajweedNotes>;
    generalNote?: string;
    ustadName?: string;
    signature?: string;
  }>,
): Promise<{ created: number; errors: string[] }> => {
  const errors: string[] = [];
  let created = 0;
  for (let i = 0; i < entries.length; i++) {
    try {
      await createEntry(entries[i]);
      created += 1;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Row ${i + 1} (studentId ${entries[i].studentId}): ${msg}`);
    }
  }
  return { created, errors };
};

export const QuranEntryServices = {
  createEntry,
  listEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getEntriesByStudent,
  bulkImportEntries,
};
