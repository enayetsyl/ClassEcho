"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const user_model_1 = require("../user/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const create_token_1 = require("../../utils/create-token");
const config_1 = __importDefault(require("../../../config"));
const app_error_1 = __importDefault(require("../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const send_mail_1 = require("../../utils/send-mail");
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: payload.email });
    if (!user || !user.active) {
        throw new app_error_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid credentials or account inactive');
    }
    const isMatch = yield bcrypt_1.default.compare(payload.password, user.passwordHash);
    if (!isMatch) {
        throw new app_error_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid credentials');
    }
    const userId = user._id;
    const jwtPayload = {
        userId: userId,
        roles: user.roles,
        mustChangePassword: !!user.mustChangePassword,
    };
    const token = (0, create_token_1.createToken)(jwtPayload, config_1.default.jwt_secret, Number(config_1.default.jwt_expires_in));
    return {
        token,
        user: {
            userId,
            name: user.name,
            roles: user.roles,
            mustChangePassword: !!user.mustChangePassword,
        },
    };
});
// Forgot Password: generate token, save to user, send email
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email });
    if (!user)
        return; // Don't leak info
    // Generate token and expiry (1 hour)
    const token = Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordToken = token;
    user.resetTokenExpires = expires;
    yield user.save();
    const resetLink = `${config_1.default.app_base_url}/reset-password?token=${token}`;
    yield (0, send_mail_1.sendMail)({
        to: user.email,
        subject: 'Reset your password',
        html: `
    <p>Hello ${user.name},</p>
    <p>You requested a password reset. Click the link below to set a new password. If you did not request this, you can ignore this email.</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>- SCD Admin</p>
  `,
    });
});
// Reset password (by token)
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({
        resetPasswordToken: token,
        resetTokenExpires: { $gt: new Date() },
    });
    if (!user)
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Invalid or expired token');
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    user.passwordHash = yield bcrypt_1.default.hash(newPassword, saltRounds);
    user.mustChangePassword = false;
    user.resetPasswordToken = undefined;
    user.resetTokenExpires = undefined;
    yield user.save();
});
// Change password (for logged-in users)
const changePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user)
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    // If mustChangePassword, oldPassword may not be required
    if (!user.mustChangePassword) {
        if (!payload.oldPassword)
            throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Old password required');
        const isMatch = yield bcrypt_1.default.compare(payload.oldPassword, user.passwordHash);
        if (!isMatch)
            throw new app_error_1.default(http_status_1.default.UNAUTHORIZED, 'Old password is incorrect');
    }
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    user.passwordHash = yield bcrypt_1.default.hash(payload.newPassword, saltRounds);
    user.mustChangePassword = false;
    yield user.save();
});
exports.AuthServices = {
    login,
    forgotPassword,
    resetPassword,
    changePassword,
};
