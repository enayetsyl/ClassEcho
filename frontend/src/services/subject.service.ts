import apiClient from "@/lib/api-client";
import { ISubject, ICreateSubject, IUpdateSubject } from "@/types/subject.types";

// GET /admin/subjects → ISubject[]
export const getAllSubjects = async (): Promise<ISubject[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISubject[];
  }>("/admin/subjects");
  return res.data.data;
};

// POST /admin/subjects → ISubject
export const createSubject = async (
  payload: ICreateSubject
): Promise<ISubject> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: ISubject;
  }>("/admin/subjects", payload);
  return res.data.data;
};

// PUT /admin/subjects/:id → ISubject
export const updateSubject = async (
  id: string,
  payload: IUpdateSubject
): Promise<ISubject> => {
  const res = await apiClient.put<{
    success: boolean;
    message: string;
    data: ISubject;
  }>(`/admin/subjects/${id}`, payload);
  return res.data.data;
};

// DELETE /admin/subjects/:id → void
export const deleteSubject = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/subjects/${id}`);
};
