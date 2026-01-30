// src/app/modules/quran/quran.routes.ts

import express from 'express';
import { QuranStudentRoutes } from './student/quran-student.routes';
import { QuranEntryRoutes } from './entry/quran-entry.routes';

const router = express.Router();

router.use('/students', QuranStudentRoutes);
router.use('/entries', QuranEntryRoutes);

export const QuranRoutes = router;
