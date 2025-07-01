import { User } from './user.model';
import { IUser } from './user.type';
import bcrypt from 'bcrypt';
import AppError from '../../errors/app-error';
import httpStatus from 'http-status';
import { pickFields } from '../../utils/pick';
import config from '../../../config';
import { sendMail } from '../../utils/send-mail';

// Create teacher (Admin/SeniorAdmin)
const createTeacher = async (data: Partial<IUser>) => {
  // Check if user exists
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email already in use');
  }

  // Generate random temp password and hash it
  const tempPassword = Math.random().toString(36).slice(-8);
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(tempPassword, saltRounds);

  // Create user with mustChangePassword=true
  const user = await User.create({
    ...data,
    passwordHash,
    roles: ['Teacher'],
    mustChangePassword: true,
    active: true,
  });

  await sendMail({
  to: user.email,
  subject: 'Welcome to SCD Class Review App.',
  html: `
    <p>Hello ${user.name},</p>
    <p>Your teacher account has been created. Please use this temporary password to log in for the first time:</p>
    <p><b>${tempPassword}</b></p>
    <p>Login here: <a href="${config.app_base_url}/login">${config.app_base_url}/login</a></p>
    <p>Be sure to change your password after logging in.</p>
    <p>- SCD Admin</p>
  `,
});

  // Never return passwordHash
  const { passwordHash: _, ...plainUser } = user.toObject();
  return { ...plainUser };
};

// List all teachers (active/inactive)
const getAllTeachers = async () => {
  return User.find({ roles: 'Teacher' }).select('-passwordHash');
};

// Toggle teacher account active/inactive
const toggleTeacherActive = async (id: string) => {
  const user = await User.findById(id);
  if (!user || !user.roles.includes('Teacher')) {
    throw new AppError(httpStatus.NOT_FOUND, 'Teacher not found');
  }
  user.active = !user.active;
  await user.save();
  const { passwordHash: _, ...plainUser } = user.toObject();
  return plainUser;
};

// Get profile for any logged-in user
const getProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  return user;
};

// Update own profile (allowed fields only)
const updateProfile = async (userId: string, data: Partial<IUser>) => {
  const allowedFields: (keyof IUser)[] = ['name', 'phone', 'dateOfBirth', 'profileImageUrl'];
const update = pickFields<IUser, keyof IUser>(data, allowedFields);

const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-passwordHash');
if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');
return user;
};


export const UserServices = {
  createTeacher,
  getAllTeachers,
  toggleTeacherActive,
  getProfile,
  updateProfile,
};
