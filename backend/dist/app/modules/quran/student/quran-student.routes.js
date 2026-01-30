"use strict";
// src/app/modules/quran/student/quran-student.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranStudentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const quran_student_validation_1 = require("./quran-student.validation");
const quran_student_controller_1 = require("./quran-student.controller");
const router = express_1.default.Router();
router.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher', 'Management']), (0, validate_request_1.default)(quran_student_validation_1.listQuranStudentsValidation), quran_student_controller_1.QuranStudentControllers.listStudents);
router.get('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher', 'Management']), (0, validate_request_1.default)(quran_student_validation_1.quranStudentIdParam), quran_student_controller_1.QuranStudentControllers.getStudentById);
router.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(quran_student_validation_1.createQuranStudentValidation), quran_student_controller_1.QuranStudentControllers.createStudent);
router.patch('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(quran_student_validation_1.updateQuranStudentValidation), quran_student_controller_1.QuranStudentControllers.updateStudent);
router.delete('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(quran_student_validation_1.quranStudentIdParam), quran_student_controller_1.QuranStudentControllers.deleteStudent);
router.post('/bulk', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(quran_student_validation_1.bulkCreateQuranStudentsValidation), quran_student_controller_1.QuranStudentControllers.bulkImportStudents);
exports.QuranStudentRoutes = router;
