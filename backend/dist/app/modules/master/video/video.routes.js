"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validate_request_1 = __importDefault(require("../../../middlewares/validate-request"));
const auth_middleware_1 = require("../../../middlewares/auth-middleware");
const video_validation_1 = require("./video.validation");
const video_controller_1 = require("./video.controller");
const router = express_1.default.Router();
router.post('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin']), (0, validate_request_1.default)(video_validation_1.createVideoValidation), video_controller_1.VideoControllers.createVideo);
router.get('/', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Admin', 'SeniorAdmin', 'Management']), (0, validate_request_1.default)(video_validation_1.listVideosValidation), video_controller_1.VideoControllers.listVideos);
router.get('/my-assigned', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Teacher']), video_controller_1.VideoControllers.listMyAssigned);
router.get('/:id', auth_middleware_1.requireAuth, (0, validate_request_1.default)(video_validation_1.videoIdParam), video_controller_1.VideoControllers.getVideoById);
router.post('/:id/assign', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['SeniorAdmin', 'Management']), (0, validate_request_1.default)(video_validation_1.assignReviewerValidation), video_controller_1.VideoControllers.assignReviewer);
router.post('/:id/review', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Teacher']), 
// validateRequest(submitReviewValidation),
video_controller_1.VideoControllers.submitReview);
router.post('/:id/publish', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['SeniorAdmin', 'Management']), (0, validate_request_1.default)(video_validation_1.publishVideoValidation), video_controller_1.VideoControllers.publishReview);
router.get('/me/feedback', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Teacher']), video_controller_1.VideoControllers.listTeacherFeedback);
router.post('/:id/teacher-comment', auth_middleware_1.requireAuth, (0, auth_middleware_1.requireRole)(['Teacher']), (0, validate_request_1.default)(video_validation_1.teacherCommentValidation), video_controller_1.VideoControllers.addTeacherComment);
exports.VideoRoutes = router;
