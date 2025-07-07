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
import { TReview } from "@/types/video.types";

const rubric = [
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



export default function TeacherFeedbackDetail() {
  const { videoId: rawVideoId } = useParams();
  // 1️⃣ Normalize videoId into a string | undefined
  const videoId = Array.isArray(rawVideoId) ? rawVideoId[0] : rawVideoId;

  const router = useRouter();
  const qc = useQueryClient();

  const { data: video, isPending, isError } = useGetVideoQuery(videoId);

  const [comment, setComment] = useState(video?.teacherComment?.comment || "");

  useEffect(() => {
    if (video?.teacherComment?.comment) {
      setComment(video.teacherComment.comment);
    }
  }, [video]);

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

  const peerFeedback = video.review as TReview;

  return (
    <div className="px-5">
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Review Feedback</CardTitle>
          <CardDescription>
            Your peer’s feedback & add your response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <iframe
            className="w-full aspect-video"
            src={video.youtubeUrl.replace("youtu.be", "www.youtube.com/embed")}
            allowFullScreen
          />
          <section>
            <h3 className="font-semibold mb-2">Peer Feedback</h3>
            {rubric.map(({ key, label }) => (
              <div key={key} className="mb-4">
                <p>
                  <strong>{label}:</strong> Rating {" "}
                  <span className="font-medium">{peerFeedback[key].rating}</span>
                </p>
                <p className="whitespace-pre-wrap">{peerFeedback[key].comment}</p>
              </div>
            ))}

            <div className="mb-4">
              <h4 className="font-semibold">Overall Comments</h4>
              <p className="whitespace-pre-wrap">{peerFeedback.overallComments}</p>
            </div>
            {peerFeedback.strengthsObserved && (
              <div className="mb-4">
                <h4 className="font-semibold">Strengths Observed</h4>
                <p className="whitespace-pre-wrap">{peerFeedback.strengthsObserved}</p>
              </div>
            )}
            {peerFeedback.areasForImprovement && (
              <div className="mb-4">
                <h4 className="font-semibold">Areas for Improvement</h4>
                <p className="whitespace-pre-wrap">{peerFeedback.areasForImprovement}</p>
              </div>
            )}
            {peerFeedback.immediateSuggestions && (
              <div className="mb-4">
                <h4 className="font-semibold">Immediate Suggestions</h4>
                <p className="whitespace-pre-wrap">{peerFeedback.immediateSuggestions}</p>
              </div>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-2">Your Comment</h3>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
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
