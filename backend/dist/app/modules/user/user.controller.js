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
exports.UserControllers = void 0;
const catch_async_1 = __importDefault(require("../../utils/catch-async"));
const user_service_1 = require("./user.service");
const send_response_1 = __importDefault(require("../../utils/send-response"));
// Add new teacher (Admin/SeniorAdmin)
const addTeacher = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teacher = yield user_service_1.UserServices.createTeacher(req.body);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Teacher created successfully',
        data: teacher,
    });
}));
// List all teachers
const getAllTeachers = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teachers = yield user_service_1.UserServices.getAllTeachers();
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Teachers retrieved successfully',
        data: teachers,
    });
}));
// Activate/Deactivate teacher
const toggleTeacherActive = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const teacher = yield user_service_1.UserServices.toggleTeacherActive(id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: `Teacher account is now ${teacher.active ? 'active' : 'inactive'}`,
        data: teacher,
    });
}));
// Get own profile
const getProfile = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const profile = yield user_service_1.UserServices.getProfile(userId);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Profile retrieved successfully',
        data: profile,
    });
}));
// Update own profile
const updateProfile = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const updated = yield user_service_1.UserServices.updateProfile(userId, req.body);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Profile updated successfully',
        data: updated,
    });
}));
exports.UserControllers = {
    addTeacher,
    getAllTeachers,
    toggleTeacherActive,
    getProfile,
    updateProfile,
};
