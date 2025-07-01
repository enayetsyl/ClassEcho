import { Router } from 'express';
import {
 AuthControllers
} from './auth.controller';
import validateRequest from '../../middlewares/validate-request';
import {
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from './auth.validation';
import { requireAuth } from '../../middlewares/auth-middleware';

const router = Router();

// Public
router.post('/login', validateRequest(loginValidation), AuthControllers.login);
router.post('/forgot-password', validateRequest(forgotPasswordValidation), AuthControllers.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordValidation), AuthControllers.resetPassword);

// Auth required
router.post('/change-password', requireAuth, validateRequest(changePasswordValidation), AuthControllers.changePassword);

// Optional: 
router.post('/logout', requireAuth, AuthControllers.logout);

export const AuthRoutes = router;
