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
exports.AuthControllers = void 0;
const catch_async_1 = __importDefault(require("../../utils/catch-async"));
const auth_service_1 = require("./auth.service");
const send_response_1 = __importDefault(require("../../utils/send-response"));
const config_1 = __importDefault(require("../../../config"));
// User login
const login = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, user } = yield auth_service_1.AuthServices.login(req.body);
    res.cookie('token', token, {
        httpOnly: true,
        secure: config_1.default.node_env === 'production',
        sameSite: 'strict',
        maxAge: Number(config_1.default.jwt_expires_in) * 1000,
    });
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Login successful',
        data: user,
    });
}));
// Forgot password (send reset email)
const forgotPassword = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield auth_service_1.AuthServices.forgotPassword(req.body.email);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password reset email sent (if account exists)',
    });
}));
// Reset password using token
const resetPassword = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield auth_service_1.AuthServices.resetPassword(req.body.token, req.body.newPassword);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password reset successful',
    });
}));
// Change password (logged-in users)
const changePassword = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield auth_service_1.AuthServices.changePassword((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Password changed successfully',
    });
}));
// (Optional) Logout - for stateless JWT, this is often just a frontend action
const logout = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // If you want to blacklist tokens, implement here. For now, just respond.
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Logout successful',
    });
}));
exports.AuthControllers = {
    login,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
};
