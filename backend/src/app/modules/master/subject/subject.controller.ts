import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { SubjectServices } from './subject.service';

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const subjects = await SubjectServices.getAllSubjects();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subjects retrieved successfully',
    data: subjects,
  });
});

const createSubject = catchAsync(async (req: Request, res: Response) => {
  const newSubject = await SubjectServices.createSubject(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subject created successfully',
    data: newSubject,
  });
});

const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedSubject = await SubjectServices.updateSubject(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject updated successfully',
    data: updatedSubject,
  });
});

const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await SubjectServices.deleteSubject(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject deleted successfully',
  });
});

export const SubjectControllers = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
