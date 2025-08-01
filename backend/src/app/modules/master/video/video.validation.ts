// src/app/modules/video/video.validation.ts

import { z } from 'zod';

export const createVideoValidation = z.object({
  body: z.object({
    teacherId: z.string().min(1, 'Teacher ID is required'),
    classId:   z.string().min(1, 'Class ID is required'),
    sectionId: z.string().min(1, 'Section ID is required'),
    subjectId: z.string().min(1, 'Subject ID is required'),
    date:      z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
    videoUrl:  z.string().url('Must be a valid URL'),
  }),
});


export const listVideosValidation = z.object({
  query: z.object({
    status:           z.enum(['unassigned','assigned','reviewed','published']).optional(),
    assignedReviewer: z.string().optional(),
    classId:          z.string().optional(),
    sectionId:        z.string().optional(),
    subjectId:        z.string().optional(),
    teacherId:        z.string().optional(),
     dateFrom: z
      .string()
      .optional()
      .refine((val) =>
        // if there's no value, that's fine; otherwise must parse
        !val || !isNaN(Date.parse(val)),
       { message: "Invalid date" }),
    dateTo: z
      .string()
      .optional()
      .refine((val) =>
        !val || !isNaN(Date.parse(val)),
       { message: "Invalid date" }),
  }),
});

export const assignReviewerValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
  body:   z.object({ reviewerId: z.string().min(1, 'Reviewer ID is required') }),
});

export const generalReviewSchema = z.object({
  subjectKnowledge:           z.object({
    rating:  z.number().min(1).max(5),
    comment: z.string().min(1),
  }),
  engagementWithStudents:     z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  useOfTeachingAids:          z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  interactionAndQuestionHandling: z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  studentDiscipline:          z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  teachersControlOverClass:   z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  participationLevelOfStudents: z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  completionOfPlannedSyllabus:  z.object({ rating: z.number().min(1).max(5), comment: z.string().min(1) }),
  overallComments:            z.string().min(1),
  strengthsObserved:          z.string().optional(),
  areasForImprovement:        z.string().optional(),
  immediateSuggestions:       z.string().optional(),
});


export const languageReviewSchema = z.object({
  classStartedOnTime:        z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  classPerformedAsTraining:  z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  canMaintainDiscipline:     z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  studentsUnderstandLesson:  z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  isClassInteractive:        z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  teacherSignsHomeworkDiary: z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  teacherChecksDiary:        z.object({ answeredYes: z.boolean(), comment: z.string().min(1) }),
  otherComments:             z.string().optional(),
});

export const publishVideoValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
});




export const submitReviewValidation = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid video ID'),
  }),
  body: z.union([generalReviewSchema, languageReviewSchema])
});



export const videoIdParam = z.object({
  params: z.object({ id: z.string().length(24) }),
});


export const teacherCommentValidation = z.object({
  params: z.object({ id: z.string().length(24) }),
  body:   z.object({ comment: z.string().min(1, 'Comment cannot be empty') }),
});

export const listAssignedValidation = z.object({});

