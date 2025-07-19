"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetVideoQuery } from "@/hooks/use-video";
import { TLanguageReview, TReview, TTeacherID } from "@/types/video.types";

const generalRubric = [
  { key: "subjectKnowledge", label: "Subject Knowledge" },
  { key: "engagementWithStudents", label: "Engagement with Students" },
  { key: "useOfTeachingAids", label: "Use of Teaching Aids / Board Work" },
  {
    key: "interactionAndQuestionHandling",
    label: "Interaction & Question Handling",
  },
  { key: "studentDiscipline", label: "Student Discipline" },
  {
    key: "teachersControlOverClass",
    label: "Teacher’s Control over the Class",
  },
  {
    key: "participationLevelOfStudents",
    label: "Participation Level of Students",
  },
  {
    key: "completionOfPlannedSyllabus",
    label: "Completion of Planned Syllabus",
  },
] as const;

const languageRubric = [
  { key: "classStartedOnTime", label: "Class Started On Time" },
  { key: "classPerformedAsTraining", label: "Class Performed As Training" },
  { key: "canMaintainDiscipline", label: "Can Maintain Discipline" },
  { key: "studentsUnderstandLesson", label: "Students Understand Lesson" },
  { key: "isClassInteractive", label: "Is Class Interactive" },
  { key: "teacherSignsHomeworkDiary", label: "Teacher Signs Homework Diary" },
  { key: "teacherChecksDiary", label: "Teacher Checks Diary" },
] as const;

export default function VideoDetailPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params.videoId;
  const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  // now videoId is `string | undefined`, matching your hook signature
  const { data: video, isLoading } = useGetVideoQuery(videoId);

  if (isLoading) return <div>Loading…</div>;
  if (!videoId) return <div className="text-center py-8">Invalid ID.</div>;
  if (!video) return <div className="text-center py-8">Video not found.</div>;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Video Detail</CardTitle>
        <CardDescription>
          View metadata, embedded video, and status.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Embedded YouTube video */}
        <iframe
          className="w-full aspect-video"
          src={video.youtubeUrl.replace("youtu.be", "www.youtube.com/embed")}
          allowFullScreen
        />

        {/* Common metadata */}
        <div>
          <strong>Class:</strong> {video.class.name}
        </div>
        <div>
          <strong>Teacher:</strong> {video.teacher.name}
        </div>
        <div>
          <strong>Date:</strong> {new Date(video.date).toLocaleDateString()}
        </div>
        <div>
          <strong>Status:</strong> {video.status}
        </div>

        {/* General review for non-language subjects */}
        {video.review && (
          <section className="space-y-4">
            <h3 className="font-semibold">Reviewer Feedback</h3>
            {generalRubric.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <p>
                  <strong>{label}:</strong> Rating&nbsp;
                  <span className="font-medium">
                    {(video.review as TReview)[key].rating}
                  </span>
                </p>
                <p className="whitespace-pre-wrap">
                  {(video.review as TReview)[key].comment}
                </p>
              </div>
            ))}

            <div className="space-y-1">
              <h4 className="font-semibold">Overall Comments</h4>
              <p className="whitespace-pre-wrap">
                {(video.review as TReview).overallComments}
              </p>
            </div>
            {(video.review as TReview).strengthsObserved && (
              <div className="space-y-1">
                <h4 className="font-semibold">Strengths Observed</h4>
                <p className="whitespace-pre-wrap">
                  {(video.review as TReview).strengthsObserved}
                </p>
              </div>
            )}
            {(video.review as TReview).areasForImprovement && (
              <div className="space-y-1">
                <h4 className="font-semibold">Areas for Improvement</h4>
                <p className="whitespace-pre-wrap">
                  {(video.review as TReview).areasForImprovement}
                </p>
              </div>
            )}
            {(video.review as TReview).immediateSuggestions && (
              <div className="space-y-1">
                <h4 className="font-semibold">Immediate Suggestions</h4>
                <p className="whitespace-pre-wrap">
                  {(video.review as TReview).immediateSuggestions}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Language-class review for Quran/Arabic */}
        {video.languageReview && (
          <section className="space-y-4">
            <h3 className="font-semibold">Language-Class Feedback</h3>
            {languageRubric.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <p>
                  <strong>{label}:</strong>{" "}
                  {(video.languageReview as TLanguageReview)[key].answeredYes
                    ? "Yes"
                    : "No"}
                </p>
                <p className="whitespace-pre-wrap">
                  {(video.languageReview as TLanguageReview)[key].comment}
                </p>
              </div>
            ))}

            {(video.languageReview as TLanguageReview).otherComments && (
              <div className="space-y-1">
                <h4 className="font-semibold">Other Comments</h4>
                <p className="whitespace-pre-wrap">
                  {(video.languageReview as TLanguageReview).otherComments}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Teacher’s own comment */}
        {video.teacherComment && (
          <section className="space-y-2">
            <h3 className="font-semibold">Teacher Comment</h3>
            <p>
              <strong>By:</strong>{" "}
              {typeof video.teacherComment.commenter === "string"
                ? video.teacherComment.commenter
                : (video.teacherComment.commenter as TTeacherID).name}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(video.teacherComment.commentedAt).toLocaleDateString()}
            </p>
            <p className="whitespace-pre-wrap">
              {video.teacherComment.comment}
            </p>
          </section>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="default" onClick={() => router.back()}>
          Back
        </Button>
      </CardFooter>
    </Card>
  );
}
