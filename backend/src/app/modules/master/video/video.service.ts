// src/app/modules/video/video.service.ts

import { Types } from 'mongoose';
import { Video, IVideoDocument } from './video.model';
import { IReviewInput, ITeacherInfo, IVideo, VideoStatus } from './video.type';
import AppError from '../../../errors/app-error';
import httpStatus from 'http-status';
import { IUserDocument } from '../../user/user.model';
import { IClassDocument } from '../class/class.model';
import { ISectionDocument } from '../section/section.model';
import { ISubjectDocument } from '../subject/subject.model';

// helper: convert a VideoDocument to your IVideo API type
const mapVideo = (doc: IVideoDocument): IVideo => {
  let teacherField: string | ITeacherInfo;

  if (doc.populated('teacher')) {
    // now TypeScript knows we're looking at the full User doc
    const teacherDoc = doc.teacher as unknown as IUserDocument;

    teacherField = {
      _id: teacherDoc.id,
      name: teacherDoc.name,
      email: teacherDoc.email,
    };
  } else {
    teacherField = doc.teacher.toString();
  }

  let assignedReviewerField: string | ITeacherInfo | undefined;
  if (doc.populated('assignedReviewer') && doc.assignedReviewer) {
    const revDoc = doc.assignedReviewer as unknown as IUserDocument;
    assignedReviewerField = {
      _id: revDoc.id,
      name: revDoc.name,
      email: revDoc.email,
    };
  } else {
    // fallback to plain ID string (or undefined)
    assignedReviewerField = doc.assignedReviewer?.toString();
  }

  let classField: string | { _id: string; name: string };
  if (doc.populated('class')) {
    const classDoc = doc.class as unknown as IClassDocument;
    classField = { _id: classDoc.id, name: classDoc.name };
  } else {
    classField = doc.class.toString();
  }

  // — section —
  let sectionField: string | { _id: string; name: string };
  if (doc.populated('section')) {
    const sectionDoc = doc.section as unknown as ISectionDocument;
    sectionField = { _id: sectionDoc.id, name: sectionDoc.name };
  } else {
    sectionField = doc.section.toString();
  }

  // — subject —
  let subjectField: string | { _id: string; name: string };
  if (doc.populated('subject')) {
    const subjectDoc = doc.subject as unknown as ISubjectDocument;
    subjectField = { _id: subjectDoc.id, name: subjectDoc.name };
  } else {
    subjectField = doc.subject.toString();
  }

  let reviewField;
  if (doc.review) {
    // reviewer
    let reviewerField: string | ITeacherInfo;
    if (doc.populated('review.reviewer')) {
      const revDoc = doc.review.reviewer as unknown as { id: string; name: string; email: string };
      reviewerField = { _id: revDoc.id, name: revDoc.name, email: revDoc.email };
    } else {
      reviewerField = doc.review.reviewer.toString();
    }

    reviewField = {
      reviewer:                      reviewerField,
      subjectKnowledge:              doc.review.subjectKnowledge,
      engagementWithStudents:        doc.review.engagementWithStudents,
      useOfTeachingAids:             doc.review.useOfTeachingAids,
      interactionAndQuestionHandling:doc.review.interactionAndQuestionHandling,
      studentDiscipline:             doc.review.studentDiscipline,
      teachersControlOverClass:      doc.review.teachersControlOverClass,
      participationLevelOfStudents:  doc.review.participationLevelOfStudents,
      completionOfPlannedSyllabus:   doc.review.completionOfPlannedSyllabus,
      overallComments:               doc.review.overallComments,
      strengthsObserved:             doc.review.strengthsObserved,
      areasForImprovement:           doc.review.areasForImprovement,
      immediateSuggestions:          doc.review.immediateSuggestions,
      reviewedAt:                    doc.review.reviewedAt,
    };
  }

  // map teacherComment subdocument if present
  let teacherCommentField;
if (doc.teacherComment) {
  let commenterField: string | ITeacherInfo;

  if (doc.populated('teacherComment.commenter')) {
    // cast via unknown so TS lets us treat it as a full IUserDocument
    const tcDoc = (doc.teacherComment.commenter as unknown) as IUserDocument;
    commenterField = {
      _id: tcDoc.id,
      name: tcDoc.name,
      email: tcDoc.email,
    };
  } else {
    commenterField = doc.teacherComment.commenter.toString();
  }

  teacherCommentField = {
    commenter: commenterField,
    comment:    doc.teacherComment.comment,
    commentedAt: doc.teacherComment.commentedAt,
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
  teacherComment:  teacherCommentField,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// 1️⃣ Create a new Video record
export const createVideo = async (
  payload: {
    teacherId: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    date: string;
    videoUrl: string;
  },
  uploadedBy: string,
): Promise<IVideo> => {
  const doc = await Video.create({
    teacher: new Types.ObjectId(payload.teacherId),
    class: new Types.ObjectId(payload.classId),
    section: new Types.ObjectId(payload.sectionId),
    subject: new Types.ObjectId(payload.subjectId),
    date: new Date(payload.date),
    youtubeUrl: payload.videoUrl,
    uploadedBy: new Types.ObjectId(uploadedBy),
    status: 'unassigned' as VideoStatus,
  });

  return mapVideo(doc);
};

// 2️⃣ List videos with optional filters
export const listVideos = async (filters: {
  status?: VideoStatus;
  assignedReviewer?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<IVideo[]> => {
  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.assignedReviewer) query.assignedReviewer = filters.assignedReviewer;
  if (filters.classId) query.class = filters.classId;
  if (filters.sectionId) query.section = filters.sectionId;
  if (filters.subjectId) query.subject = filters.subjectId;
  if (filters.teacherId) query.teacher = filters.teacherId;
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.date.$lte = new Date(filters.dateTo);
  }

  const docs = await Video.find(query)
    .populate('teacher')
    .populate('assignedReviewer')
    .populate('class')
    .populate('section')
    .populate('subject')
    .sort('-createdAt');

  return docs.map(mapVideo);
};

// 3️⃣ Fetch a single video by ID
export const getVideoById = async (id: string): Promise<IVideo> => {
  const doc = await Video.findById(id)
    .populate('teacher')
    .populate('assignedReviewer')
    .populate('uploadedBy')
    .populate('class')
    .populate('section')
     .populate('subject')
  .populate('review.reviewer')
  .populate('teacherComment.commenter');

  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  return mapVideo(doc);
};

// 4️⃣ Assign or reassign a reviewer
export const assignReviewer = async (videoId: string, reviewerId: string): Promise<IVideo> => {
  const doc = await Video.findByIdAndUpdate(
    videoId,
    { assignedReviewer: new Types.ObjectId(reviewerId), status: 'assigned' as VideoStatus },
    { new: true },
  );
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  return mapVideo(doc);
};

// 5️⃣ Submit review feedback (marks status = reviewed)
export const submitReview = async (
videoId:    string,
  reviewerId: string,
  reviewData: IReviewInput
): Promise<IVideo> => {
  const doc = await Video.findById(videoId);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }

  doc.review = {
    reviewer:                         new Types.ObjectId(reviewerId),
    subjectKnowledge:                 reviewData.subjectKnowledge,
    engagementWithStudents:           reviewData.engagementWithStudents,
    useOfTeachingAids:                reviewData.useOfTeachingAids,
    interactionAndQuestionHandling:   reviewData.interactionAndQuestionHandling,
    studentDiscipline:                reviewData.studentDiscipline,
    teachersControlOverClass:         reviewData.teachersControlOverClass,
    participationLevelOfStudents:     reviewData.participationLevelOfStudents,
    completionOfPlannedSyllabus:      reviewData.completionOfPlannedSyllabus,
    overallComments:                  reviewData.overallComments,
    strengthsObserved:                reviewData.strengthsObserved ?? '',
    areasForImprovement:              reviewData.areasForImprovement ?? '',
    immediateSuggestions:             reviewData.immediateSuggestions ?? '',
    reviewedAt:                       new Date(),
  };
  doc.status = 'reviewed' as VideoStatus;

  await doc.save();
  return mapVideo(doc);
};
// 6️⃣ Publish a reviewed video (marks status = published)
export const publishReview = async (videoId: string): Promise<IVideo> => {
  const doc = await Video.findByIdAndUpdate(
    videoId,
    { status: 'published' as VideoStatus },
    { new: true },
  );
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
  return mapVideo(doc);
};

// 7️⃣ List all published feedback for a given teacher
export const listTeacherFeedback = async (teacherId: string): Promise<IVideo[]> => {


  const docs = await Video.find({
    teacher: new Types.ObjectId(teacherId),
    status: 'published',
  })
   .populate('teacher')
    .populate('assignedReviewer')
    .populate('uploadedBy')
    .populate('class')
    .populate('section')
    .populate('subject')
  .sort('date');
  return docs.map(mapVideo);
};

// 8️⃣ Add teacher’s own comment to a published review
export const addTeacherComment = async (
  videoId: string,
  teacherId: string,
  comment: string,
): Promise<IVideo> => {
  const doc = await Video.findById(videoId);
  if (!doc) {
    throw new AppError(httpStatus.NOT_FOUND, 'Video not found');
  }
 
    if (doc.teacherComment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already added a comment to this video'
    );
  }
  
  if (doc.teacher.toString() !== teacherId) {
    throw new AppError(httpStatus.FORBIDDEN, 'Not authorized to comment on this video');
  }
  if (doc.status !== 'published') {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot comment before video is published');
  }

  doc.teacherComment = {
    commenter: new Types.ObjectId(teacherId),
    comment,
    commentedAt: new Date(),
  };
  await doc.save();

  return mapVideo(doc);
};

export const listMyAssigned = async (
  reviewerId: string
): Promise<IVideo[]> => {
  const docs = await Video.find({
    assignedReviewer: new Types.ObjectId(reviewerId),
    status: 'assigned',
  })
    .populate('teacher')
    .populate('class')
    .populate('section')
    .populate('subject')
    .sort('date');

  return docs.map(mapVideo);
};


export const VideoServices = {
  createVideo,
  listVideos,
  getVideoById,
  assignReviewer,
  submitReview,
  publishReview,
  listTeacherFeedback,
  addTeacherComment,
  listMyAssigned
};
