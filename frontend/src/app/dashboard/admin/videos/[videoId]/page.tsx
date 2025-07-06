"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetVideoQuery } from "@/hooks/use-video";

export default function VideoDetailPage() {
const router = useRouter();
  const params = useParams();

  // normalize ParamValue (string | string[] | undefined) → string | undefined
  const rawId = params.videoId;
  const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  // now videoId is `string | undefined`, matching your hook signature
  const { data: video, isLoading } = useGetVideoQuery(videoId);


  if (isLoading) return <div>Loading…</div>;
  if (!videoId)  return <div className="text-center py-8">Invalid ID.</div>;
  if (!video)    return <div className="text-center py-8">Video not found.</div>;

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
        {video.review && (
          <>
            <h3 className="font-semibold">Reviewer Feedback:</h3>
            <p><strong>Class Mgmt:</strong> {video.review.classManagement}</p>
            <p><strong>Subject Knowledge:</strong> {video.review.subjectKnowledge}</p>
            <p><strong>Other:</strong> {video.review.otherComments}</p>
          </>
        )}
        {video.teacherComment && (
          <>
            <h3 className="font-semibold">Teacher Comment:</h3>
            <p>{video.teacherComment.comment}</p>
          </>
        )}
        <Button onClick={() => router.back()}>Back</Button>
      </CardContent>
    </Card>
  );
}
