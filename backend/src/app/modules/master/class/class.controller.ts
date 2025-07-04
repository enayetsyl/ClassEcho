import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { ClassServices } from './class.service';

const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  const classes = await ClassServices.getAllClasses();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Classes retrieved successfully',
    data: classes,
  });
});

const createClass = catchAsync(async (req: Request, res: Response) => {
  const newClass = await ClassServices.createClass(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Class created successfully',
    data: newClass,
  });
});

const updateClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedClass = await ClassServices.updateClass(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class updated successfully',
    data: updatedClass,
  });
});

const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ClassServices.deleteClass(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class deleted successfully',
  });
});

export const ClassControllers = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
};
