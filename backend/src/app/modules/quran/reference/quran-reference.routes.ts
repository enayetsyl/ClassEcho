// src/app/modules/quran/reference/quran-reference.routes.ts

import express from 'express';
import { QuranReferenceControllers } from './quran-reference.controller';

const router = express.Router();

router.get('/surahs', QuranReferenceControllers.listSurahs);
router.get('/surahs/:number', QuranReferenceControllers.getSurahByNumber);
router.get('/juz', QuranReferenceControllers.listJuz);
router.get('/juz/:number', QuranReferenceControllers.getJuzByNumber);

export const QuranReferenceRoutes = router;
