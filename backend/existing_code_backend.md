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
import { TErrorSources, TGenericErrorResponse } from '../types/error';


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
import { TErrorSources, TGenericErrorResponse } from "../types/error";

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
import { TErrorSources, TGenericErrorResponse } from '../types/error';


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
import { TErrorSources, TGenericErrorResponse } from '../types/error';

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
    const hasRole = req.user.roles.some((r:UserRole) => roles.includes(r));
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
import { TErrorSources, TGenericErrorResponse } from '../types/error';
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
       query: req.query,
      params: req.params,
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
import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends DefaultJwtPayload {
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
import { ClassRoutes } from '../modules/master/class/class.routes';
import { SectionRoutes } from '../modules/master/section/section.routes';
import { SubjectRoutes } from '../modules/master/subject/subject.routes';
import { VideoRoutes } from '../modules/master/video/video.routes';

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
  {
    path: '/admin/classes',
    route: ClassRoutes,
  }, 
  {
    path: '/admin/sections',
    route: SectionRoutes,
  }, 
  {
    path: '/admin/subjects',
    route: SubjectRoutes,
  }, 
{
    path: '/admin/videos',
    route: VideoRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));  // This will automatically loop your routes that you will add in the moduleRoutes array

export default router;
```

---
## `src/app/types/error.ts`

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
## `src/app/types/jwt.ts`

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
## `src/app/types/utils.ts`

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
## `src/app/types/index.d.ts`

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
import { SendMailOptions } from "../types/utils";
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
import { TResponse } from '../types/utils';


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

---
## `src/app/modules/master/class/class.type.ts`

```typescript
// src/app/modules/master/class/class.type.ts

export interface IClass {
  /** MongoDB document ID */
  _id?: string;

  /** Display name of the class (e.g. “Class 10”) */
  name: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}
```

---
## `src/app/modules/master/class/class.routes.ts`

```typescript
import express from 'express';
import { ClassControllers } from './class.controller';

import {
  createClassValidation,
  updateClassValidation,
} from './class.validation';

import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';

const router = express.Router();

// List all classes
router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  ClassControllers.getAllClasses
);

// Create a new class
router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createClassValidation),
  ClassControllers.createClass
);

// Rename (update) a class
router.put(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateClassValidation),
  ClassControllers.updateClass
);

// (Optionally) Delete a class
router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  ClassControllers.deleteClass
);

export const ClassRoutes = router;
```
---
## `src/app/modules/master/class/class.controller.ts`

```typescript
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
```

---
## `src/app/modules/master/class/class.model.ts`

```typescript
// src/app/modules/master/class/class.model.ts

import { Schema, model, Document } from 'mongoose';
import { IClass } from './class.type';

export interface IClassDocument extends Omit<IClass, '_id'>, Document {}

const ClassSchema = new Schema<IClassDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Class = model<IClassDocument>('Class', ClassSchema);
```

---
## `src/app/modules/master/class/class.service.ts`

```typescript
import { Class } from './class.model';
import { IClass } from './class.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const getAllClasses = async (): Promise<IClass[]> => {
  const docs = await Class.find().sort('name');
  return docs.map(doc => ({
    _id: doc.id,               // string
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
};

const createClass = async (data: IClass): Promise<IClass> => {
  const existing = await Class.findOne({ name: data.name });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Class name already exists');
  }
  const doc = await Class.create(data);
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const updateClass = async (
  id: string,
  data: Partial<IClass>
): Promise<IClass> => {
  const doc = await Class.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const deleteClass = async (id: string): Promise<void> => {
  const deleted = await Class.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Class not found');
  }
};

export const ClassServices = {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
};
```

---
## `src/app/modules/master/class/class.validation.ts`

```typescript
import { z } from 'zod';

export const createClassValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Class name is required',
      invalid_type_error: 'Class name must be a string',
    }).min(1, 'Class name cannot be empty'),
  }),
});

export const updateClassValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Class name is required',
      invalid_type_error: 'Class name must be a string',
    }).min(1, 'Class name cannot be empty'),
  }),
});
```
--- 
## `src/app/modules/master/section/section.controller.ts`

```typescript
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
```

---
## `src/app/modules/master/section/section.model.ts`

```typescript
// src/app/modules/master/section/section.model.ts

