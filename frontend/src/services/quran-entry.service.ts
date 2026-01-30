import apiClient from "@/lib/api-client";
import {
  IQuranEntry,
  ICreateQuranEntryPayload,
  IQuranEntryFilters,
  IQuranPaginatedEntries,
  IQuranBulkImportResult,
} from "@/types/quran.types";

const BASE = "/quran/entries";

export const getAllQuranEntries = async (
  params?: IQuranEntryFilters,
): Promise<IQuranPaginatedEntries> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranEntry[];
    meta: IQuranPaginatedEntries["meta"];
  }>(BASE, { params });
  return { data: res.data.data, meta: res.data.meta! };
};

export const getQuranEntryById = async (id: string): Promise<IQuranEntry> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranEntry;
  }>(`${BASE}/${id}`);
  return res.data.data;
};

export const getQuranEntriesByStudent = async (
  studentId: string,
  params?: Pick<IQuranEntryFilters, "page" | "limit" | "sortBy" | "sortOrder">,
): Promise<IQuranPaginatedEntries> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IQuranEntry[];
    meta: IQuranPaginatedEntries["meta"];
  }>(`${BASE}/student/${studentId}`, { params });
  return { data: res.data.data, meta: res.data.meta! };
};

export const createQuranEntry = async (
  payload: ICreateQuranEntryPayload,
): Promise<IQuranEntry> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: IQuranEntry;
  }>(BASE, payload);
  return res.data.data;
};

export const updateQuranEntry = async (
  id: string,
  payload: Partial<Omit<ICreateQuranEntryPayload, "studentId" | "reportDate">>,
): Promise<IQuranEntry> => {
  const res = await apiClient.patch<{
    success: boolean;
    message: string;
    data: IQuranEntry;
  }>(`${BASE}/${id}`, payload);
  return res.data.data;
};

export const deleteQuranEntry = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE}/${id}`);
};

export const bulkImportQuranEntries = async (
  entries: ICreateQuranEntryPayload[],
): Promise<IQuranBulkImportResult> => {
  const res = await apiClient.post<{
    success: boolean;
    message: string;
    data: IQuranBulkImportResult;
  }>(`${BASE}/bulk`, { entries });
  return res.data.data;
};
