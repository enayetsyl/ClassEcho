// src/app/modules/quran/quran.routes.ts

import express from 'express';
import { QuranStudentRoutes } from './student/quran-student.routes';
import { QuranEntryRoutes } from './entry/quran-entry.routes';
import { QuranReportsRoutes } from './reports/quran-reports.routes';

const router = express.Router();

router.use('/students', QuranStudentRoutes);
router.use('/entries', QuranEntryRoutes);
router.use('/reports', QuranReportsRoutes);

export const QuranRoutes = router;
