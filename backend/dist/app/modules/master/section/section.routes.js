"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const section_controller_1 = require("./section.controller");
const section_validation_1 = require("./section.validation");
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const router = express_1.default.Router();
// List all sections
router.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Management']), section_controller_1.SectionControllers.getAllSections);
// Create a new section
router.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(section_validation_1.createSectionValidation), section_controller_1.SectionControllers.createSection);
// Rename (update) a section
router.put('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(section_validation_1.updateSectionValidation), section_controller_1.SectionControllers.updateSection);
// (Optionally) Delete a section
router.delete('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), section_controller_1.SectionControllers.deleteSection);
exports.SectionRoutes = router;