import { Schema, model, Document } from 'mongoose';
import { ISection } from './section.type';

export interface ISectionDocument extends Omit<ISection, '_id'>, Document {}

const SectionSchema = new Schema<ISectionDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Section = model<ISectionDocument>('Section', SectionSchema);
```

---
## `src/app/modules/master/section/section.routes.ts`

```typescript
import express from 'express';
import { SectionControllers } from './section.controller';

import {
  createSectionValidation,
  updateSectionValidation,
} from './section.validation';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import validateRequest from '../../../middlewares/validate-request';

const router = express.Router();

// List all sections
router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  SectionControllers.getAllSections
);

// Create a new section
router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createSectionValidation),
  SectionControllers.createSection
);

// Rename (update) a section
router.put(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateSectionValidation),
  SectionControllers.updateSection
);

// (Optionally) Delete a section
router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  SectionControllers.deleteSection
);

export const SectionRoutes = router;
```

---
## `src/app/modules/master/section/section.service.ts`

```typescript
import { Section } from './section.model';
import { ISection } from './section.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const getAllSections = async (): Promise<ISection[]> => {
  const docs = await Section.find().sort('name');
  return docs.map(doc => ({
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
};

const createSection = async (data: ISection): Promise<ISection> => {
  const existing = await Section.findOne({ name: data.name });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Section name already exists');
  }
  const doc = await Section.create(data);
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const updateSection = async (
  id: string,
  data: Partial<ISection>
): Promise<ISection> => {
  const doc = await Section.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Section not found');
  }
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const deleteSection = async (id: string): Promise<void> => {
  const deleted = await Section.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Section not found');
  }
};

export const SectionServices = {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
};
```

---
## `src/app/modules/master/section/section.type.ts`

```typescript
// src/app/modules/master/section/section.type.ts

export interface ISection {
  /** MongoDB document ID */
  _id?: string;

  /** Display name of the section (e.g. “A”, “B”) */
  name: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}
```

---
## `src/app/modules/master/section/section.validation.ts`

```typescript
import { z } from 'zod';

export const createSectionValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Section name is required',
      invalid_type_error: 'Section name must be a string',
    }).min(1, 'Section name cannot be empty'),
  }),
});

export const updateSectionValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Section name is required',
      invalid_type_error: 'Section name must be a string',
    }).min(1, 'Section name cannot be empty'),
  }),
});
```

---
## `src/app/modules/master/subject/subject.controller.ts`

```typescript
import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { SubjectServices } from './subject.service';

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const subjects = await SubjectServices.getAllSubjects();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subjects retrieved successfully',
    data: subjects,
  });
});

const createSubject = catchAsync(async (req: Request, res: Response) => {
  const newSubject = await SubjectServices.createSubject(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subject created successfully',
    data: newSubject,
  });
});

const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedSubject = await SubjectServices.updateSubject(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject updated successfully',
    data: updatedSubject,
  });
});

const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await SubjectServices.deleteSubject(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject deleted successfully',
  });
});

export const SubjectControllers = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
```

---
## `src/app/modules/master/subject/subject.model.ts`

```typescript
// src/app/modules/master/subject/subject.model.ts

import { Schema, model, Document } from 'mongoose';
import { ISubject } from './subject.type';

export interface ISubjectDocument extends Omit<ISubject, '_id'>, Document {}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Subject = model<ISubjectDocument>('Subject', SubjectSchema);
```

---
## `src/app/modules/master/subject/subject.routes.ts`

```typescript
import express from 'express';
import { SubjectControllers } from './subject.controller';
import {
  createSubjectValidation,
  updateSubjectValidation,
} from './subject.validation';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import validateRequest from '../../../middlewares/validate-request';


const router = express.Router();

// List all subjects
router.get(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin', 'Management']),
  SubjectControllers.getAllSubjects
);

// Create a new subject
router.post(
  '/',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(createSubjectValidation),
  SubjectControllers.createSubject
);

