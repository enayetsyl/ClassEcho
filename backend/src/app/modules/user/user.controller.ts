import { Request, Response } from 'express';
import catchAsync from '../../utils/catch-async';
import { UserServices } from './user.service';
import sendResponse from '../../utils/send-response';

// Add new teacher (Admin/SeniorAdmin)
const addTeacher = catchAsync(async (req: Request, res: Response) => {
  const teacher = await UserServices.createTeacher(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher created successfully',
    data: teacher,
  });
});

// List all teachers
const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const teachers = await UserServices.getAllTeachers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teachers retrieved successfully',
    data: teachers,
  });
});

// Activate/Deactivate teacher
const toggleTeacherActive = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacher = await UserServices.toggleTeacherActive(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Teacher account is now ${teacher.active ? 'active' : 'inactive'}`,
    data: teacher,
  });
});

// Get own profile
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const profile = await UserServices.getProfile(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: profile,
  });
});

// Update own profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId!;
  const updated = await UserServices.updateProfile(userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: updated,
  });
});

export const UserControllers = {
  addTeacher,
  getAllTeachers,
  toggleTeacherActive,
  getProfile,
  updateProfile,
};
