"use strict";
// src/app/modules/quran/reference/quran-reference.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuranReferenceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const quran_reference_controller_1 = require("./quran-reference.controller");
const router = express_1.default.Router();
router.get('/surahs', quran_reference_controller_1.QuranReferenceControllers.listSurahs);
router.get('/surahs/:number', quran_reference_controller_1.QuranReferenceControllers.getSurahByNumber);
router.get('/juz', quran_reference_controller_1.QuranReferenceControllers.listJuz);
router.get('/juz/:number', quran_reference_controller_1.QuranReferenceControllers.getJuzByNumber);
exports.QuranReferenceRoutes = router;
