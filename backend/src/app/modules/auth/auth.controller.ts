import { Request, Response } from 'express';
import catchAsync from '../../utils/catch-async';
import { AuthServices } from './auth.service';
import sendResponse from '../../utils/send-response';
import config from '../../../config';

// User login
const login = catchAsync(async (req: Request, res: Response) => {
   const { token, user } = await AuthServices.login(req.body);

     res.cookie('token', token, {
    httpOnly: true,  
    secure: config.node_env === 'production',  
    sameSite: 'none',
    maxAge: Number(config.jwt_expires_in) * 1000,
    path: "/"
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login successful',
    data: user,
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
