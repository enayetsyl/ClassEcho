import apiClient from "@/lib/api-client";
import { IClass, ICreateClass, IUpdateClass } from "@/types/class.types";

// GET /admin/classes → returns IClass[]
export const getAllClasses = async (): Promise<IClass[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IClass[];
  }>("/admin/classes");
  return res.data.data;
};

// POST /admin/classes → returns IClass
export const createClass = async (
  payload: ICreateClass
): Promise<IClass> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: IClass;
  }>("/admin/classes", payload);
  return res.data.data;
};

// PUT /admin/classes/:id → returns IClass
export const updateClass = async (
  id: string,
  payload: IUpdateClass
): Promise<IClass> => {
  const res = await apiClient.put<{
    success: boolean;
    message: string;
    data: IClass;
  }>(`/admin/classes/${id}`, payload);
  return res.data.data;
};

// DELETE /admin/classes/:id → returns void
export const deleteClass = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/classes/${id}`);
};
