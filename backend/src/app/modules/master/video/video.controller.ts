// src/app/modules/video/video.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catch-async';
import sendResponse from '../../../utils/send-response';
import { VideoServices } from './video.service';

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
 
  const videos = await VideoServices.listVideos(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Videos retrieved successfully',
    data: videos,
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
  const updated = await VideoServices.submitReview(
    req.params.id,
    req.user.userId,
    req.body
  );
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
 
  const feedback = await VideoServices.listTeacherFeedback(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher feedback retrieved successfully',
    data: feedback,
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

const listAssignedVideos = catchAsync(async (req: Request, res: Response) => {
  const reviewerId = req.user!.userId;  
  const videos = await VideoServices.listVideos({
    assignedReviewer: reviewerId,
    status: 'assigned',
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Assigned videos retrieved successfully',
    data: videos,
  });
});

const listMyAssigned = catchAsync(async (req: Request, res: Response) => {
  const videos = await VideoServices.listMyAssigned(req.user!.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Assigned videos retrieved successfully',
    data: videos,
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
  listAssignedVideos,
  listMyAssigned

};
