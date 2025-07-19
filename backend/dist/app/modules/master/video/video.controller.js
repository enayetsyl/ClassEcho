"use strict";
// src/app/modules/video/video.controller.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoControllers = void 0;
const catch_async_1 = __importDefault(require("../../../utils/catch-async"));
const send_response_1 = __importDefault(require("../../../utils/send-response"));
const video_service_1 = require("./video.service");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const video_model_1 = require("./video.model");
const http_status_1 = __importDefault(require("http-status"));
const createVideo = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const video = yield video_service_1.VideoServices.createVideo(req.body, (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId);
    (0, send_response_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Video created successfully',
        data: video,
    });
}));
const listVideos = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videos = yield video_service_1.VideoServices.listVideos(req.query);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Videos retrieved successfully',
        data: videos,
    });
}));
const getVideoById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const video = yield video_service_1.VideoServices.getVideoById(req.params.id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Video retrieved successfully',
        data: video,
    });
}));
const assignReviewer = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield video_service_1.VideoServices.assignReviewer(req.params.id, req.body.reviewerId);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Reviewer assigned successfully',
        data: updated,
    });
}));
const submitReview = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ look up the video (and its subject) first
    const videoDoc = yield video_model_1.Video.findById(req.params.id).populate('subject');
    if (!videoDoc)
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    // 2️⃣ decide which review to apply
    const subjName = videoDoc.subject.name.toLowerCase();
    let updated;
    if (['quran', 'arabic'].includes(subjName)) {
        // validate req.body against your language Zod schema if you wish
        updated = yield video_service_1.VideoServices.submitLanguageReview(req.params.id, req.user.userId, req.body);
    }
    else {
        updated = yield video_service_1.VideoServices.submitReview(req.params.id, req.user.userId, req.body);
    }
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Review submitted successfully',
        data: updated,
    });
}));
const publishReview = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield video_service_1.VideoServices.publishReview(req.params.id);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Video published successfully',
        data: updated,
    });
}));
const listTeacherFeedback = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedback = yield video_service_1.VideoServices.listTeacherFeedback(req.user.userId);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Teacher feedback retrieved successfully',
        data: feedback,
    });
}));
const addTeacherComment = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield video_service_1.VideoServices.addTeacherComment(req.params.id, req.user.userId, req.body.comment);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Comment added successfully',
        data: updated,
    });
}));
const listAssignedVideos = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewerId = req.user.userId;
    const videos = yield video_service_1.VideoServices.listVideos({
        assignedReviewer: reviewerId,
        status: 'assigned',
    });
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Assigned videos retrieved successfully',
        data: videos,
    });
}));
const listMyAssigned = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videos = yield video_service_1.VideoServices.listMyAssigned(req.user.userId);
    (0, send_response_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Assigned videos retrieved successfully',
        data: videos,
    });
}));
exports.VideoControllers = {
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
