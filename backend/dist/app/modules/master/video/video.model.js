"use strict";
// src/app/modules/video/video.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
const mongoose_1 = require("mongoose");
// src/app/modules/video/video.model.ts
const SubCriterionSchema = new mongoose_1.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });
const SubReviewSchema = new mongoose_1.Schema({
    reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectKnowledge: { type: SubCriterionSchema, required: true },
    engagementWithStudents: { type: SubCriterionSchema, required: true },
    useOfTeachingAids: { type: SubCriterionSchema, required: true },
    interactionAndQuestionHandling: { type: SubCriterionSchema, required: true },
    studentDiscipline: { type: SubCriterionSchema, required: true },
    teachersControlOverClass: { type: SubCriterionSchema, required: true },
    participationLevelOfStudents: { type: SubCriterionSchema, required: true },
    completionOfPlannedSyllabus: { type: SubCriterionSchema, required: true },
    overallComments: { type: String, trim: true, required: true },
    strengthsObserved: { type: String, trim: true, default: '' },
    areasForImprovement: { type: String, trim: true, default: '' },
    immediateSuggestions: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, required: true },
}, { _id: false });
const SubTeacherCommentSchema = new mongoose_1.Schema({
    commenter: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    commentedAt: { type: Date, required: true },
}, { _id: false });
const LanguageSubReviewSchema = new mongoose_1.Schema({
    reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    classStartedOnTime: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    classPerformedAsTraining: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    canMaintainDiscipline: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    studentsUnderstandLesson: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    isClassInteractive: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    teacherSignsHomeworkDiary: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    teacherChecksDiary: {
        answeredYes: { type: Boolean, required: true },
        comment: { type: String, required: true, trim: true },
    },
    otherComments: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, required: true },
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
    languageReview: { type: LanguageSubReviewSchema, default: undefined },
    teacherComment: { type: SubTeacherCommentSchema, default: undefined },
}, { timestamps: true });
exports.Video = (0, mongoose_1.model)('Video', VideoSchema);
