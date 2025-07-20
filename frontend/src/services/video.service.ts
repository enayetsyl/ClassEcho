import apiClient from "@/lib/api-client";
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
} from "@/types/video.types";

/** GET /videos → TVideo[] */
export const getAllVideos = async (
  params?: TListVideosParams
): Promise<TPaginatedVideos> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
  }>("/admin/videos", { params });
    return {
    data: res.data.data,
    meta: res.data.meta,
  };
};


export const getAssignedVideos = async (params: TListAssignedParams = {}): Promise<TPaginatedVideos> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
     meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
  }>("/admin/videos/my-assigned", { params });
  
    return {
    data: res.data.data,
    meta: res.data.meta,
  };
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
export const getTeacherFeedback = async (  params: TListTeacherFeedbackParams = {}):  Promise<TPaginatedVideos> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: TVideo[];
     meta: {
      page: number;
      limit: number;
      total: number;
      totalPage: number;
    };
  }>("/admin/videos/me/feedback", { params });
  
   return {
    data: res.data.data,
    meta: res.data.meta,
  };
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
