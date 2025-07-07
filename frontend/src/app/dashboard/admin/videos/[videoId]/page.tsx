"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetVideoQuery } from "@/hooks/use-video";
import { TReview } from "@/types/video.types";

const rubric = [
  { key: "subjectKnowledge", label: "Subject Knowledge" },
  { key: "engagementWithStudents", label: "Engagement with Students" },
  { key: "useOfTeachingAids", label: "Use of Teaching Aids / Board Work" },
  { key: "interactionAndQuestionHandling", label: "Interaction & Question Handling" },
  { key: "studentDiscipline", label: "Student Discipline" },
  { key: "teachersControlOverClass", label: "Teacher’s Control over the Class" },
  { key: "participationLevelOfStudents", label: "Participation Level of Students" },
  { key: "completionOfPlannedSyllabus", label: "Completion of Planned Syllabus" },
] as const;


export default function VideoDetailPage() {
const router = useRouter();
  const params = useParams();

  const rawId = params.videoId;
  const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  // now videoId is `string | undefined`, matching your hook signature
  const { data: video, isLoading } = useGetVideoQuery(videoId);


  if (isLoading) return <div>Loading…</div>;
  if (!videoId)  return <div className="text-center py-8">Invalid ID.</div>;
  if (!video)    return <div className="text-center py-8">Video not found.</div>;

  const peer: TReview | undefined = video.review;

  return (
    <Card className="my-8">
      <CardHeader>
        <CardTitle>Video Detail</CardTitle>
        <CardDescription>View metadata, embedded video, and status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <iframe
          className="w-full aspect-video"
          src={video.youtubeUrl.replace("youtu.be","www.youtube.com/embed")}
          allowFullScreen
        />
       <div><strong>Class:</strong> {video.class.name}</div>
        <div><strong>Teacher:</strong> {video.teacher.name}</div>
        <div><strong>Date:</strong> {new Date(video.date).toLocaleDateString()}</div>
        <div><strong>Status:</strong> {video.status}</div>

        {peer && (
          <section className="space-y-4">
            <h3 className="font-semibold">Reviewer Feedback</h3>

            {rubric.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <p>
                  <strong>{label}:</strong> Rating&nbsp;
                  <span className="font-medium">{peer[key].rating}</span>
                </p>
                <p className="whitespace-pre-wrap">{peer[key].comment}</p>
              </div>
            ))}

            <div className="space-y-1">
              <h4 className="font-semibold">Overall Comments</h4>
              <p className="whitespace-pre-wrap">{peer.overallComments}</p>
            </div>
            {peer.strengthsObserved && (
              <div className="space-y-1">
                <h4 className="font-semibold">Strengths Observed</h4>
                <p className="whitespace-pre-wrap">{peer.strengthsObserved}</p>
              </div>
            )}
            {peer.areasForImprovement && (
              <div className="space-y-1">
                <h4 className="font-semibold">Areas for Improvement</h4>
                <p className="whitespace-pre-wrap">{peer.areasForImprovement}</p>
              </div>
            )}
            {peer.immediateSuggestions && (
              <div className="space-y-1">
                <h4 className="font-semibold">Immediate Suggestions</h4>
                <p className="whitespace-pre-wrap">{peer.immediateSuggestions}</p>
              </div>
            )}
          </section>
        )}

        {video.teacherComment && (
          <section className="space-y-2">
            <h3 className="font-semibold">Teacher Comment</h3>
            <p className="whitespace-pre-wrap">{video.teacherComment.comment}</p>
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
