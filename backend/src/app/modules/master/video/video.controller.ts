// src/app/modules/video/video.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { VideoServices } from './video.service';
import { ILanguageReviewInput, IReviewInput, IVideo } from './video.type';
import AppError from '../../../errors/app-error';
import { Video } from './video.model';
import httpStatus from 'http-status';
import { pickFields } from '../../../utils/pick';

const createVideo = catchAsync(async (req: Request, res: Response) => {
  const video = await VideoServices.createVideo(req.body, req?.user?.userId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Video created successfully',
    data: video,
  });
});

const listVideos = catchAsync(async (req: Request, res: Response) => {

   const filters = pickFields(req.query, [
    'status',
    'assignedReviewer',
    'classId',
    'sectionId',
    'subjectId',
    'teacherId',
    'dateFrom',
    'dateTo',
  ]);
  const options = pickFields(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

 
  const result = await VideoServices.listVideos(filters as any, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Videos retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getVideoById = catchAsync(async (req: Request, res: Response) => {
  const video = await VideoServices.getVideoById(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video retrieved successfully',
    data: video,
  });
});

const assignReviewer = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.assignReviewer(req.params.id, req.body.reviewerId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviewer assigned successfully',
    data: updated,
  });
});

const submitReview = catchAsync(async (req: Request, res: Response) => {
  // 1️⃣ look up the video (and its subject) first
  const videoDoc = await Video.findById(req.params.id).populate('class');
  if (!videoDoc) throw new AppError(httpStatus.NOT_FOUND, 'Video not found');

  // 2️⃣ decide which review to apply
  const subjName = (videoDoc.class as any).name.toLowerCase();
  let updated: IVideo;



  if (['quran','arabic'].includes(subjName)) {
    // validate req.body against your language Zod schema if you wish
    updated = await VideoServices.submitLanguageReview(
      req.params.id,
      req.user!.userId,
      req.body as ILanguageReviewInput
    );
  } else {
    updated = await VideoServices.submitReview(
      req.params.id,
      req.user!.userId,
      req.body as IReviewInput
    );
  }

  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review submitted successfully',
    data: updated,
  });
});

const publishReview = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.publishReview(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Video published successfully',
    data: updated,
  });
});

const listTeacherFeedback = catchAsync(async (req: Request, res: Response) => {
 
  const options = pickFields(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await VideoServices.listTeacherFeedback(req.user.userId, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher feedback retrieved successfully',
      data: result.data,
    meta: result.meta,
  });
});

const addTeacherComment = catchAsync(async (req: Request, res: Response) => {
  const updated = await VideoServices.addTeacherComment(
    req.params.id,
    req.user.userId,
    req.body.comment
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Comment added successfully',
    data: updated,
  });
});


const listMyAssigned = catchAsync(async (req: Request, res: Response) => {
  const options = pickFields(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await VideoServices.listMyAssigned(req.user!.userId, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Assigned videos retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

export const VideoControllers = {
  createVideo,
  listVideos,
  getVideoById,
  assignReviewer,
  submitReview,
  publishReview,
  listTeacherFeedback,
  addTeacherComment,
  // listAssignedVideos,
  listMyAssigned

};
