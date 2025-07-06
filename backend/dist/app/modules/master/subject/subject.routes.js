"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubjectRoutes = void 0;
const express_1 = __importDefault(require("express"));
const subject_controller_1 = require("./subject.controller");
const subject_validation_1 = require("./subject.validation");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const router = express_1.default.Router();
// List all subjects
router.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Management']), subject_controller_1.SubjectControllers.getAllSubjects);
// Create a new subject
router.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(subject_validation_1.createSubjectValidation), subject_controller_1.SubjectControllers.createSubject);
// Rename (update) a subject
router.put('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(subject_validation_1.updateSubjectValidation), subject_controller_1.SubjectControllers.updateSubject);
// (Optionally) Delete a subject
router.delete('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), subject_controller_1.SubjectControllers.deleteSubject);
exports.SubjectRoutes = router;
