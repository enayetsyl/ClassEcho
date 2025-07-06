"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {  useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // assume you have this or use Input
import { useGetVideoQuery, useSubmitReviewMutation } from "@/hooks/use-video";

export default function ReviewPage() {
   const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();

   const rawId = params.videoId;
     const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data: video } = useGetVideoQuery(videoId!);

  const { mutate: submitReview, isPending } = useSubmitReviewMutation();

  const [classMg, setClassMg] = useState("");
  const [subKnow, setSubKnow] = useState("");
  const [other, setOther] = useState("");

const handleSubmit = () => {
    submitReview(
      {
        id: videoId!,
        data: {
          classManagement: classMg,
          subjectKnowledge: subKnow,
          otherComments: other,
        },
      },
      {
        onSuccess: () => {
          // ─── 2. Invalidate using the object form ───────────────────────────────
          qc.invalidateQueries({ queryKey: ["pendingReviews"] });
          router.push("/dashboard/admin/videos/reviewer");
        },
      }
    );
  };


  return (
   <div className="px-5">
     <Card className="my-8">
      <CardHeader>
        <CardTitle>Review Class Recording</CardTitle>
        <CardDescription>Provide feedback in three areas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <iframe
          className="w-full aspect-video"
          src={video?.youtubeUrl.replace("youtu.be","www.youtube.com/embed")}
          allowFullScreen
        />
        <div>
          <label className="block font-semibold">Class Management</label>
          <Textarea value={classMg} onChange={e=>setClassMg(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Subject Knowledge</label>
          <Textarea value={subKnow} onChange={e=>setSubKnow(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold">Other Comments</label>
          <Textarea value={other} onChange={e=>setOther(e.target.value)} />
        </div>
       <Button 
       variant="default"
       onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Submitting…" : "Submit Feedback"}
        </Button>
      </CardContent>
    </Card>
   </div>
  );
}
