import { User } from '../user/user.model';
import bcrypt from 'bcrypt';
import { createToken } from '../../utils/create-token';
import config from '../../../config';
import AppError from '../../errors/app-error';
import httpStatus from 'http-status';
import { AuthLoginInput, AuthChangePasswordInput } from './auth.type';
import { sendMail } from '../../utils/send-mail';

const login = async (payload: AuthLoginInput) => {
  const user = await User.findOne({ email: payload.email });
  if (!user || !user.active) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials or account inactive');
  }
  const isMatch = await bcrypt.compare(payload.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
  }

  const userId = user._id as string;

  const jwtPayload = {
    userId: userId,
    roles: user.roles,
    mustChangePassword: !!user.mustChangePassword,
  };

  const token = createToken(jwtPayload, config.jwt_secret!, Number(config.jwt_expires_in)!);

  return {
    token,
    user: {
      userId,
      name: user.name,
      roles: user.roles,
      mustChangePassword: !!user.mustChangePassword,
    },
  };
};

// Forgot Password: generate token, save to user, send email
const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) return; // Don't leak info

  // Generate token and expiry (1 hour)
  const token = Math.random().toString(36).substring(2, 15);
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  user.resetPasswordToken = token;
  user.resetTokenExpires = expires;
  await user.save();

  const resetLink = `${config.app_base_url}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    html: `
    <p>Hello ${user.name},</p>
    <p>You requested a password reset. Click the link below to set a new password. If you did not request this, you can ignore this email.</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>- SCD Admin</p>
  `,
  });
};

// Reset password (by token)
const resetPassword = async (token: string, newPassword: string) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or expired token');

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  user.passwordHash = await bcrypt.hash(newPassword, saltRounds);
  user.mustChangePassword = false;
  user.resetPasswordToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
};

// Change password (for logged-in users)
const changePassword = async (userId: string, payload: AuthChangePasswordInput) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  // If mustChangePassword, oldPassword may not be required
  if (!user.mustChangePassword) {
    if (!payload.oldPassword) throw new AppError(httpStatus.BAD_REQUEST, 'Old password required');
    const isMatch = await bcrypt.compare(payload.oldPassword, user.passwordHash);
    if (!isMatch) throw new AppError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  user.passwordHash = await bcrypt.hash(payload.newPassword, saltRounds);
  user.mustChangePassword = false;
  await user.save();
};

export const AuthServices = {
  login,
  forgotPassword,
  resetPassword,
  changePassword,
};