// Rename (update) a subject
router.put(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  validateRequest(updateSubjectValidation),
  SubjectControllers.updateSubject
);

// (Optionally) Delete a subject
router.delete(
  '/:id',
  requireAuth,
  requireRole(['Admin', 'SeniorAdmin']),
  SubjectControllers.deleteSubject
);

export const SubjectRoutes = router;
```

---
## `src/app/modules/master/subject/subject.service.ts`

```typescript
import { Subject } from './subject.model';
import { ISubject } from './subject.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const getAllSubjects = async (): Promise<ISubject[]> => {
  const docs = await Subject.find().sort('name');
  return docs.map(doc => ({
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));
};

const createSubject = async (data: ISubject): Promise<ISubject> => {
  const existing = await Subject.findOne({ name: data.name });
  if (existing) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Subject name already exists');
  }
  const doc = await Subject.create(data);
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const updateSubject = async (
  id: string,
  data: Partial<ISubject>
): Promise<ISubject> => {
  const doc = await Subject.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subject not found');
  }
  return {
    _id: doc.id,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

const deleteSubject = async (id: string): Promise<void> => {
  const deleted = await Subject.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subject not found');
  }
};

export const SubjectServices = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
```

---
## `src/app/modules/master/subject/subject.type.ts`

```typescript
// src/app/modules/master/subject/subject.type.ts

export interface ISubject {
  /** MongoDB document ID */
  _id?: string;

  /** Display name of the subject (e.g. “Mathematics”) */
  name: string;

  /** Timestamps added by Mongoose */
  createdAt?: Date;
  updatedAt?: Date;
}
```

---
## `src/app/modules/master/subject/subject.validation.ts`

```typescript
import { z } from 'zod';

export const createSubjectValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Subject name is required',
      invalid_type_error: 'Subject name must be a string',
    }).min(1, 'Subject name cannot be empty'),
  }),
});

export const updateSubjectValidation = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Subject name is required',
      invalid_type_error: 'Subject name must be a string',
    }).min(1, 'Subject name cannot be empty'),
  }),
});
```
---
`src/app/modules/master/video/video.controller.ts`
```typescript
// src/app/modules/video/video.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { VideoServices } from './video.service';

const createVideo = catchAsync(async (req: Request, res: Response) => {
  const video = await VideoServices.createVideo(req.body, req?.user?.userId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Video created successfully',
    data: video,
  });
});

const listVideos = catchAsync(async (req: Request, res: Response) => {
 
  const videos = await VideoServices.listVideos(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Videos retrieved successfully',
    data: videos,
  });
});

const getVideoById = catchAsync(async (req: Request, res: Response) => {
  const video = await VideoServices.getVideoById(req.params.id);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video retrieved successfully',
    data: video,
  });
});

const assignReviewer = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.assignReviewer(req.params.id, req.body.reviewerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviewer assigned successfully',
    data: updated,
  });
});

const submitReview = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.submitReview(
    req.params.id,
    req.user.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review submitted successfully',
    data: updated,
  });
});

const publishReview = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.publishReview(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video published successfully',
    data: updated,
  });
});

const listTeacherFeedback = catchAsync(async (req: Request, res: Response) => {
 
  const feedback = await VideoServices.listTeacherFeedback(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher feedback retrieved successfully',
    data: feedback,
  });
});

const addTeacherComment = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.addTeacherComment(
    req.params.id,
    req.user.userId,
    req.body.comment
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment added successfully',
    data: updated,
  });
});

const listAssignedVideos = catchAsync(async (req: Request, res: Response) => {
  const reviewerId = req.user!.userId;  
  const videos = await VideoServices.listVideos({
    assignedReviewer: reviewerId,
    status: 'assigned',
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Assigned videos retrieved successfully',
    data: videos,
  });
});

const listMyAssigned = catchAsync(async (req: Request, res: Response) => {
  const videos = await VideoServices.listMyAssigned(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Assigned videos retrieved successfully',
    data: videos,
  });
});

export const VideoControllers = {
  createVideo,
  listVideos,
  getVideoById,
  assignReviewer,
  submitReview,
  publishReview,
  listTeacherFeedback,
  addTeacherComment,
  listAssignedVideos,
  listMyAssigned

};

