// src/app/modules/quran/student/quran-student.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { QuranStudentServices } from './quran-student.service';
import { TQuranStudentQueryFilters } from './quran-student.service';

const listStudents = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const filters: TQuranStudentQueryFilters = {};
  if (query.class) filters.class = query.class;
  if (query.supervision === 'true') filters.supervision = true;
  if (query.supervision === 'false') filters.supervision = false;
  if (query.active === 'true') filters.active = true;
  if (query.active === 'false') filters.active = false;
  if (query.search) filters.search = query.search;

  const options = {
    page: query.page,
    limit: query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
  };

  const result = await QuranStudentServices.listStudents(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran students retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = await QuranStudentServices.getStudentById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran student retrieved successfully',
    data: student,
  });
});

const createStudent = catchAsync(async (req: Request, res: Response) => {
  const student = await QuranStudentServices.createStudent(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Quran student created successfully',
    data: student,
  });
});

const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = await QuranStudentServices.updateStudent(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran student updated successfully',
    data: student,
  });
});

const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await QuranStudentServices.deleteStudent(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Quran student deactivated successfully',
  });
});

const bulkImportStudents = catchAsync(async (req: Request, res: Response) => {
  const { students } = req.body as {
    students: Parameters<typeof QuranStudentServices.bulkImportStudents>[0];
  };
  const result = await QuranStudentServices.bulkImportStudents(students);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Bulk import completed: ${result.created} created, ${result.errors.length} errors`,
    data: result,
  });
});

export const QuranStudentControllers = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
};
