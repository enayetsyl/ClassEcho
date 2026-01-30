// src/app/modules/quran/entry/quran-entry.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { QuranEntryServices } from './quran-entry.service';
import { TQuranEntryQueryFilters } from './quran-entry.service';

const listEntries = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const filters: TQuranEntryQueryFilters = {};
  if (query.studentId) filters.studentId = query.studentId;
  if (query.class) filters.class = query.class;
  if (query.supervision === 'true') filters.supervision = true;
  if (query.supervision === 'false') filters.supervision = false;
  if (query.startDate) filters.startDate = query.startDate;
  if (query.endDate) filters.endDate = query.endDate;
  if (query.ustadName) filters.ustadName = query.ustadName;

  const options = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await QuranEntryServices.listEntries(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran entries retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getEntryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await QuranEntryServices.getEntryById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran entry retrieved successfully',
    data: entry,
  });
});

const createEntry = catchAsync(async (req: Request, res: Response) => {
  const entry = await QuranEntryServices.createEntry(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Quran entry created successfully',
    data: entry,
  });
});

const updateEntry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await QuranEntryServices.updateEntry(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran entry updated successfully',
    data: entry,
  });
});

const deleteEntry = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await QuranEntryServices.deleteEntry(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran entry deleted successfully',
  });
});

const getEntriesByStudent = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const query = req.query as Record<string, string | undefined>;
  const options = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
  };
  const result = await QuranEntryServices.getEntriesByStudent(studentId, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran entries for student retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const bulkImportEntries = catchAsync(async (req: Request, res: Response) => {
  const { entries } = req.body as {
    entries: Parameters<typeof QuranEntryServices.bulkImportEntries>[0];
  };
  const result = await QuranEntryServices.bulkImportEntries(entries);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Bulk import completed: ${result.created} created, ${result.errors.length} errors`,
    data: result,
  });
});

export const QuranEntryControllers = {
  listEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  getEntriesByStudent,
  bulkImportEntries,
};
