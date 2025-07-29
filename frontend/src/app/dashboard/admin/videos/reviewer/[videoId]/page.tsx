"use client"
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider, SliderRange, SliderThumb, SliderTrack } from "@radix-ui/react-slider";
import {
  useGetVideoQuery,
  useSubmitReviewMutation,
  useSubmitLanguageReviewMutation,
} from "@/hooks/use-video";
import {
  TSubmitReviewPayload,
  TLanguageReviewCriterion,
} from "@/types/video.types";

// payload type for language reviews
type TSubmitLanguageReviewPayload = {
  classStartedOnTime: TLanguageReviewCriterion;
  classPerformedAsTraining: TLanguageReviewCriterion;
  canMaintainDiscipline: TLanguageReviewCriterion;
  studentsUnderstandLesson: TLanguageReviewCriterion;
  isClassInteractive: TLanguageReviewCriterion;
  teacherSignsHomeworkDiary: TLanguageReviewCriterion;
  teacherChecksDiary: TLanguageReviewCriterion;
  otherComments?: string;
};

// define general vs. language criteria keys
const generalCriteria = [
  { key: "subjectKnowledge", label: "Subject Knowledge" },
  { key: "engagementWithStudents", label: "Engagement with Students" },
  { key: "useOfTeachingAids", label: "Use of Teaching Aids / Board Work" },
  { key: "interactionAndQuestionHandling", label: "Interaction & Question Handling" },
  { key: "studentDiscipline", label: "Student Discipline" },
  { key: "teachersControlOverClass", label: "Teacher's Control over the Class" },
  { key: "participationLevelOfStudents", label: "Participation Level of Students" },
  { key: "completionOfPlannedSyllabus", label: "Completion of Planned Syllabus" },
] as const;
const languageCriteria = [
  { key: "classStartedOnTime", label: "Class Started On Time" },
  { key: "classPerformedAsTraining", label: "Class Performed As Training" },
  { key: "canMaintainDiscipline", label: "Can Maintain Discipline" },
  { key: "studentsUnderstandLesson", label: "Students Understand Lesson" },
  { key: "isClassInteractive", label: "Is Class Interactive" },
  { key: "teacherSignsHomeworkDiary", label: "Teacher Signs Homework Diary" },
  { key: "teacherChecksDiary", label: "Teacher Checks Homework Diary" },
] as const;

type GeneralKey = typeof generalCriteria[number]['key'];
// type LanguageKey = typeof languageCriteria[number]['key'];

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();

  const rawId = params.videoId;
  const videoId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data: video } = useGetVideoQuery(videoId!);
console.log('video.class', video)
  // detect if this is a language subject
  const isLanguage = video?.class.name
    ? ['quran', 'arabic'].includes(video.class.name.toLowerCase())
    : false;

  // mutations
  const { mutate: submitGeneral, isPending: loadingGeneral } = useSubmitReviewMutation();
  const { mutate: submitLanguage, isPending: loadingLanguage } = useSubmitLanguageReviewMutation();
  const isSubmitting = isLanguage ? loadingLanguage : loadingGeneral;

  // form state
  const [generalForm, setGeneralForm] = useState<TSubmitReviewPayload>({
    subjectKnowledge: { rating: 3, comment: "" },
    engagementWithStudents: { rating: 3, comment: "" },
    useOfTeachingAids: { rating: 3, comment: "" },
    interactionAndQuestionHandling: { rating: 3, comment: "" },
    studentDiscipline: { rating: 3, comment: "" },
    teachersControlOverClass: { rating: 3, comment: "" },
    participationLevelOfStudents: { rating: 3, comment: "" },
    completionOfPlannedSyllabus: { rating: 3, comment: "" },
    overallComments: "",
    strengthsObserved: "",
    areasForImprovement: "",
    immediateSuggestions: "",
  });

  const [languageForm, setLanguageForm] = useState<
    TSubmitLanguageReviewPayload
  >(() => ({
    classStartedOnTime: { answeredYes: false, comment: "" },
    classPerformedAsTraining: { answeredYes: false, comment: "" },
    canMaintainDiscipline: { answeredYes: false, comment: "" },
    studentsUnderstandLesson: { answeredYes: false, comment: "" },
    isClassInteractive: { answeredYes: false, comment: "" },
    teacherSignsHomeworkDiary: { answeredYes: false, comment: "" },
    teacherChecksDiary: { answeredYes: false, comment: "" },
    otherComments: "",
  }));

  // handlers
  const updateGeneral = (
    key: GeneralKey,
    field: 'rating' | 'comment',
    value: number | string
  ) =>
    setGeneralForm(f => ({
      ...f,
      [key]: { ...f[key], [field]: value },
    }));

