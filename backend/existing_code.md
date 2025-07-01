# Project Code

This file contains all the code for the project, organized by file path.

---
## `.eslintignore`

```
# dependencies
node_modules/

# build outputs
dist/
coverage/

# misc
*.log
```

---
## `.eslintrc.json`

```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "quotes": ["error", "single"]
  }
}
```

---
## `.gitignore`

```
.env
node_modules
```

---
## `.prettierignore`

```
# dependencies
node_modules

# build output
dist
coverage

# lockfiles
package-lock.json
yarn.lock

# misc
*.log
```

---
## `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---
## `package.json`

```json
{
  "name": "ClassEcho",
  "version": "1.0.0",
  "main": "./dist/server.js",
  "scripts": {
    "build": "tsc",
    "start:prod": "node ./dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only ./src/server.ts",
    "format": "prettier --write src/**/*.{ts,js,json}",
    "format:check": "prettier --check .",
    "lint": "eslint . --ext .js,.ts",
    "lint:fix": "eslint . --ext .js,.ts --fix"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "bcrypt": "^6.0.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.0.0",
    "express": "^5.1.0",
    "http-status": "^2.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.16.1",
    "ms": "^2.1.3",
    "multer": "^2.0.1",
    "nodemailer": "^7.0.4",
    "winston": "^3.17.0",
    "zod": "^3.25.67"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.9",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.3",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/mongoose": "^5.11.96",
    "@types/ms": "^2.1.0",
    "@types/multer": "^1.4.13",
    "@types/node": "^24.0.7",
    "@types/nodemailer": "^6.4.17",
    "@typescript-eslint/eslint-plugin": "^8.35.0",
    "@typescript-eslint/parser": "^8.35.0",
    "eslint": "^9.30.0",
    "nodemon": "^3.1.10",
    "prettier": "3.6.2",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.8.3"
  }
}
```

---
## `src/app.ts`

```typescript
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './app/routes';
import notFound from './app/middlewares/not-found';
import globalErrorHandler from './app/middlewares/global-error-handler';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));

// application routes
app.use('/api/v1', router); 

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from ClassEcho server');
});

app.use(globalErrorHandler);  

//Not Found
app.use(notFound);

export default app;
```

---
## `src/app/errors/app-error.ts`

```typescript
class AppError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string, stack = '') {
    super(message);
    this.statusCode = statusCode;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
```

---
## `src/app/errors/handle-cast-error.ts`

```typescript
import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../type/error';


const handleCastError = (
  err: mongoose.Error.CastError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = [
    {
      path: err.path,
      message: err.message,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid ID',
    errorSources,
  };
};

export default handleCastError;
```

---
## `src/app/errors/handle-duplicate-error.ts`

```typescript
import { TErrorSources, TGenericErrorResponse } from "../type/error";

const handleDuplicateError = (err: any): TGenericErrorResponse => {
  // Extract value within double quotes using regex
  const match = err.message.match(/"([^"]*)"/);

  // The extracted value will be in the first capturing group
  const extractedMessage = match && match[1];

  const errorSources: TErrorSources = [
    {
      path: '',
      message: `${extractedMessage} is already exists`,
    },
  ];

  const statusCode = 400;

  return {
    statusCode,
    message: 'Invalid ID',
    errorSources,
  };
};

export default handleDuplicateError;
```

---
## `src/app/errors/handle-validation-error.ts`

```typescript
import mongoose from 'mongoose';
import { TErrorSources, TGenericErrorResponse } from '../type/error';


const handleValidationError = (
  err: mongoose.Error.ValidationError,
): TGenericErrorResponse => {
  const errorSources: TErrorSources = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message,
      };
    },
  );

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleValidationError;
```

---
## `src/app/errors/handle-zod-error.ts`

```typescript
import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TGenericErrorResponse } from '../type/error';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleZodError;
```

---
## `src/app/middlewares/auth-middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import config from '../../config';
import { verifyToken } from '../utils/verify-token';
import { JwtPayload } from '../modules/auth/auth.type';
import AppError from '../errors/app-error';
import { UserRole } from '../modules/user/user.type';

/**
 * Middleware: Verifies JWT, attaches user info to req.user, calls next().
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'No authentication token provided'));
  }

  try {
    const decoded = verifyToken(token, config.jwt_secret!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired authentication token'));
  }
};

/**
 * Middleware: Checks if req.user.roles includes at least one required role.
 * Usage: requireRole(['Admin', 'Teacher'])
 */
export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return next(new AppError(httpStatus.FORBIDDEN, 'No user roles found in token'));
    }
    // roles can be string[] or single string
    const hasRole = req.user.roles.some((r) => roles.includes(r));
    if (!hasRole) {
      return next(
        new AppError(httpStatus.FORBIDDEN, 'You do not have permission to access this resource')
      );
    }
    next();
  };
};
```

---
## `src/app/middlewares/global-error-handler.ts`

```typescript
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import config from '../../config';
import { TErrorSources, TGenericErrorResponse } from '../type/error';
import handleZodError from '../errors/handle-zod-error';
import handleValidationError from '../errors/handle-validation-error';
import AppError from '../errors/app-error';
import handleDuplicateError from '../errors/handle-duplicate-error';
import handleCastError from '../errors/handle-cast-error'
import logger from '../utils/logger';


