// src/app/modules/quran/reference/quran-reference.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { SURAH_DATA, getSurahByNumber } from './surah-data';
import { JUZ_DATA, getJuzByNumber } from './juz-data';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';

const listSurahs = catchAsync(async (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Surahs retrieved successfully',
    data: SURAH_DATA,
  });
});

const getSurahByNumberHandler = catchAsync(async (req: Request, res: Response) => {
  const number = parseInt(req.params.number, 10);
  if (isNaN(number) || number < 1 || number > 114) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid surah number (1-114)');
  }
  const surah = getSurahByNumber(number);
  if (!surah) {
    throw new AppError(httpStatus.NOT_FOUND, 'Surah not found');
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Surah retrieved successfully',
    data: surah,
  });
});

const listJuz = catchAsync(async (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Juz list retrieved successfully',
    data: JUZ_DATA,
  });
});

const getJuzByNumberHandler = catchAsync(async (req: Request, res: Response) => {
  const number = parseInt(req.params.number, 10);
  if (isNaN(number) || number < 1 || number > 30) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid juz number (1-30)');
  }
  const juz = getJuzByNumber(number);
  if (!juz) {
    throw new AppError(httpStatus.NOT_FOUND, 'Juz not found');
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Juz retrieved successfully',
    data: juz,
  });
});

export const QuranReferenceControllers = {
  listSurahs,
  getSurahByNumber: getSurahByNumberHandler,
  listJuz,
  getJuzByNumber: getJuzByNumberHandler,
};