type LanguageKey = /* your union of keys: */
  | "classStartedOnTime"
  | "classPerformedAsTraining"
  | "canMaintainDiscipline"
  | "studentsUnderstandLesson"
  | "isClassInteractive"
  | "teacherSignsHomeworkDiary"
  | "teacherChecksDiary";

// now this never needs `any`:
const updateLanguage = <F extends keyof TLanguageReviewCriterion>(
  key: LanguageKey,
  field: F,
  value: TLanguageReviewCriterion[F]
) => {
  setLanguageForm(prev => ({
    ...prev,
    [key]: {
      ...prev[key],
      [field]: value,
    },
  }));
};

  const handleSubmit = () => {
    if (!videoId) return;
    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: ['pendingReviews'] });
      router.push('/dashboard/admin/videos/reviewer');
    };

    if (isLanguage) {
      submitLanguage(
        { id: videoId, data: languageForm },
        { onSuccess }
      );
    } else {
      submitGeneral(
        { id: videoId, data: generalForm },
        { onSuccess }
      );
    }
  };

  return (
    <div className="px-5">
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Review Class Recording</CardTitle>
          <CardDescription>
            {isLanguage
              ? 'Answer the following language-specific questions'
              : 'Provide feedback in key teaching areas'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <iframe
            className="w-full aspect-video"
            src={
              video?.youtubeUrl.replace(
                'youtu.be',
                'www.youtube.com/embed'
              )
            }
            allowFullScreen
          />

          {isLanguage
            ? languageCriteria.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="block font-semibold">
                    {label}
                  </label>
                  <div className="flex items-center space-x-4">
                    <label>
                      <input
                        type="radio"
                        name={key}
                        checked={languageForm[key].answeredYes}
                        onChange={() =>
                          updateLanguage(key, 'answeredYes', true)
                        }
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={key}
                        checked={!languageForm[key].answeredYes}
                        onChange={() =>
                          updateLanguage(key, 'answeredYes', false)
                        }
                      />
                      No
                    </label>
                  </div>
                  <label className="block font-semibold">Comments</label>
                  <Textarea
                    value={languageForm[key].comment}
                    onChange={e =>
                      updateLanguage(key, 'comment', e.target.value)
                    }
                  />
                </div>
              ))
            : generalCriteria.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="block font-semibold">
                    {label} – Rating (1–5)
                  </label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      className="flex-1 bg-amber-300 rounded-md max-w-sm"
                      value={[generalForm[key].rating]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={val =>
                        updateGeneral(key, 'rating', val[0])
                      }
                    >
                      <SliderTrack>
                        <SliderRange />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <span className="w-6 text-center">
                      {generalForm[key].rating}
                    </span>
                  </div>
                  <label className="block font-semibold">
                    {label} – Comments
                  </label>
                  <Textarea
                    value={generalForm[key].comment}
                    onChange={e =>
                      updateGeneral(key, 'comment', e.target.value)
                    }
                  />
                </div>
              ))}

          {isLanguage ? (
            <div className="space-y-1">
              <label className="block font-semibold">Other Comments</label>
              <Textarea
                value={languageForm.otherComments}
                onChange={e =>
                  setLanguageForm(f => ({
                    ...f,
                    otherComments: e.target.value,
                  }))
                }
              />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="block font-semibold">
                  Overall Comments
                </label>
                <Textarea
                  value={generalForm.overallComments}
                  onChange={e =>
                    setGeneralForm(f => ({
                      ...f,
                      overallComments: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">
                  Strengths Observed (optional)
                </label>
                <Textarea
                  value={generalForm.strengthsObserved}
                  onChange={e =>
                    setGeneralForm(f => ({
                      ...f,
                      strengthsObserved: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">
                  Areas for Improvement (optional)
                </label>
                <Textarea
                  value={generalForm.areasForImprovement}
                  onChange={e =>
                    setGeneralForm(f => ({
                      ...f,
                      areasForImprovement: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">
                  Immediate Suggestions (optional)
                </label>
                <Textarea
                  value={generalForm.immediateSuggestions}
                  onChange={e =>
                    setGeneralForm(f => ({
                      ...f,
                      immediateSuggestions: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
