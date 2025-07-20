"use strict";
// src/app/modules/video/video.service.ts
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
exports.VideoServices = exports.submitLanguageReview = exports.listMyAssigned = exports.addTeacherComment = exports.listTeacherFeedback = exports.publishReview = exports.submitReview = exports.assignReviewer = exports.getVideoById = exports.listVideos = exports.createVideo = void 0;
const mongoose_1 = require("mongoose");
const video_model_1 = require("./video.model");
const app_error_1 = __importDefault(require("../../../errors/app-error"));
const http_status_1 = __importDefault(require("http-status"));
const pagination_1 = require("../../../utils/pagination");
// helper: convert a VideoDocument to your IVideo API type
const mapVideo = (doc) => {
    var _a;
    let teacherField;
    if (doc.populated('teacher')) {
        // now TypeScript knows we're looking at the full User doc
        const teacherDoc = doc.teacher;
        teacherField = {
            _id: teacherDoc.id,
            name: teacherDoc.name,
            email: teacherDoc.email,
        };
    }
    else {
        teacherField = doc.teacher.toString();
    }
    let assignedReviewerField;
    if (doc.populated('assignedReviewer') && doc.assignedReviewer) {
        const revDoc = doc.assignedReviewer;
        assignedReviewerField = {
            _id: revDoc.id,
            name: revDoc.name,
            email: revDoc.email,
        };
    }
    else {
        // fallback to plain ID string (or undefined)
        assignedReviewerField = (_a = doc.assignedReviewer) === null || _a === void 0 ? void 0 : _a.toString();
    }
    let classField;
    if (doc.populated('class')) {
        const classDoc = doc.class;
        classField = { _id: classDoc.id, name: classDoc.name };
    }
    else {
        classField = doc.class.toString();
    }
    // — section —
    let sectionField;
    if (doc.populated('section')) {
        const sectionDoc = doc.section;
        sectionField = { _id: sectionDoc.id, name: sectionDoc.name };
    }
    else {
        sectionField = doc.section.toString();
    }
    // — subject —
    let subjectField;
    if (doc.populated('subject')) {
        const subjectDoc = doc.subject;
        subjectField = { _id: subjectDoc.id, name: subjectDoc.name };
    }
    else {
        subjectField = doc.subject.toString();
    }
    let reviewField;
    if (doc.review) {
        // reviewer
        let reviewerField;
        if (doc.populated('review.reviewer')) {
            const revDoc = doc.review.reviewer;
            reviewerField = { _id: revDoc.id, name: revDoc.name, email: revDoc.email };
        }
        else {
            reviewerField = doc.review.reviewer.toString();
        }
        reviewField = {
            reviewer: reviewerField,
            subjectKnowledge: doc.review.subjectKnowledge,
            engagementWithStudents: doc.review.engagementWithStudents,
            useOfTeachingAids: doc.review.useOfTeachingAids,
            interactionAndQuestionHandling: doc.review.interactionAndQuestionHandling,
            studentDiscipline: doc.review.studentDiscipline,
            teachersControlOverClass: doc.review.teachersControlOverClass,
            participationLevelOfStudents: doc.review.participationLevelOfStudents,
            completionOfPlannedSyllabus: doc.review.completionOfPlannedSyllabus,
            overallComments: doc.review.overallComments,
            strengthsObserved: doc.review.strengthsObserved,
            areasForImprovement: doc.review.areasForImprovement,
            immediateSuggestions: doc.review.immediateSuggestions,
            reviewedAt: doc.review.reviewedAt,
        };
    }
    // map teacherComment subdocument if present
    let teacherCommentField;
    if (doc.teacherComment) {
        let commenterField;
        if (doc.populated('teacherComment.commenter')) {
            // cast via unknown so TS lets us treat it as a full IUserDocument
            const tcDoc = doc.teacherComment.commenter;
            commenterField = {
                _id: tcDoc.id,
                name: tcDoc.name,
                email: tcDoc.email,
            };
        }
        else {
            commenterField = doc.teacherComment.commenter.toString();
        }
        teacherCommentField = {
            commenter: commenterField,
            comment: doc.teacherComment.comment,
            commentedAt: doc.teacherComment.commentedAt,
        };
    }
    let languageReviewField;
    if (doc.languageReview) {
        const lr = doc.languageReview;
        // if you populated the reviewer
        let reviewerField = typeof lr.reviewer === 'string'
            ? lr.reviewer
            : {
                _id: lr.reviewer.toString(),
                name: lr.reviewer.name,
                email: lr.reviewer.email,
            };
        languageReviewField = {
            reviewer: reviewerField,
            classStartedOnTime: lr.classStartedOnTime,
            classPerformedAsTraining: lr.classPerformedAsTraining,
            canMaintainDiscipline: lr.canMaintainDiscipline,
            studentsUnderstandLesson: lr.studentsUnderstandLesson,
            isClassInteractive: lr.isClassInteractive,
            teacherSignsHomeworkDiary: lr.teacherSignsHomeworkDiary,
            teacherChecksDiary: lr.teacherChecksDiary,
            otherComments: lr.otherComments,
            reviewedAt: lr.reviewedAt,
        };
    }
    return {
        _id: doc.id,
        teacher: teacherField,
        class: classField,
        section: sectionField,
        subject: subjectField,
        date: doc.date,
        youtubeUrl: doc.youtubeUrl,
        uploadedBy: doc.uploadedBy.toString(),
        status: doc.status,
        assignedReviewer: assignedReviewerField || undefined,
        review: reviewField,
        languageReview: languageReviewField,
        teacherComment: teacherCommentField,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
};
// 1️⃣ Create a new Video record
const createVideo = (payload, uploadedBy) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield video_model_1.Video.create({
        teacher: new mongoose_1.Types.ObjectId(payload.teacherId),
        class: new mongoose_1.Types.ObjectId(payload.classId),
        section: new mongoose_1.Types.ObjectId(payload.sectionId),
        subject: new mongoose_1.Types.ObjectId(payload.subjectId),
        date: new Date(payload.date),
        youtubeUrl: payload.videoUrl,
        uploadedBy: new mongoose_1.Types.ObjectId(uploadedBy),
        status: 'unassigned',
    });
    return mapVideo(doc);
});
exports.createVideo = createVideo;
// 2️⃣ List videos with optional filters
const listVideos = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = pagination_1.paginationHelper.calculatePagination(options);
    const query = {};
    if (filters.status)
        query.status = filters.status;
    if (filters.assignedReviewer)
        query.assignedReviewer = filters.assignedReviewer;
    if (filters.classId)
        query.class = filters.classId;
    if (filters.sectionId)
        query.section = filters.sectionId;
    if (filters.subjectId)
        query.subject = filters.subjectId;
    if (filters.teacherId)
        query.teacher = filters.teacherId;
    if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom)
            query.date.$gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            query.date.$lte = new Date(filters.dateTo);
    }
    const [docs, total] = yield Promise.all([
        video_model_1.Video.find(query)
            .populate('teacher')
            .populate('assignedReviewer')
            .populate('class')
            .populate('section')
            .populate('subject')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit),
        video_model_1.Video.countDocuments(query),
    ]);
    const totalPage = Math.ceil(total / limit);
    const data = docs.map(mapVideo);
    return { data, meta: { page, limit, total, totalPage } };
});
exports.listVideos = listVideos;
// 3️⃣ Fetch a single video by ID
const getVideoById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield video_model_1.Video.findById(id)
        .populate('teacher')
        .populate('assignedReviewer')
        .populate('uploadedBy')
        .populate('class')
        .populate('section')
        .populate('subject')
        .populate('review.reviewer')
        .populate('teacherComment.commenter');
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    }
    return mapVideo(doc);
});
exports.getVideoById = getVideoById;
// 4️⃣ Assign or reassign a reviewer
const assignReviewer = (videoId, reviewerId) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield video_model_1.Video.findByIdAndUpdate(videoId, { assignedReviewer: new mongoose_1.Types.ObjectId(reviewerId), status: 'assigned' }, { new: true });
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    }
    return mapVideo(doc);
});
exports.assignReviewer = assignReviewer;
// 5️⃣ Submit review feedback (marks status = reviewed)
const submitReview = (videoId, reviewerId, reviewData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const doc = yield video_model_1.Video.findById(videoId);
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    }
    doc.review = {
        reviewer: new mongoose_1.Types.ObjectId(reviewerId),
        subjectKnowledge: reviewData.subjectKnowledge,
        engagementWithStudents: reviewData.engagementWithStudents,
        useOfTeachingAids: reviewData.useOfTeachingAids,
        interactionAndQuestionHandling: reviewData.interactionAndQuestionHandling,
        studentDiscipline: reviewData.studentDiscipline,
        teachersControlOverClass: reviewData.teachersControlOverClass,
        participationLevelOfStudents: reviewData.participationLevelOfStudents,
        completionOfPlannedSyllabus: reviewData.completionOfPlannedSyllabus,
        overallComments: reviewData.overallComments,
        strengthsObserved: (_a = reviewData.strengthsObserved) !== null && _a !== void 0 ? _a : '',
        areasForImprovement: (_b = reviewData.areasForImprovement) !== null && _b !== void 0 ? _b : '',
        immediateSuggestions: (_c = reviewData.immediateSuggestions) !== null && _c !== void 0 ? _c : '',
        reviewedAt: new Date(),
    };
    doc.status = 'reviewed';
    yield doc.save();
    return mapVideo(doc);
});
exports.submitReview = submitReview;
// 6️⃣ Publish a reviewed video (marks status = published)
const publishReview = (videoId) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield video_model_1.Video.findByIdAndUpdate(videoId, { status: 'published' }, { new: true });
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    }
    return mapVideo(doc);
});
exports.publishReview = publishReview;
// 7️⃣ List all published feedback for a given teacher
const listTeacherFeedback = (teacherId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = pagination_1.paginationHelper.calculatePagination(options);
    const filter = {
        teacher: new mongoose_1.Types.ObjectId(teacherId),
        status: 'published',
    };
    const [docs, total] = yield Promise.all([
        video_model_1.Video.find(filter)
            .populate('teacher')
            .populate('assignedReviewer')
            .populate('uploadedBy')
            .populate('class')
            .populate('section')
            .populate('subject')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit),
        video_model_1.Video.countDocuments(filter),
    ]);
    const totalPage = Math.ceil(total / limit);
    return { data: docs.map(mapVideo), meta: { page, limit, total, totalPage } };
});
exports.listTeacherFeedback = listTeacherFeedback;
// 8️⃣ Add teacher’s own comment to a published review
const addTeacherComment = (videoId, teacherId, comment) => __awaiter(void 0, void 0, void 0, function* () {
    const doc = yield video_model_1.Video.findById(videoId);
    if (!doc) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    }
    if (doc.teacherComment) {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'You have already added a comment to this video');
    }
    if (doc.teacher.toString() !== teacherId) {
        throw new app_error_1.default(http_status_1.default.FORBIDDEN, 'Not authorized to comment on this video');
    }
    if (doc.status !== 'published') {
        throw new app_error_1.default(http_status_1.default.BAD_REQUEST, 'Cannot comment before video is published');
    }
    doc.teacherComment = {
        commenter: new mongoose_1.Types.ObjectId(teacherId),
        comment,
        commentedAt: new Date(),
    };
    yield doc.save();
    return mapVideo(doc);
});
exports.addTeacherComment = addTeacherComment;
const listMyAssigned = (reviewerId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = pagination_1.paginationHelper.calculatePagination(options);
    const filter = {
        assignedReviewer: new mongoose_1.Types.ObjectId(reviewerId),
        status: 'assigned',
    };
    const [docs, total] = yield Promise.all([
        video_model_1.Video.find(filter)
            .populate('teacher')
            .populate('class')
            .populate('section')
            .populate('subject')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(limit),
        video_model_1.Video.countDocuments(filter),
    ]);
    const totalPage = Math.ceil(total / limit);
    return { data: docs.map(mapVideo), meta: { page, limit, total, totalPage } };
});
exports.listMyAssigned = listMyAssigned;
// export const submitLanguageReview = async (
//   videoId:    string,
//   reviewerId: string,
//   reviewData: ILanguageReviewInput
// ): Promise<IVideo> => {
//   const doc = await Video.findById(videoId);
//   if (!doc) throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
//   doc.languageReview = {
//     reviewer:                      new Types.ObjectId(reviewerId),
//     classStartedOnTime:            reviewData.classStartedOnTime,
//     classPerformedAsTraining:      reviewData.classPerformedAsTraining,
//     canMaintainDiscipline:         reviewData.canMaintainDiscipline,
//     studentsUnderstandLesson:      reviewData.studentsUnderstandLesson,
//     isClassInteractive:            reviewData.isClassInteractive,
//     teacherSignsHomeworkDiary:     reviewData.teacherSignsHomeworkDiary,
//     teacherChecksDiary:            reviewData.teacherChecksDiary,
//     otherComments:                 reviewData.otherComments ?? '',
//     reviewedAt:                    new Date(),
//   };
//   doc.status = 'reviewed' as VideoStatus;
//   await doc.save();
//   return mapVideo(doc);
// };
const submitLanguageReview = (videoId, reviewerId, reviewData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const update = yield video_model_1.Video.findByIdAndUpdate(videoId, {
        $set: {
            languageReview: {
                reviewer: new mongoose_1.Types.ObjectId(reviewerId),
                classStartedOnTime: reviewData.classStartedOnTime,
                classPerformedAsTraining: reviewData.classPerformedAsTraining,
                canMaintainDiscipline: reviewData.canMaintainDiscipline,
                studentsUnderstandLesson: reviewData.studentsUnderstandLesson,
                isClassInteractive: reviewData.isClassInteractive,
                teacherSignsHomeworkDiary: reviewData.teacherSignsHomeworkDiary,
                teacherChecksDiary: reviewData.teacherChecksDiary,
                otherComments: (_a = reviewData.otherComments) !== null && _a !== void 0 ? _a : '',
                reviewedAt: new Date(),
            },
            status: 'reviewed',
        },
    }, { new: true, runValidators: true });
    if (!update) {
        throw new app_error_1.default(http_status_1.default.NOT_FOUND, 'Video not found');
    }
    return mapVideo(update);
});
exports.submitLanguageReview = submitLanguageReview;
exports.VideoServices = {
    createVideo: exports.createVideo,
    listVideos: exports.listVideos,
    getVideoById: exports.getVideoById,
    assignReviewer: exports.assignReviewer,
    submitReview: exports.submitReview,
    publishReview: exports.publishReview,
    listTeacherFeedback: exports.listTeacherFeedback,
    addTeacherComment: exports.addTeacherComment,
    listMyAssigned: exports.listMyAssigned,
    submitLanguageReview: exports.submitLanguageReview,
};
