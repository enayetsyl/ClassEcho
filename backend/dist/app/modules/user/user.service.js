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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const user_model_1 = require("./user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const app_error_1 = __importDefault(require("../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const pick_1 = require("../../utils/pick");
const config_1 = __importDefault(require("../../../config"));
const send_mail_1 = require("../../utils/send-mail");
// Create teacher (Admin/SeniorAdmin)
const createTeacher = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user exists
    const existing = yield user_model_1.User.findOne({ email: data.email });
    if (existing) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Email already in use');
    }
    // Generate random temp password and hash it
    const tempPassword = Math.random().toString(36).slice(-8);
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = yield bcrypt_1.default.hash(tempPassword, saltRounds);
    // Create user with mustChangePassword=true
    const user = yield user_model_1.User.create(Object.assign(Object.assign({}, data), { passwordHash, roles: ['Teacher'], mustChangePassword: true, active: true }));
    yield (0, send_mail_1.sendMail)({
        to: user.email,
        subject: 'Welcome to SCD Class Review App.',
        html: `
    <p>Hello ${user.name},</p>
    <p>Your teacher account has been created. Please use this temporary password to log in for the first time:</p>
    <p><b>${tempPassword}</b></p>
    <p>Login here: <a href="${config_1.default.app_base_url}/login">${config_1.default.app_base_url}/login</a></p>
    <p>Be sure to change your password after logging in.</p>
    <p>- SCD Admin</p>
  `,
    });
    // Never return passwordHash
    const _a = user.toObject(), { passwordHash: _ } = _a, plainUser = __rest(_a, ["passwordHash"]);
    return Object.assign({}, plainUser);
});
// List all teachers (active/inactive)
const getAllTeachers = () => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.User.find({ roles: 'Teacher' }).select('-passwordHash');
});
// Toggle teacher account active/inactive
const toggleTeacherActive = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user || !user.roles.includes('Teacher')) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Teacher not found');
    }
    user.active = !user.active;
    yield user.save();
    const _a = user.toObject(), { passwordHash: _ } = _a, plainUser = __rest(_a, ["passwordHash"]);
    return plainUser;
});
// Get profile for any logged-in user
const getProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('-passwordHash');
    if (!user)
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    return user;
});
// Update own profile (allowed fields only)
const updateProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const allowedFields = ['name', 'phone', 'dateOfBirth', 'profileImageUrl'];
    const update = (0, pick_1.pickFields)(data, allowedFields);
    const user = yield user_model_1.User.findByIdAndUpdate(userId, update, { new: true }).select('-passwordHash');
    if (!user)
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    return user;
});
exports.UserServices = {
    createTeacher,
    getAllTeachers,
    toggleTeacherActive,
    getProfile,
    updateProfile,
};