const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error('Global error handler caught an error', {
    path: req.path,
    method: req.method,
    statusCode: err?.statusCode || 500,
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    err,
  });
  //setting default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError: TGenericErrorResponse = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError: TGenericErrorResponse = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError: TGenericErrorResponse = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError: TGenericErrorResponse = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};


export default globalErrorHandler
```

---
## `src/app/middlewares/not-found.ts`

```typescript
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API Not Found !!',
    error: '',
  });
};

export default notFound;
```

---
## `src/app/middlewares/validate-request.ts`

```typescript
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catch-async';


const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });

    next();
  });
};

export default validateRequest;
```

---
## `src/app/modules/auth/auth.controller.ts`

```typescript
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
```

---
## `src/app/modules/auth/auth.routes.ts`

```typescript
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
```

---
## `src/app/modules/auth/auth.service.ts`

```typescript
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
```

---
## `src/app/modules/auth/auth.type.ts`

```typescript
// src/modules/auth/auth.type.ts

import { UserRole } from '../user/user.type';

export interface JwtPayload {
  userId: string;
  roles: UserRole[];
  mustChangePassword?: boolean;
}

export interface AuthLoginInput {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  user: {
    userId: string;
    name: string;
    roles: UserRole[];
    mustChangePassword?: boolean;
  };
}

export interface AuthForgotPasswordInput {
  email: string;
}

export interface AuthResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface AuthChangePasswordInput {
  oldPassword?: string; 
  newPassword: string;
}
```

---
## `src/app/modules/auth/auth.validation.ts`

```typescript
import { z } from 'zod';

// Login validation
export const loginValidation = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(1, 'Password required'),
  }),
});

// Forgot password validation
export const forgotPasswordValidation = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
  }),
});

// Reset password validation
export const resetPasswordValidation = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

// Change password validation (for logged-in users)
export const changePasswordValidation = z.object({
  body: z.object({
    oldPassword: z.string().optional(), 
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
```

---
## `src/app/modules/user/user.controller.ts`

```typescript
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
```

---
## `src/app/modules/user/user.model.ts`

```typescript
import { Schema, model, Document } from 'mongoose';
import { IUser, UserRole } from './user.type';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      required: true,
      enum: ['Admin', 'SeniorAdmin', 'Teacher', 'Management'] as UserRole[],
      default: ['Teacher'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
    },
    // Optional profile fields
    phone: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

export const User = model<IUserDocument>('User', UserSchema);
```

---
## `src/app/modules/user/user.routes.ts`

```typescript
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
```

---
## `src/app/modules/user/user.service.ts`

```typescript
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
```

---
## `src/app/modules/user/user.type.ts`

```typescript
// src/modules/user/user.type.ts

export type UserRole = 'Admin' | 'SeniorAdmin' | 'Teacher' | 'Management';

export interface IUser {
  _id?: string;   
  name: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  active: boolean;

  // Password management
  mustChangePassword?: boolean;
  resetPasswordToken?: string;
  resetTokenExpires?: Date;

  // Optional profile fields (add as needed)
  phone?: string;
  dateOfBirth?: Date;
  profileImageUrl?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
```

---
## `src/app/modules/user/user.validation.ts`

```typescript
import { z } from 'zod';

// For adding a new teacher
export const addTeacherValidation = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
});

// For updating own profile
export const updateProfileValidation = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    profileImageUrl: z.string().url('Must be a valid URL').optional(),
  }),
});
```

---
## `src/app/routes/index.ts`

```typescript
import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';


const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  }, 
  {
    path: '/auth',
    route: AuthRoutes,
  }, 
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));  // This will automatically loop your routes that you will add in the moduleRoutes array

export default router;
```

---
## `src/app/type/error.ts`

```typescript
export type TErrorSources = {
  path: string | number;
  message: string;
}[];

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorSources: TErrorSources;
};
```

---
## `src/app/type/jwt.ts`

```typescript
import { JwtPayload } from "../modules/auth/auth.type";


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
```

---
## `src/app/type/utils.ts`

```typescript
export type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: TMeta;
  data?: T;
};


export type  SendMailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string; 
}
```

---
## `src/app/utils/catch-async.ts`

```typescript
import { NextFunction, Request, RequestHandler, Response } from 'express';


const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
```

---
## `src/app/utils/create-token.ts`

```typescript
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';

export const createToken = (
  jwtPayload: { userId: string; roles: string[]; mustChangePassword?: boolean  },
  secret: string,
  expiresIn: number | StringValue 
) => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(jwtPayload, secret, options);
};
```

---
## `src/app/utils/logger.ts`

```typescript
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

export default logger;
```

---
## `src/app/utils/mailer.ts`

```typescript
import nodemailer from 'nodemailer';
import config from '../../config';

const transporter = nodemailer.createTransport({
  host: config.smtp_host,
  port: Number(config.smtp_port),
  auth: {
    user: config.smtp_user,
    pass: config.smtp_pass,
  },
  secure: config.smtp_secure === 'true',
});

