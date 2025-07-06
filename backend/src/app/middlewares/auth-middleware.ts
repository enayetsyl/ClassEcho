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
    const hasRole = req.user.roles.some((r: UserRole) => roles.includes(r));
    if (!hasRole) {
      return next(
        new AppError(httpStatus.FORBIDDEN, 'You do not have permission to access this resource')
      );
    }
    next();
  };
};
