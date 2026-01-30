"use strict";
// src/app/modules/quran/entry/quran-entry.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranEntryRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const quran_entry_validation_1 = require("./quran-entry.validation");
const quran_entry_controller_1 = require("./quran-entry.controller");
const router = express_1.default.Router();
// Must be before /:id so "student" is not parsed as id
router.get('/student/:studentId', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher', 'Management']), (0, validate_request_1.default)(quran_entry_validation_1.quranEntryStudentIdParam), quran_entry_controller_1.QuranEntryControllers.getEntriesByStudent);
router.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher', 'Management']), (0, validate_request_1.default)(quran_entry_validation_1.listQuranEntriesValidation), quran_entry_controller_1.QuranEntryControllers.listEntries);
router.get('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher', 'Management']), (0, validate_request_1.default)(quran_entry_validation_1.quranEntryIdParam), quran_entry_controller_1.QuranEntryControllers.getEntryById);
router.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher']), (0, validate_request_1.default)(quran_entry_validation_1.createQuranEntryValidation), quran_entry_controller_1.QuranEntryControllers.createEntry);
router.patch('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Teacher']), (0, validate_request_1.default)(quran_entry_validation_1.updateQuranEntryValidation), quran_entry_controller_1.QuranEntryControllers.updateEntry);
router.delete('/:id', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(quran_entry_validation_1.quranEntryIdParam), quran_entry_controller_1.QuranEntryControllers.deleteEntry);
router.post('/bulk', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(quran_entry_validation_1.bulkCreateQuranEntriesValidation), quran_entry_controller_1.QuranEntryControllers.bulkImportEntries);
exports.QuranEntryRoutes = router;