```
---
`src/app/modules/master/video/video.model.ts`
```typescript
// src/app/modules/video/video.model.ts

import { Schema, model, Types, Document } from 'mongoose';
import { VideoStatus } from './video.type';

export interface IVideoDocument extends Document {
  teacher: Types.ObjectId;
  class: Types.ObjectId;
  section: Types.ObjectId;
  subject: Types.ObjectId;
  date: Date;
  youtubeUrl: string;
  uploadedBy: Types.ObjectId;
  status: VideoStatus;
  assignedReviewer?: Types.ObjectId;
  review?: {                      // ← newly added
    reviewer: Types.ObjectId;
    classManagement: string;
    subjectKnowledge: string;
    otherComments: string;
    reviewedAt: Date;
  };
  teacherComment?: {               // ← newly added
    commenter: Types.ObjectId;
    comment: string;
    commentedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubReviewSchema = new Schema(
  {
    reviewer:         { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    classManagement:  { type: String,                                required: true },
    subjectKnowledge: { type: String,                                required: true },
    otherComments:    { type: String,                                required: true },
    reviewedAt:       { type: Date,                                  required: true },
  },
  { _id: false }
);

const SubTeacherCommentSchema = new Schema(
  {
    commenter:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment:     { type: String,                          required: true },
    commentedAt: { type: Date,                            required: true },
  },
  { _id: false }
);

const VideoSchema = new Schema<IVideoDocument>(
  {
    teacher:          { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    class:            { type: Schema.Types.ObjectId, ref: 'Class',   required: true },
    section:          { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subject:          { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    date:             { type: Date,                         required: true },
    youtubeUrl:       { type: String,                       required: true, trim: true },
    uploadedBy:       { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    status: {
      type: String,
      enum: ['unassigned','assigned','reviewed','published'] as VideoStatus[],
      default: 'unassigned',
    },
    assignedReviewer: { type: Schema.Types.ObjectId, ref: 'User',    default: null },
    review:           { type: SubReviewSchema,                     default: undefined },
    teacherComment:   { type: SubTeacherCommentSchema,             default: undefined },
  },
  { timestamps: true }
);

export const Video = model<IVideoDocument>('Video', VideoSchema);

```

---
`src/app/modules/master/video/video.routes.ts`
```typescript
import express from 'express';
import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import {
  createVideoValidation,
  listVideosValidation,
  videoIdParam,
  assignReviewerValidation,
  submitReviewValidation,
  publishVideoValidation,
  teacherCommentValidation,
  listAssignedValidation
} from './video.validation';
import { VideoControllers } from './video.controller';

const router = express.Router();

router.post('/', 
  requireAuth, requireRole(['Admin','SeniorAdmin']),
  validateRequest(createVideoValidation),
  VideoControllers.createVideo
);

router.get('/',
  requireAuth, requireRole(['Admin','SeniorAdmin','Management']),
  validateRequest(listVideosValidation),
  VideoControllers.listVideos
);
router.get(
  '/my-assigned',
  requireAuth,
  requireRole(['Teacher']),
  VideoControllers.listMyAssigned
);

router.get('/:id',
  requireAuth,
  validateRequest(videoIdParam),
  VideoControllers.getVideoById
);

router.post('/:id/assign',
  requireAuth, requireRole(['SeniorAdmin','Management']),
  validateRequest(assignReviewerValidation),
  VideoControllers.assignReviewer
);

router.post('/:id/review',
  requireAuth, requireRole(['Teacher']),
  validateRequest(submitReviewValidation),
  VideoControllers.submitReview
);

router.post('/:id/publish',
  requireAuth, requireRole(['SeniorAdmin','Management']),
  validateRequest(publishVideoValidation),
  VideoControllers.publishReview
);

router.get('/me/feedback',
  requireAuth, requireRole(['Teacher']),
  VideoControllers.listTeacherFeedback
);

router.post('/:id/teacher-comment',
  requireAuth, requireRole(['Teacher']),
  validateRequest(teacherCommentValidation),
  VideoControllers.addTeacherComment
);

export const VideoRoutes = router;

```

---
`src/app/modules/master/video/video.service.ts`
```typescript
// src/app/modules/video/video.service.ts

import { Types } from 'mongoose';
import { Video, IVideoDocument } from './video.model';
import { ITeacherInfo, IVideo, VideoStatus } from './video.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';
import { IUserDocument } from '../../user/user.model';
import { IClassDocument } from '../class/class.model';
import { ISectionDocument } from '../section/section.model';
import { ISubjectDocument } from '../subject/subject.model';

// helper: convert a VideoDocument to your IVideo API type
const mapVideo = (doc: IVideoDocument): IVideo => {
  let teacherField: string | ITeacherInfo;

  if (doc.populated('teacher')) {
    // now TypeScript knows we're looking at the full User doc
    const teacherDoc = doc.teacher as unknown as IUserDocument;

    teacherField = {
      _id: teacherDoc.id,
      name: teacherDoc.name,
      email: teacherDoc.email,
    };
  } else {
    teacherField = doc.teacher.toString();
  }

  let assignedReviewerField: string | ITeacherInfo | undefined;
  if (doc.populated('assignedReviewer') && doc.assignedReviewer) {
    const revDoc = doc.assignedReviewer as unknown as IUserDocument;
    assignedReviewerField = {
      _id: revDoc.id,
      name: revDoc.name,
      email: revDoc.email,
    };
  } else {
    // fallback to plain ID string (or undefined)
    assignedReviewerField = doc.assignedReviewer?.toString();
  }

  let classField: string | { _id: string; name: string };
  if (doc.populated('class')) {
    const classDoc = doc.class as unknown as IClassDocument;
    classField = { _id: classDoc.id, name: classDoc.name };
  } else {
    classField = doc.class.toString();
  }

  // — section —
  let sectionField: string | { _id: string; name: string };
  if (doc.populated('section')) {
    const sectionDoc = doc.section as unknown as ISectionDocument;
    sectionField = { _id: sectionDoc.id, name: sectionDoc.name };
  } else {
    sectionField = doc.section.toString();
  }

  // — subject —
  let subjectField: string | { _id: string; name: string };
  if (doc.populated('subject')) {
    const subjectDoc = doc.subject as unknown as ISubjectDocument;
    subjectField = { _id: subjectDoc.id, name: subjectDoc.name };
  } else {
    subjectField = doc.subject.toString();
  }

  let reviewField;
if (doc.review) {
  let reviewerField: string | ITeacherInfo;
  if (doc.populated('review.reviewer')) {
    const revDoc = (doc.review.reviewer as unknown) as IUserDocument;
    reviewerField = {
      _id: revDoc.id,
      name: revDoc.name,
      email: revDoc.email,
    };
  } else {
    reviewerField = doc.review.reviewer.toString();
  }

  reviewField = {
    reviewer: reviewerField,
    classManagement: doc.review.classManagement,
    subjectKnowledge: doc.review.subjectKnowledge,
    otherComments: doc.review.otherComments,
    reviewedAt: doc.review.reviewedAt,
  };
}

  // map teacherComment subdocument if present
  let teacherCommentField;
if (doc.teacherComment) {
  let commenterField: string | ITeacherInfo;

  if (doc.populated('teacherComment.commenter')) {
    // cast via unknown so TS lets us treat it as a full IUserDocument
    const tcDoc = (doc.teacherComment.commenter as unknown) as IUserDocument;
    commenterField = {
      _id: tcDoc.id,
      name: tcDoc.name,
      email: tcDoc.email,
    };
  } else {
    commenterField = doc.teacherComment.commenter.toString();
  }

  teacherCommentField = {
    commenter: commenterField,
    comment:    doc.teacherComment.comment,
    commentedAt: doc.teacherComment.commentedAt,
  };
}


  return {
    _id: doc.id,
    teacher: teacherField,
    class: classField,
    section: sectionField,
    subject: subjectField,
    date: doc.date,
    youtubeUrl: doc.youtubeUrl,
    uploadedBy: doc.uploadedBy.toString(),
    status: doc.status,
    assignedReviewer: assignedReviewerField || undefined,
     review:          reviewField,
  teacherComment:  teacherCommentField,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// 1️⃣ Create a new Video record
export const createVideo = async (
  payload: {
    teacherId: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    date: string;
    videoUrl: string;
  },
  uploadedBy: string,
): Promise<IVideo> => {
  const doc = await Video.create({
    teacher: new Types.ObjectId(payload.teacherId),
    class: new Types.ObjectId(payload.classId),
    section: new Types.ObjectId(payload.sectionId),
    subject: new Types.ObjectId(payload.subjectId),
    date: new Date(payload.date),
    youtubeUrl: payload.videoUrl,
    uploadedBy: new Types.ObjectId(uploadedBy),
    status: 'unassigned' as VideoStatus,
  });

  return mapVideo(doc);
};

// 2️⃣ List videos with optional filters
export const listVideos = async (filters: {
  status?: VideoStatus;
  assignedReviewer?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<IVideo[]> => {
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.assignedReviewer) query.assignedReviewer = filters.assignedReviewer;
  if (filters.classId) query.class = filters.classId;
  if (filters.sectionId) query.section = filters.sectionId;
  if (filters.subjectId) query.subject = filters.subjectId;
  if (filters.teacherId) query.teacher = filters.teacherId;
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }

  const docs = await Video.find(query)
    .populate('teacher')
    .populate('assignedReviewer')
    .populate('class')
    .populate('section')
    .populate('subject')
    .sort('-createdAt');

  return docs.map(mapVideo);
};

// 3️⃣ Fetch a single video by ID
export const getVideoById = async (id: string): Promise<IVideo> => {
  const doc = await Video.findById(id)
    .populate('teacher')
    .populate('assignedReviewer')
    .populate('uploadedBy')
    .populate('class')
    .populate('section')
     .populate('subject')
  .populate('review.reviewer')
  .populate('teacherComment.commenter');

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  return mapVideo(doc);
};

// 4️⃣ Assign or reassign a reviewer
export const assignReviewer = async (videoId: string, reviewerId: string): Promise<IVideo> => {
  const doc = await Video.findByIdAndUpdate(
    videoId,
    { assignedReviewer: new Types.ObjectId(reviewerId), status: 'assigned' as VideoStatus },
    { new: true },
  );
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  return mapVideo(doc);
};

// 5️⃣ Submit review feedback (marks status = reviewed)
export const submitReview = async (
  videoId: string,
  reviewerId: string,
  reviewData: {
    classManagement: string;
    subjectKnowledge: string;
    otherComments: string;
  },
): Promise<IVideo> => {
  const doc = await Video.findById(videoId);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }

  doc.review = {
    reviewer: new Types.ObjectId(reviewerId),
    classManagement: reviewData.classManagement,
    subjectKnowledge: reviewData.subjectKnowledge,
    otherComments: reviewData.otherComments,
    reviewedAt: new Date(),
  };
  doc.status = 'reviewed';
  await doc.save();

  return mapVideo(doc);
};

// 6️⃣ Publish a reviewed video (marks status = published)
export const publishReview = async (videoId: string): Promise<IVideo> => {
  const doc = await Video.findByIdAndUpdate(
    videoId,
    { status: 'published' as VideoStatus },
    { new: true },
  );
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  return mapVideo(doc);
};

// 7️⃣ List all published feedback for a given teacher
export const listTeacherFeedback = async (teacherId: string): Promise<IVideo[]> => {


  const docs = await Video.find({
    teacher: new Types.ObjectId(teacherId),
    status: 'published',
  })
   .populate('teacher')
    .populate('assignedReviewer')
    .populate('uploadedBy')
    .populate('class')
    .populate('section')
    .populate('subject')
  .sort('date');
  return docs.map(mapVideo);
};

// 8️⃣ Add teacher’s own comment to a published review
export const addTeacherComment = async (
  videoId: string,
  teacherId: string,
  comment: string,
): Promise<IVideo> => {
  const doc = await Video.findById(videoId);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
 
    if (doc.teacherComment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already added a comment to this video'
    );
  }
  
  if (doc.teacher.toString() !== teacherId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized to comment on this video');
  }
  if (doc.status !== 'published') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot comment before video is published');
  }

  doc.teacherComment = {
    commenter: new Types.ObjectId(teacherId),
    comment,
    commentedAt: new Date(),
  };
  await doc.save();

  return mapVideo(doc);
};

export const listMyAssigned = async (
  reviewerId: string
): Promise<IVideo[]> => {
  const docs = await Video.find({
    assignedReviewer: new Types.ObjectId(reviewerId),
    status: 'assigned',
  })
    .populate('teacher')
    .populate('class')
    .populate('section')
    .populate('subject')
    .sort('date');

  return docs.map(mapVideo);
};


export const VideoServices = {
  createVideo,
  listVideos,
  getVideoById,
  assignReviewer,
  submitReview,
  publishReview,
  listTeacherFeedback,
  addTeacherComment,
  listMyAssigned
};

```
---
`src/app/modules/master/video/video.type.ts`
```typescript
// src/app/modules/video/video.type.ts

import { IClass } from "../class/class.type";
import { ISection } from "../section/section.type";
import { ISubject } from "../subject/subject.type";

export type VideoStatus = 'unassigned' | 'assigned' | 'reviewed' | 'published';

export interface IReview {
  reviewer: string | ITeacherInfo;
  classManagement: string;
  subjectKnowledge: string;
  otherComments: string;
  reviewedAt: Date;
}
export interface ITeacherInfo {
  _id:   string;
  name:  string;
  email: string;
}

export interface ITeacherComment {
  commenter: string | ITeacherInfo;
  comment: string;
  commentedAt: Date;
}

export interface IVideo {
  _id?: string;
  teacher: string  | ITeacherInfo;
  class: string | IClass;
  section: string | ISection;
  subject: string | ISubject;
  date: Date;
  youtubeUrl: string;
  uploadedBy: string;
  status?: VideoStatus;
  assignedReviewer?: string  | ITeacherInfo;
  review?: IReview;                // ← newly added
  teacherComment?: ITeacherComment; // ← newly added
  createdAt?: Date;
  updatedAt?: Date;
}
```
---
`src/app/modules/master/video/video.validation.ts`
```typescript
// src/app/modules/video/video.validation.ts

import { z } from 'zod';

export const createVideoValidation = z.object({
  body: z.object({
    teacherId: z.string().min(1, 'Teacher ID is required'),
    classId:   z.string().min(1, 'Class ID is required'),
    sectionId: z.string().min(1, 'Section ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    date:      z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
    videoUrl:  z.string().url('Must be a valid URL'),
  }),
});


export const listVideosValidation = z.object({
  query: z.object({
    status:           z.enum(['unassigned','assigned','reviewed','published']).optional(),
    assignedReviewer: z.string().optional(),
    classId:          z.string().optional(),
    sectionId:        z.string().optional(),
    subjectId:        z.string().optional(),
    teacherId:        z.string().optional(),
     dateFrom: z
      .string()
      .optional()
      .refine((val) =>
        // if there's no value, that's fine; otherwise must parse
        !val || !isNaN(Date.parse(val)),
       { message: "Invalid date" }),
    dateTo: z
      .string()
      .optional()
      .refine((val) =>
        !val || !isNaN(Date.parse(val)),
       { message: "Invalid date" }),
  }),
});

export const assignReviewerValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
  body:   z.object({ reviewerId: z.string().min(1, 'Reviewer ID is required') }),
});


export const publishVideoValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
});


export const submitReviewValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
  body: z.object({
    classManagement:  z.string().min(1, 'Feedback is required'),
    subjectKnowledge: z.string().min(1, 'Feedback is required'),
    otherComments:    z.string().min(1, 'Feedback is required'),
  }),
});


export const videoIdParam = z.object({
  params: z.object({ id: z.string().length(24) }),
});


export const teacherCommentValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
  body:   z.object({ comment: z.string().min(1, 'Comment cannot be empty') }),
});

export const listAssignedValidation = z.object({});
```

---
`src/app/modules/master/video/video.controller.ts`
```typescript

```