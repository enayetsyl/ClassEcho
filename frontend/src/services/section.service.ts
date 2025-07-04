import apiClient from "@/lib/api-client";
import { ISection, ICreateSection, IUpdateSection } from "@/types/section.types";

// GET /admin/sections → ISection[]
export const getAllSections = async (): Promise<ISection[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISection[];
  }>("/admin/sections");
  return res.data.data;
};

// POST /admin/sections → ISection
export const createSection = async (
  payload: ICreateSection
): Promise<ISection> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: ISection;
  }>("/admin/sections", payload);
  return res.data.data;
};

// PUT /admin/sections/:id → ISection
export const updateSection = async (
  id: string,
  payload: IUpdateSection
): Promise<ISection> => {
  const res = await apiClient.put<{
    success: boolean;
    message: string;
    data: ISection;
  }>(`/admin/sections/${id}`, payload);
  return res.data.data;
};

// DELETE /admin/sections/:id → void
export const deleteSection = async (id: string): Promise<void> => {
  await apiClient.delete(`/admin/sections/${id}`);
};
