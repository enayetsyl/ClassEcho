"use strict";
// src/app/modules/quran/quran.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranRoutes = void 0;
const express_1 = __importDefault(require("express"));
const quran_student_routes_1 = require("./student/quran-student.routes");
const quran_entry_routes_1 = require("./entry/quran-entry.routes");
const quran_reports_routes_1 = require("./reports/quran-reports.routes");
const quran_reference_routes_1 = require("./reference/quran-reference.routes");
const router = express_1.default.Router();
router.use('/students', quran_student_routes_1.QuranStudentRoutes);
router.use('/entries', quran_entry_routes_1.QuranEntryRoutes);
router.use('/reports', quran_reports_routes_1.QuranReportsRoutes);
router.use('/reference', quran_reference_routes_1.QuranReferenceRoutes);
exports.QuranRoutes = router;