export default transporter;
```

---
## `src/app/utils/pick.ts`

```typescript
export function pickFields<T, K extends keyof T>(source: Partial<T>, fields: K[]): Partial<T> {
  const result: Partial<T> = {};
  fields.forEach((field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  });
  return result;
}
```

---
## `src/app/utils/seed-super-admin.ts`

```typescript
// src/app/utils/seed-super-admin.ts
import bcrypt from 'bcrypt';
import { User } from '../modules/user/user.model';
import config from '../../config';

export const seedSuperAdmin = async () => {
  const email = config.super_admin_email;
  const password = config.super_admin_password!;
  const name = 'Super Admin';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Super admin already exists.');
    return;
  }

  const saltRounds = Number(config.bcrypt_salt_rounds) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await User.create({
    name,
    email,
    passwordHash,
    roles: ['Admin', 'SeniorAdmin', 'Management'],
    active: true,
    mustChangePassword: false,
  });

  console.log('Super admin created successfully!');
};
```

---
## `src/app/utils/send-mail.ts`

```typescript
import config from "../../config";
import { SendMailOptions } from "../type/utils";
import transporter from "./mailer";




/**
 * Sends an email using the preconfigured Nodemailer transporter.
 * @param options - { to, subject, text, html, from }
 */
export const sendMail = async (options: SendMailOptions) => {
  await transporter.sendMail({
    from: config.mail_from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};
```

---
## `src/app/utils/send-response.ts`

```typescript
import { Response } from 'express';
import { TResponse } from '../type/utils';


const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data?.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data,
  });
};

export default sendResponse;
```

---
## `src/app/utils/verify-token.ts`

```typescript
import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
```

---
## `src/config/index.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.port,
  database_url: process.env.database_url,
  node_env: process.env.node_env,
  jwt_secret: process.env.jwt_secret,
  jwt_expires_in: process.env.jwt_expires_in,
  initial_admin_email: process.env.initial_admin_email,
  initial_admin_password: process.env.initial_admin_password,
  google_client_id: process.env.google_client_id,
  google_client_secret: process.env.google_client_secret,
  google_redirect_uri: process.env.google_redirect_uri,
  youtube_upload_scopes: process.env.youtube_upload_scopes,
  smtp_host: process.env.smtp_host,
  smtp_port: process.env.smtp_port,
  smtp_user: process.env.smtp_user,
  smtp_pass: process.env.smtp_pass,
  smtp_secure: process.env.smtp_secure,
  mail_from: process.env.mail_from,
  cors_origin: process.env.cors_origin,
  app_base_url: process.env.app_base_url,
  upload_tmp_dir: process.env.upload_tmp_dir,
  max_video_size_mb: process.env.max_video_size_mb,
  log_level: process.env.log_level,
  bcrypt_salt_rounds: process.env.bcrypt_salt_rounds,
  super_admin_email:process.env.super_admin_email,
  super_admin_password:process.env.super_admin_password,
};
```

---
## `src/server.ts`

```typescript
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './app/utils/seed-super-admin';


let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    // Seed super admin here (await!)
    await seedSuperAdmin();

    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
```

---
## `tsconfig.json`

```json
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    // "lib": [],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    // "jsx": "preserve",                                /* Specify what JSX code is generated. */
    // "libReplacement": true,                           /* Enable lib replacement. */
    // "experimentalDecorators": true,                   /* Enable experimental support for legacy experimental decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    "rootDir": "./src",                                  /* Specify the root folder within your source files. */
    // "moduleResolution": "node10",                     /* Specify how TypeScript looks up a file from a given module specifier. */
    // "baseUrl": "./",                                  /* Specify the base directory to resolve non-relative module names. */
    // "paths": {},                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    // "allowImportingTsExtensions": true,               /* Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. */
    // "rewriteRelativeImportExtensions": true,          /* Rewrite '.ts', '.tsx', '.mts', and '.cts' file extensions in relative import paths to their JavaScript equivalent in output files. */
    // "resolvePackageJsonExports": true,                /* Use the package.json 'exports' field when resolving package imports. */
    // "resolvePackageJsonImports": true,                /* Use the package.json 'imports' field when resolving imports. */
    // "customConditions": [],                           /* Conditions to set in addition to the resolver-specific defaults when resolving imports. */
    // "noUncheckedSideEffectImports": true,             /* Check side effect imports. */
    // "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "allowArbitraryExtensions": true,                 /* Enable importing files with any extension, provided a declaration file is present. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    "outDir": "./dist",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "verbatimModuleSyntax": true,                     /* Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting. */
    // "isolatedDeclarations": true,                     /* Require sufficient annotation on exports so other tools can trivially generate declaration files. */
    // "erasableSyntaxOnly": true,                       /* Do not allow runtime constructs that are not part of ECMAScript. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                         /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "strictBuiltinIteratorReturn": true,              /* Built-in iterators are instantiated with a 'TReturn' type of 'undefined' instead of 'any'. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}
```

---
## `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

---
## `.vscode/settings.json`

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript"],
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": ".prettierrc"
}
```