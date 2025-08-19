"use strict";
// src/app/utils/video-mailer.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyTeacherCommentAdded = exports.notifyTeacherVideoPublished = exports.notifyLanguageReviewSubmitted = exports.notifyReviewSubmitted = exports.notifyReviewerAssigned = void 0;
const send_mail_1 = require("./send-mail");
const ADMIN_EMAILS = ['enayetflweb@gmail.com', 'armustak@gmail.com'];
const notifyReviewerAssigned = (_a) => __awaiter(void 0, [_a], void 0, function* ({ reviewer, videoDate, className, sectionName, subjectName, teacherName, }) {
    const dateStr = videoDate.toDateString();
    yield (0, send_mail_1.sendMail)({
        to: reviewer.email,
        subject: 'You have been assigned a video to review',
        text: `You have been assigned to review a video.

Details:
- Date: ${dateStr}
- Class: ${className}
- Section: ${sectionName}
- Subject: ${subjectName}
- Teacher: ${teacherName}

Please log in to the dashboard to proceed.`,
    });
});
exports.notifyReviewerAssigned = notifyReviewerAssigned;
const notifyReviewSubmitted = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewerName, videoDate, className, sectionName, subjectName, teacherName, } = params;
    const dateStr = videoDate.toDateString();
    yield (0, send_mail_1.sendMail)({
        to: ADMIN_EMAILS,
        subject: 'A new video review has been submitted',
        text: `A new classroom video review has been submitted.

Details:
- Reviewer: ${reviewerName}
- Date: ${dateStr}
- Class: ${className}
- Section: ${sectionName}
- Subject: ${subjectName}
- Teacher: ${teacherName}

Please log in to the dashboard to view the full review.`,
    });
});
exports.notifyReviewSubmitted = notifyReviewSubmitted;
const notifyLanguageReviewSubmitted = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewerName, videoDate, className, sectionName, subjectName, teacherName, } = params;
    const dateStr = videoDate.toDateString();
    yield (0, send_mail_1.sendMail)({
        to: ADMIN_EMAILS,
        subject: 'A new language review has been submitted',
        text: `A new language-focused classroom review has been submitted.

Details:
- Reviewer: ${reviewerName}
- Date: ${dateStr}
- Class: ${className}
- Section: ${sectionName}
- Subject: ${subjectName}
- Teacher: ${teacherName}

Please log in to the dashboard to view the full review.`,
    });
});
exports.notifyLanguageReviewSubmitted = notifyLanguageReviewSubmitted;
const notifyTeacherVideoPublished = (teacher, videoDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, send_mail_1.sendMail)({
        to: teacher.email,
        subject: 'Your class video has been reviewed and published',
        text: `Your video dated ${videoDate.toDateString()} has been reviewed and published.`,
    });
});
exports.notifyTeacherVideoPublished = notifyTeacherVideoPublished;
const notifyTeacherCommentAdded = (teacher, videoDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, send_mail_1.sendMail)({
        to: ADMIN_EMAILS,
        subject: 'Teacher has added a comment on a published review',
        text: `Teacher ${teacher.name} added a comment on video dated ${videoDate.toDateString()}.`,
    });
});
exports.notifyTeacherCommentAdded = notifyTeacherCommentAdded;
