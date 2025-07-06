import apiClient from "@/lib/api-client";
import {
  TVideo,
  TCreateVideoPayload,
  TListVideosParams,
  TAssignReviewerPayload,
  TSubmitReviewPayload,
  TTeacherCommentPayload,
} from "@/types/video.types";

/** GET /videos → TVideo[] */
export const getAllVideos = async (
  params?: TListVideosParams
): Promise<TVideo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
  }>("/admin/videos", { params });
  return res.data.data;
};


export const getAssignedVideos = async (): Promise<TVideo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
  }>("/admin/videos/my-assigned");
  return res.data.data;
};

/** GET /videos/:id → TVideo */
export const getVideo = async (id: string): Promise<TVideo> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}`);
  return res.data.data;
};

/** POST /videos → TVideo */
export const createVideo = async (
  payload: TCreateVideoPayload
): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>("/admin/videos", payload);
  return res.data.data;
};

/** POST /videos/:id/assign → TVideo */
export const assignReviewer = async ({
  id,
  reviewerId,
}: TAssignReviewerPayload): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/assign`, { reviewerId });
  return res.data.data;
};

/** POST /videos/:id/review → TVideo */
export const submitReview = async (
  id: string,
  payload: TSubmitReviewPayload
): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/review`, payload);
  return res.data.data;
};

/** POST /videos/:id/publish → TVideo */
export const publishVideo = async (id: string): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/publish`);
  return res.data.data;
};

/** GET /me/feedback → TVideo[] */
export const getTeacherFeedback = async (): Promise<TVideo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
  }>("/admin/videos/me/feedback");
  return res.data.data;
};

/** POST /videos/:id/teacher-comment → TVideo */
export const addTeacherComment = async (
  id: string,
  payload: TTeacherCommentPayload
): Promise<TVideo> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: TVideo;
  }>(`/admin/videos/${id}/teacher-comment`, payload);
  return res.data.data;
};
