"use strict";
// src/app/modules/video/video.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const mongoose_1 = require("mongoose");
const SubReviewSchema = new mongoose_1.Schema({
    reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    classManagement: { type: String, required: true },
    subjectKnowledge: { type: String, required: true },
    otherComments: { type: String, required: true },
    reviewedAt: { type: Date, required: true },
}, { _id: false });
const SubTeacherCommentSchema = new mongoose_1.Schema({
    commenter: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    commentedAt: { type: Date, required: true },
}, { _id: false });
const VideoSchema = new mongoose_1.Schema({
    teacher: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    class: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Section', required: true },
    subject: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subject', required: true },
    date: { type: Date, required: true },
    youtubeUrl: { type: String, required: true, trim: true },
    uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['unassigned', 'assigned', 'reviewed', 'published'],
        default: 'unassigned',
    },
    assignedReviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    review: { type: SubReviewSchema, default: undefined },
    teacherComment: { type: SubTeacherCommentSchema, default: undefined },
}, { timestamps: true });
exports.Video = (0, mongoose_1.model)('Video', VideoSchema);
