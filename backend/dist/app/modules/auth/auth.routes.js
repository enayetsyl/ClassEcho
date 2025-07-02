"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_request_1 = __importDefault(require("../../middlewares/validate-request"));
const auth_validation_1 = require("./auth.validation");
const auth_middleware_1 = require("../../middlewares/auth-middleware");
const router = (0, express_1.Router)();
// Public
router.post('/login', (0, validate_request_1.default)(auth_validation_1.loginValidation), auth_controller_1.AuthControllers.login);
router.post('/forgot-password', (0, validate_request_1.default)(auth_validation_1.forgotPasswordValidation), auth_controller_1.AuthControllers.forgotPassword);
router.post('/reset-password', (0, validate_request_1.default)(auth_validation_1.resetPasswordValidation), auth_controller_1.AuthControllers.resetPassword);
// Auth required
router.post('/change-password', auth_middleware_1.requireAuth, (0, validate_request_1.default)(auth_validation_1.changePasswordValidation), auth_controller_1.AuthControllers.changePassword);
// Optional: 
router.post('/logout', auth_middleware_1.requireAuth, auth_controller_1.AuthControllers.logout);
exports.AuthRoutes = router;
