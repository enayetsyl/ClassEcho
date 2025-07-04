import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { SectionServices } from './section.service';

const getAllSections = catchAsync(async (req: Request, res: Response) => {
  const sections = await SectionServices.getAllSections();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sections retrieved successfully',
    data: sections,
  });
});

const createSection = catchAsync(async (req: Request, res: Response) => {
  const newSection = await SectionServices.createSection(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Section created successfully',
    data: newSection,
  });
});

const updateSection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedSection = await SectionServices.updateSection(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Section updated successfully',
    data: updatedSection,
  });
});

const deleteSection = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await SectionServices.deleteSection(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Section deleted successfully',
  });
});

export const SectionControllers = {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
};
