// src/app/utils/video-mailer.ts

import { sendMail } from './send-mail';
import { IUserDocument } from '../modules/user/user.model';

const ADMIN_EMAILS = ['enayetflweb@gmail.com', 'armustak@gmail.com'];

export const notifyReviewerAssigned = async (reviewer: IUserDocument, videoDate: Date) => {
  await sendMail({
    to: reviewer.email,
    subject: 'You have been assigned a video to review',
    text: `You have been assigned to review a video scheduled on ${videoDate.toDateString()}.`,
  });
};

export const notifyReviewSubmitted = async (reviewer: IUserDocument, videoDate: Date) => {
  await sendMail({
    to: ADMIN_EMAILS,
    subject: 'A new video review has been submitted',
    text: `Reviewer ${reviewer.name} has submitted a review for a class on ${videoDate.toDateString()}.`,
  });
};

export const notifyLanguageReviewSubmitted = async (reviewer: IUserDocument, videoDate: Date) => {
  await sendMail({
    to: ADMIN_EMAILS,
    subject: 'A new language class review has been submitted',
    text: `Language reviewer ${reviewer.name} submitted a review for class on ${videoDate.toDateString()}.`,
  });
};

export const notifyTeacherVideoPublished = async (teacher: IUserDocument, videoDate: Date) => {
  await sendMail({
    to: teacher.email,
    subject: 'Your class video has been reviewed and published',
    text: `Your video dated ${videoDate.toDateString()} has been reviewed and published.`,
  });
};

export const notifyTeacherCommentAdded = async (teacher: IUserDocument, videoDate: Date) => {
  await sendMail({
    to: ADMIN_EMAILS,
    subject: 'Teacher has added a comment on a published review',
    text: `Teacher ${teacher.name} added a comment on video dated ${videoDate.toDateString()}.`,
  });
};
