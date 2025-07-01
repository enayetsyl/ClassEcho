import { Request, Response } from 'express';
import catchAsync from '../../utils/catch-async';
import { AuthServices } from './auth.service';
import sendResponse from '../../utils/send-response';

// User login
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// Forgot password (send reset email)
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.forgotPassword(req.body.email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset email sent (if account exists)',
  });
});

// Reset password using token
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.resetPassword(req.body.token, req.body.newPassword);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successful',
  });
});

// Change password (logged-in users)
const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.changePassword(req.user?.userId!, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
  });
});

// (Optional) Logout - for stateless JWT, this is often just a frontend action
const logout = catchAsync(async (req: Request, res: Response) => {
  // If you want to blacklist tokens, implement here. For now, just respond.
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Logout successful',
  });
});

export const AuthControllers = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
};
