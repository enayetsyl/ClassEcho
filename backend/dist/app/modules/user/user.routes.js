"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validate_request_1 = __importDefault(require("../../middlewares/validate-request"));
const user_validation_1 = require("./user.validation");
const auth_middleware_1 = require("../../middlewares/auth-middleware");
const router = express_1.default.Router();
// Only Admin/SeniorAdmin can add or list teachers, or toggle status
router.post('/admin/teachers', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(user_validation_1.addTeacherValidation), user_controller_1.UserControllers.addTeacher);
router.get('/admin/teachers', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), user_controller_1.UserControllers.getAllTeachers);
router.patch('/admin/teachers/:id/active', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), user_controller_1.UserControllers.toggleTeacherActive);
// Teachers can get/update their own profile
router.get('/me/profile', auth_middleware_1.requireAuth, user_controller_1.UserControllers.getProfile);
router.put('/me/profile', auth_middleware_1.requireAuth, (0, validate_request_1.default)(user_validation_1.updateProfileValidation), user_controller_1.UserControllers.updateProfile);
exports.UserRoutes = router;
