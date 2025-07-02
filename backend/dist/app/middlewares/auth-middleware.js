"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const verify_token_1 = require("../utils/verify-token");
const app_error_1 = __importDefault(require("../errors/app-error"));
/**
 * Middleware: Verifies JWT, attaches user info to req.user, calls next().
 */
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return next(new app_error_1.default(http_status_1.default.UNAUTHORIZED, 'No authentication token provided'));
    }
    try {
        const decoded = (0, verify_token_1.verifyToken)(token, config_1.default.jwt_secret);
        req.user = decoded;
        next();
    }
    catch (err) {
        return next(new app_error_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid or expired authentication token'));
    }
};
exports.requireAuth = requireAuth;
/**
 * Middleware: Checks if req.user.roles includes at least one required role.
 * Usage: requireRole(['Admin', 'Teacher'])
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return next(new app_error_1.default(http_status_1.default.FORBIDDEN, 'No user roles found in token'));
        }
        // roles can be string[] or single string
        const hasRole = req.user.roles.some((r) => roles.includes(r));
        if (!hasRole) {
            return next(new app_error_1.default(http_status_1.default.FORBIDDEN, 'You do not have permission to access this resource'));
        }
        next();
    };
};
exports.requireRole = requireRole;
