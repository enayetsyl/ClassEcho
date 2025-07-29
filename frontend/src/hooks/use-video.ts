import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";
import {
  TVideo,
  TCreateVideoPayload,
  TListVideosParams,
  TAssignReviewerPayload,
  TSubmitReviewPayload,
  TTeacherCommentPayload,
  TPaginatedVideos,
  TListAssignedParams,
  TListTeacherFeedbackParams,
  TSubmitLanguageReviewPayload,
} from "@/types/video.types";
import * as videoService from "@/services/video.service";

/** 1️⃣ Fetch all videos (with optional filters) */
export const useGetAllVideosQuery = (params?: TListVideosParams) =>
  useQuery<TPaginatedVideos, Error>({
    queryKey: ["videos", params],
    queryFn: () => videoService.getAllVideos(params),
  });

export const useGetAssignedVideosQuery = (params: TListAssignedParams) =>
  useQuery<TPaginatedVideos, Error>({
    queryKey: ['videos', 'assigned'],
    queryFn: () =>  videoService.getAssignedVideos(params),
  });

/** 2️⃣ Fetch single video detail */
export const useGetVideoQuery = (id?: string) =>
  useQuery<TVideo, Error>({
    queryKey: ["video", id],
    queryFn: () => videoService.getVideo(id!),
    enabled: Boolean(id),
  });

/** 3️⃣ Create (save) a new video record */
export const useCreateVideoMutation = () => {
  const qc = useQueryClient();
  return useMutation<TVideo, AxiosError<IGenericErrorResponse>, TCreateVideoPayload>({
    mutationFn: (payload) => videoService.createVideo(payload),
    onSuccess: () => {
      toast.success("Video created successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to create video";
      toast.error(msg);
    },
  });
};

/** 4️⃣ Assign or reassign a reviewer */
export const useAssignReviewerMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    TAssignReviewerPayload
  >({
    mutationFn: (payload) => videoService.assignReviewer(payload),
    onSuccess: () => {
      toast.success("Reviewer assigned successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to assign reviewer";
      toast.error(msg);
    },
  });
};

/** 5️⃣ Submit peer-review feedback */
export const useSubmitReviewMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: TSubmitReviewPayload }
  >({
    mutationFn: ({ id, data }) => videoService.submitReview(id, data),
    onSuccess: () => {
      toast.success("Review submitted successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to submit review";
      toast.error(msg);
    },
  });
};

/** 5.1️⃣ Submit a Qur’an/Arabic (language) review */
export const useSubmitLanguageReviewMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: TSubmitLanguageReviewPayload }
  >({
    mutationFn: ({ id, data }) => videoService.submitLanguageReview(id, data),
    onSuccess: () => {
      toast.success("Review submitted successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to submit language review";
      toast.error(msg);
    },
  });
};


/** 6️⃣ Publish a reviewed video */
export const usePublishVideoMutation = () => {
  const qc = useQueryClient();
  return useMutation<TVideo, AxiosError<IGenericErrorResponse>, string>({
    mutationFn: (id) => videoService.publishVideo(id),
    onSuccess: () => {
      toast.success("Video published successfully");
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to publish video";
      toast.error(msg);
    },
  });
};

/** 7️⃣ Teacher: list all published feedback */
export const useGetTeacherFeedbackQuery = (params: TListTeacherFeedbackParams)  =>
 useQuery<TPaginatedVideos, Error>({
    queryKey: ["teacherFeedback"],
    queryFn: () => videoService.getTeacherFeedback(params),
  });

/** 8️⃣ Teacher: add a comment to a published review */
export const useAddTeacherCommentMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    TVideo,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: TTeacherCommentPayload }
  >({
    mutationFn: ({ id, data }) => videoService.addTeacherComment(id, data),
    onSuccess: () => {
      toast.success("Comment added successfully");
      qc.invalidateQueries({ queryKey: ["teacherFeedback"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to add comment";
      toast.error(msg);
    },
  });
};
