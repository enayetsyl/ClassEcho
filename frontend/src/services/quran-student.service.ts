import apiClient from "@/lib/api-client";
import {
  IQuranStudent,
  ICreateQuranStudentPayload,
  IQuranStudentFilters,
  IQuranPaginatedStudents,
  IQuranBulkImportResult,
} from "@/types/quran.types";

const BASE = "/quran/students";

export const getAllQuranStudents = async (
  params?: IQuranStudentFilters,
): Promise<IQuranPaginatedStudents> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranStudent[];
    meta: IQuranPaginatedStudents["meta"];
  }>(BASE, { params });
  return { data: res.data.data, meta: res.data.meta! };
};

export const getQuranStudentById = async (
  id: string,
): Promise<IQuranStudent> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranStudent;
  }>(`${BASE}/${id}`);
  return res.data.data;
};

export const createQuranStudent = async (
  payload: ICreateQuranStudentPayload,
): Promise<IQuranStudent> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: IQuranStudent;
  }>(BASE, payload);
  return res.data.data;
};

export const updateQuranStudent = async (
  id: string,
  payload: Partial<ICreateQuranStudentPayload>,
): Promise<IQuranStudent> => {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: IQuranStudent;
  }>(`${BASE}/${id}`, payload);
  return res.data.data;
};

export const deleteQuranStudent = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};

export const bulkImportQuranStudents = async (
  students: ICreateQuranStudentPayload[],
): Promise<IQuranBulkImportResult> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: IQuranBulkImportResult;
  }>(`${BASE}/bulk`, { students });
  return res.data.data;
};
