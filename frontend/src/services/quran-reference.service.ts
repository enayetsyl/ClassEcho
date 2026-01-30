import apiClient from "@/lib/api-client";
import { ISurahInfo, IJuzInfo } from "@/types/quran.types";

const BASE = "quran/reference";

export const getSurahs = async (): Promise<ISurahInfo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISurahInfo[];
  }>(`${BASE}/surahs`);
  return res.data.data;
};

export const getSurahByNumber = async (
  number: number,
): Promise<ISurahInfo> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: ISurahInfo;
  }>(`${BASE}/surahs/${number}`);
  return res.data.data;
};

export const getJuzList = async (): Promise<IJuzInfo[]> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IJuzInfo[];
  }>(`${BASE}/juz`);
  return res.data.data;
};

export const getJuzByNumber = async (number: number): Promise<IJuzInfo> => {
  const res = await apiClient.get<{
    success: boolean;
    message: string;
    data: IJuzInfo;
  }>(`${BASE}/juz/${number}`);
  return res.data.data;
};
