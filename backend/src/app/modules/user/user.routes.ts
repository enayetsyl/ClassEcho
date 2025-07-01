import express from 'express';
import { UserControllers } from './user.controller';
import validateRequest from '../../middlewares/validate-request';
import { addTeacherValidation, updateProfileValidation } from './user.validation';
import { requireAuth, requireRole } from '../../middlewares/auth-middleware';

const router = express.Router();

// Only Admin/SeniorAdmin can add or list teachers, or toggle status
router.post(
  '/admin/teachers',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(addTeacherValidation),
  UserControllers.addTeacher
);
router.get(
  '/admin/teachers',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  UserControllers.getAllTeachers
);
router.patch(
  '/admin/teachers/:id/active',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  UserControllers.toggleTeacherActive
);

// Teachers can get/update their own profile
router.get('/me/profile', requireAuth, UserControllers.getProfile);
router.put(
  '/me/profile',
  requireAuth,
  validateRequest(updateProfileValidation),
  UserControllers.updateProfile
);

export const UserRoutes = router;
