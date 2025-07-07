"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {  useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // assume you have this or use Input
import { useGetVideoQuery, useSubmitReviewMutation } from "@/hooks/use-video";
import { TSubmitReviewPayload } from "@/types/video.types";
import { Slider } from "@/components/ui/slider";
import { SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";

const criteria = [
  { key: "subjectKnowledge",        label: "Subject Knowledge" },
  { key: "engagementWithStudents",  label: "Engagement with Students" },
  { key: "useOfTeachingAids",       label: "Use of Teaching Aids / Board Work" },
  { key: "interactionAndQuestionHandling", label: "Interaction & Question Handling" },
  { key: "studentDiscipline",       label: "Student Discipline" },
  { key: "teachersControlOverClass",label: "Teacher's Control over the Class" },
  { key: "participationLevelOfStudents", label: "Participation Level of Students" },
  { key: "completionOfPlannedSyllabus",  label: "Completion of Planned Syllabus" },
] as const;

type CriterionKey = typeof criteria[number]["key"];

export default function ReviewPage() {
   const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();

   const rawId = params.videoId;
     const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data: video } = useGetVideoQuery(videoId!);

  const { mutate: submitReview, isPending } = useSubmitReviewMutation();

  const [form, setForm] = useState<TSubmitReviewPayload>(() => ({
    subjectKnowledge:             { rating: 3, comment: "" },
    engagementWithStudents:       { rating: 3, comment: "" },
    useOfTeachingAids:            { rating: 3, comment: "" },
    interactionAndQuestionHandling:{ rating: 3, comment: "" },
    studentDiscipline:            { rating: 3, comment: "" },
    teachersControlOverClass:     { rating: 3, comment: "" },
    participationLevelOfStudents: { rating: 3, comment: "" },
    completionOfPlannedSyllabus:  { rating: 3, comment: "" },
    overallComments:              "",
    strengthsObserved:            "",
    areasForImprovement:          "",
    immediateSuggestions:         "",
  }));


   const updateCriterion = (k: CriterionKey, field: "rating" | "comment", v: string | number) =>
    setForm(f => ({
      ...f,
      [k]: {
        ...f[k],
        [field]: v,
      }
    }));

    const handleSubmit = () => {
    submitReview(
      {
        id: videoId!,
        data: form,
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
        {criteria.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="block font-semibold">{label} – Rating (1–5)</label>
           <div className="flex items-center space-x-4">
                <Slider
                  className="flex-1 bg-amber-300 rounded-md max-w-sm"
                  value={[form[key].rating]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(val) =>
                    updateCriterion(key, "rating", val[0])
                  }
                >
                  <SliderTrack>
                    <SliderRange />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <span className="w-6 text-center">{form[key].rating}</span>
              </div>


              <label className="block font-semibold">{label} – Comments</label>
              <Textarea
                value={form[key].comment}
                onChange={e => updateCriterion(key, "comment", e.target.value)}
              />
            </div>
          ))}

          <div className="space-y-1">
            <label className="block font-semibold">Overall Comments</label>
            <Textarea
              value={form.overallComments}
              onChange={e => setForm(f => ({ ...f, overallComments: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold">Strengths Observed (optional)</label>
            <Textarea
              value={form.strengthsObserved}
              onChange={e => setForm(f => ({ ...f, strengthsObserved: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold">Areas for Improvement (optional)</label>
            <Textarea
              value={form.areasForImprovement}
              onChange={e => setForm(f => ({ ...f, areasForImprovement: e.target.value }))}
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold">Immediate Suggestions (optional)</label>
            <Textarea
              value={form.immediateSuggestions}
              onChange={e => setForm(f => ({ ...f, immediateSuggestions: e.target.value }))}
            />
          </div>

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Submitting…" : "Submit Feedback"}
          </Button>
        </CardContent>
    </Card>
   </div>
  );
}
