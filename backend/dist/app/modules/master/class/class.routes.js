"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassRoutes = void 0;
const express_1 = __importDefault(require("express"));
const class_controller_1 = require("./class.controller");
const class_validation_1 = require("./class.validation");
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const router = express_1.default.Router();
// List all classes
router.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Management']), class_controller_1.ClassControllers.getAllClasses);
// Create a new class
router.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(class_validation_1.createClassValidation), class_controller_1.ClassControllers.createClass);
// Rename (update) a class
router.put('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(class_validation_1.updateClassValidation), class_controller_1.ClassControllers.updateClass);
// (Optionally) Delete a class
router.delete('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), class_controller_1.ClassControllers.deleteClass);
exports.ClassRoutes = router;
