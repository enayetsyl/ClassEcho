"use strict";
// src/app/modules/video/video.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAssignedValidation = exports.teacherCommentValidation = exports.videoIdParam = exports.submitReviewValidation = exports.publishVideoValidation = exports.languageReviewSchema = exports.generalReviewSchema = exports.assignReviewerValidation = exports.listVideosValidation = exports.createVideoValidation = void 0;
const zod_1 = require("zod");
exports.createVideoValidation = zod_1.z.object({
    body: zod_1.z.object({
        teacherId: zod_1.z.string().min(1, 'Teacher ID is required'),
        classId: zod_1.z.string().min(1, 'Class ID is required'),
        sectionId: zod_1.z.string().min(1, 'Section ID is required'),
        subjectId: zod_1.z.string().min(1, 'Subject ID is required'),
        date: zod_1.z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
        videoUrl: zod_1.z.string().url('Must be a valid URL'),
    }),
});
exports.listVideosValidation = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['unassigned', 'assigned', 'reviewed', 'published']).optional(),
        assignedReviewer: zod_1.z.string().optional(),
        classId: zod_1.z.string().optional(),
        sectionId: zod_1.z.string().optional(),
        subjectId: zod_1.z.string().optional(),
        teacherId: zod_1.z.string().optional(),
        dateFrom: zod_1.z
            .string()
            .optional()
            .refine((val) => 
        // if there's no value, that's fine; otherwise must parse
        !val || !isNaN(Date.parse(val)), { message: "Invalid date" }),
        dateTo: zod_1.z
            .string()
            .optional()
            .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid date" }),
    }),
});
exports.assignReviewerValidation = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().length(24) }),
    body: zod_1.z.object({ reviewerId: zod_1.z.string().min(1, 'Reviewer ID is required') }),
});
exports.generalReviewSchema = zod_1.z.object({
    subjectKnowledge: zod_1.z.object({
        rating: zod_1.z.number().min(1).max(5),
        comment: zod_1.z.string().min(1),
    }),
    engagementWithStudents: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    useOfTeachingAids: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    interactionAndQuestionHandling: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    studentDiscipline: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    teachersControlOverClass: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    participationLevelOfStudents: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    completionOfPlannedSyllabus: zod_1.z.object({ rating: zod_1.z.number().min(1).max(5), comment: zod_1.z.string().min(1) }),
    overallComments: zod_1.z.string().min(1),
    strengthsObserved: zod_1.z.string().optional(),
    areasForImprovement: zod_1.z.string().optional(),
    immediateSuggestions: zod_1.z.string().optional(),
});
exports.languageReviewSchema = zod_1.z.object({
    classStartedOnTime: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    classPerformedAsTraining: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    canMaintainDiscipline: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    studentsUnderstandLesson: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    isClassInteractive: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    teacherSignsHomeworkDiary: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    teacherChecksDiary: zod_1.z.object({ answeredYes: zod_1.z.boolean(), comment: zod_1.z.string().min(1) }),
    otherComments: zod_1.z.string().optional(),
});
exports.publishVideoValidation = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().length(24) }),
});
exports.submitReviewValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().length(24, 'Invalid video ID'),
    }),
    body: zod_1.z.union([exports.generalReviewSchema, exports.languageReviewSchema])
});
exports.videoIdParam = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().length(24) }),
});
exports.teacherCommentValidation = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().length(24) }),
    body: zod_1.z.object({ comment: zod_1.z.string().min(1, 'Comment cannot be empty') }),
});
exports.listAssignedValidation = zod_1.z.object({});
