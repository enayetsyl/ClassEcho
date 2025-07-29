import express from 'express';
import validateRequest from '../../../middlewares/validate-request';
import { requireAuth, requireRole } from '../../../middlewares/auth-middleware';
import {
  createVideoValidation,
  listVideosValidation,
  videoIdParam,
  assignReviewerValidation,
  submitReviewValidation,
  publishVideoValidation,
  teacherCommentValidation,
  listAssignedValidation
} from './video.validation';
import { VideoControllers } from './video.controller';

const router = express.Router();

router.post('/', 
  requireAuth, requireRole(['Admin','SeniorAdmin']),
  validateRequest(createVideoValidation),
  VideoControllers.createVideo
);

router.get('/',
  requireAuth, requireRole(['Admin','SeniorAdmin','Management']),
  validateRequest(listVideosValidation),
  VideoControllers.listVideos
);
router.get(
  '/my-assigned',
  requireAuth,
  requireRole(['Teacher']),
  VideoControllers.listMyAssigned
);

router.get('/:id',
  requireAuth,
  validateRequest(videoIdParam),
  VideoControllers.getVideoById
);

router.post('/:id/assign',
  requireAuth, requireRole(['SeniorAdmin','Management']),
  validateRequest(assignReviewerValidation),
  VideoControllers.assignReviewer
);

router.post('/:id/review',
  requireAuth, requireRole(['Teacher']),
  // validateRequest(submitReviewValidation),
  VideoControllers.submitReview
);

router.post('/:id/publish',
  requireAuth, requireRole(['SeniorAdmin','Management']),
  validateRequest(publishVideoValidation),
  VideoControllers.publishReview
);

router.get('/me/feedback',
  requireAuth, requireRole(['Teacher']),
  VideoControllers.listTeacherFeedback
);

router.post('/:id/teacher-comment',
  requireAuth, requireRole(['Teacher']),
  validateRequest(teacherCommentValidation),
  VideoControllers.addTeacherComment
);

export const VideoRoutes = router;
