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
const notifyReviewerAssigned = (reviewer, videoDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, send_mail_1.sendMail)({
        to: reviewer.email,
        subject: 'You have been assigned a video to review',
        text: `You have been assigned to review a video scheduled on ${videoDate.toDateString()}.`,
    });
});
exports.notifyReviewerAssigned = notifyReviewerAssigned;
const notifyReviewSubmitted = (reviewer, videoDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, send_mail_1.sendMail)({
        to: ADMIN_EMAILS,
        subject: 'A new video review has been submitted',
        text: `Reviewer ${reviewer.name} has submitted a review for a class on ${videoDate.toDateString()}.`,
    });
});
exports.notifyReviewSubmitted = notifyReviewSubmitted;
const notifyLanguageReviewSubmitted = (reviewer, videoDate) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, send_mail_1.sendMail)({
        to: ADMIN_EMAILS,
        subject: 'A new language class review has been submitted',
        text: `Language reviewer ${reviewer.name} submitted a review for class on ${videoDate.toDateString()}.`,
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
