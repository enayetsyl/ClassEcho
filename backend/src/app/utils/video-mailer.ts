// src/app/utils/video-mailer.ts

import { sendMail } from './send-mail';
import { IUserDocument } from '../modules/user/user.model';

const ADMIN_EMAILS = ['enayetflweb@gmail.com', 'armustak@gmail.com'];

export const notifyReviewerAssigned = async ({
  reviewer,
  videoDate,
  className,
  sectionName,
  subjectName,
  teacherName,
}: {
  reviewer: IUserDocument;
  videoDate: Date;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
}) => {
  const dateStr = videoDate.toDateString();

  await sendMail({
    to: reviewer.email,
    subject: 'You have been assigned a video to review',
    text:
`You have been assigned to review a video.

Details:
- Date: ${dateStr}
- Class: ${className}
- Section: ${sectionName}
- Subject: ${subjectName}
- Teacher: ${teacherName}

Please log in to the dashboard to proceed.`,
  });
};

export const notifyReviewSubmitted = async (params: {
 
  reviewerName: string;
  videoDate: Date;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
}) => {
  const {
    
    reviewerName,
    videoDate,
    className,
    sectionName,
    subjectName,
    teacherName,
  } = params;

  const dateStr = videoDate.toDateString();

  await sendMail({
    to: ADMIN_EMAILS,
    subject: 'A new video review has been submitted',
    text:
`A new classroom video review has been submitted.

Details:
- Reviewer: ${reviewerName}
- Date: ${dateStr}
- Class: ${className}
- Section: ${sectionName}
- Subject: ${subjectName}
- Teacher: ${teacherName}

Please log in to the dashboard to view the full review.`,
  });
};

export const notifyLanguageReviewSubmitted = async (params: {
  
  reviewerName: string;
  videoDate: Date;
  className: string;
  sectionName: string;
  subjectName: string;
  teacherName: string;
}) => {
  const {
    
    reviewerName,
    videoDate,
    className,
    sectionName,
    subjectName,
    teacherName,
  } = params;

  const dateStr = videoDate.toDateString();

  await sendMail({
    to: ADMIN_EMAILS,
    subject: 'A new language review has been submitted',
    text:
`A new language-focused classroom review has been submitted.

Details:
- Reviewer: ${reviewerName}
- Date: ${dateStr}
- Class: ${className}
- Section: ${sectionName}
- Subject: ${subjectName}
- Teacher: ${teacherName}

Please log in to the dashboard to view the full review.`,
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
