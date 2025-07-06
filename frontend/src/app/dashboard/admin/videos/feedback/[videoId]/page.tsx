"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddTeacherCommentMutation, useGetVideoQuery } from "@/hooks/use-video";

export default function TeacherFeedbackDetail() {
    const { videoId: rawVideoId } = useParams();
  // 1️⃣ Normalize videoId into a string | undefined
  const videoId = Array.isArray(rawVideoId) ? rawVideoId[0] : rawVideoId

   const router = useRouter();
  const qc = useQueryClient();

  
  const { data: video, isPending, isError } = useGetVideoQuery(videoId);

 
  const [comment, setComment] = useState(video?.teacherComment?.comment||"");
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
  return (
   <div className="px-5">
     <Card className="my-8">
      <CardHeader>
        <CardTitle>Review Feedback</CardTitle>
        <CardDescription>Your peer’s feedback & add your response</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <iframe
          className="w-full aspect-video"
          src={video.youtubeUrl.replace("youtu.be","www.youtube.com/embed")}
          allowFullScreen
        />
        <h3 className="font-semibold">Peer Feedback</h3>
        <p className="whitespace-pre-wrap" ><strong>Class Mgmt:</strong> {video.review?.classManagement}</p>
        <p className="whitespace-pre-wrap"><strong>Subject Knowledge:</strong> {video.review?.subjectKnowledge}</p>
        <p className="whitespace-pre-wrap"><strong>Other:</strong> {video.review?.otherComments}</p>

        <h3 className="font-semibold">Your Comment</h3>
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} />
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
        >
          {addComment.isPending ? "Saving…" : "Save Comment"}
        </Button>
          <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
      </CardContent>
    </Card>
   </div>
  );
}
