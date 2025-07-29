"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddTeacherCommentMutation,
  useGetVideoQuery,
} from "@/hooks/use-video";
import { TReview, TLanguageReview } from "@/types/video.types";

// general rubric keys
type GeneralCriterionKey =
  | 'subjectKnowledge'
  | 'engagementWithStudents'
  | 'useOfTeachingAids'
  | 'interactionAndQuestionHandling'
  | 'studentDiscipline'
  | 'teachersControlOverClass'
  | 'participationLevelOfStudents'
  | 'completionOfPlannedSyllabus';

const generalRubric: Array<{ key: GeneralCriterionKey; label: string }> = [
  { key: "subjectKnowledge", label: "Subject Knowledge" },
  { key: "engagementWithStudents", label: "Engagement with Students" },
  { key: "useOfTeachingAids", label: "Use of Teaching Aids / Board Work" },
  { key: "interactionAndQuestionHandling", label: "Interaction & Question Handling" },
  { key: "studentDiscipline", label: "Student Discipline" },
  { key: "teachersControlOverClass", label: "Teacher’s Control over the Class" },
  { key: "participationLevelOfStudents", label: "Participation Level of Students" },
  { key: "completionOfPlannedSyllabus", label: "Completion of Planned Syllabus" },
];

// Only those TLanguageReview props which are language criteria
type LanguageCriterionKey =
  | 'classStartedOnTime'
  | 'classPerformedAsTraining'
  | 'canMaintainDiscipline'
  | 'studentsUnderstandLesson'
  | 'isClassInteractive'
  | 'teacherSignsHomeworkDiary'
  | 'teacherChecksDiary';

const languageRubric: Array<{ key: LanguageCriterionKey; label: string }> = [
  { key: "classStartedOnTime", label: "Class Started On Time" },
  { key: "classPerformedAsTraining", label: "Class Performed As Training" },
  { key: "canMaintainDiscipline", label: "Can Maintain Discipline" },
  { key: "studentsUnderstandLesson", label: "Students Understand Lesson" },
  { key: "isClassInteractive", label: "Is Class Interactive" },
  { key: "teacherSignsHomeworkDiary", label: "Teacher Signs Homework Diary" },
  { key: "teacherChecksDiary", label: "Teacher Checks Homework Diary" },
];




export default function TeacherFeedbackDetail() {
  const { videoId: rawVideoId } = useParams();
  const videoId = Array.isArray(rawVideoId) ? rawVideoId[0] : rawVideoId;
  const router = useRouter();
  const qc = useQueryClient();

  const { data: video, isPending, isError } = useGetVideoQuery(videoId!);
 const [comment, setComment] = useState(video?.teacherComment?.comment || "");
  useEffect(() => {
    if (video?.teacherComment?.comment) {
      setComment(video?.teacherComment.comment);
    }
  }, [video?.teacherComment]);

  const addComment = useAddTeacherCommentMutation();
  if (isPending) {
    return (
      <Card className="my-8">
        <CardContent>Loading feedback…</CardContent>
      </Card>
    );
  }

  if (isError || !video) {
    return (
      <Card className="my-8">
        <CardContent>Failed to load feedback.</CardContent>
      </Card>
    );
  }

  // detect language review by presence of languageReview
  const isLanguage = Boolean(video.languageReview);

  // select the correct feedback object
  const generalFeedback = video.review! as TReview;
  const languageFeedback = video.languageReview! as TLanguageReview;
  // const feedback = isLanguage ? languageFeedback! : generalFeedback!;

  // teacher's own comment state
 

  return (
    <div className="px-5">
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Review Feedback</CardTitle>
          <CardDescription>
            Your peer’s feedback & add your response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <iframe
            className="w-full aspect-video"
            src={video.youtubeUrl.replace("youtu.be", "www.youtube.com/embed")}
            allowFullScreen
          />

          {/* Peer feedback section */}
          <section>
            <h3 className="font-semibold mb-2">Peer Feedback</h3>
           {isLanguage
              ? languageRubric.map(({ key, label }) => (
                  <div key={key} className="mb-4">
                    <p>
                      <strong>{label}:</strong> {languageFeedback[key].answeredYes ? "Yes" : "No"}
                    </p>
                    <p className="whitespace-pre-wrap">{languageFeedback[key].comment}</p>
                  </div>
                ))
              : generalRubric.map(({ key, label }) => (
                  <div key={key} className="mb-4">
                    <p>
                      <strong>{label}:</strong>{" "}
                      <span className="font-medium">{generalFeedback[key].rating}</span>
                    </p>
                    <p className="whitespace-pre-wrap">{generalFeedback[key].comment}</p>
                  </div>
                ))}

            {/* optional overall/other comments */}
            {isLanguage ? (
              languageFeedback!.otherComments && (
                <div className="mb-4">
                  <h4 className="font-semibold">Other Comments</h4>
                  <p className="whitespace-pre-wrap">
                    {languageFeedback!.otherComments}
                  </p>
                </div>
              )
            ) : (
              <>
                <div className="mb-4">
                  <h4 className="font-semibold">Overall Comments</h4>
                  <p className="whitespace-pre-wrap">
                    {generalFeedback!.overallComments}
                  </p>
                </div>
                {generalFeedback!.strengthsObserved && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Strengths Observed</h4>
                    <p className="whitespace-pre-wrap">
                      {generalFeedback!.strengthsObserved}
                    </p>
                  </div>
                )}
                {generalFeedback!.areasForImprovement && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Areas for Improvement</h4>
                    <p className="whitespace-pre-wrap">
                      {generalFeedback!.areasForImprovement}
                    </p>
                  </div>
                )}
                {generalFeedback!.immediateSuggestions && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Immediate Suggestions</h4>
                    <p className="whitespace-pre-wrap">
                      {generalFeedback!.immediateSuggestions}
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Teacher response */}
          <section>
            <h3 className="font-semibold mb-2">Your Comment</h3>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
          </section>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            onClick={() =>
              addComment.mutate(
                { id: videoId!, data: { comment } },
                {
                  onSuccess: () => {
                    qc.invalidateQueries({ queryKey: ["video", videoId] });
                    router.back();
                  },
                }
              )
            }
            disabled={addComment.isPending || comment.trim() === ""}
          >
            {addComment.isPending ? "Saving…" : "Save Comment"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
