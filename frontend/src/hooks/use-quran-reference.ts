import { useQuery } from "@tanstack/react-query";
import { ISurahInfo, IJuzInfo } from "@/types/quran.types";
import * as quranReferenceService from "@/services/quran-reference.service";

/** Static reference data: cache for 24 hours, no refetch on window focus */
const REFERENCE_STALE_MS = 1000 * 60 * 60 * 24; // 24h
const REFERENCE_GC_MS = 1000 * 60 * 60 * 48; // 48h

export const useSurahsQuery = () =>
  useQuery<ISurahInfo[], Error>({
    queryKey: ["quran-reference-surahs"],
    queryFn: quranReferenceService.getSurahs,
    staleTime: REFERENCE_STALE_MS,
    gcTime: REFERENCE_GC_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export const useSurahByNumberQuery = (number: number | undefined) =>
  useQuery<ISurahInfo, Error>({
    queryKey: ["quran-reference-surah", number],
    queryFn: () => quranReferenceService.getSurahByNumber(number!),
    enabled: typeof number === "number" && number >= 1 && number <= 114,
    staleTime: REFERENCE_STALE_MS,
    gcTime: REFERENCE_GC_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export const useJuzListQuery = () =>
  useQuery<IJuzInfo[], Error>({
    queryKey: ["quran-reference-juz"],
    queryFn: quranReferenceService.getJuzList,
    staleTime: REFERENCE_STALE_MS,
    gcTime: REFERENCE_GC_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

export const useJuzByNumberQuery = (number: number | undefined) =>
  useQuery<IJuzInfo, Error>({
    queryKey: ["quran-reference-juz", number],
    queryFn: () => quranReferenceService.getJuzByNumber(number!),
    enabled: typeof number === "number" && number >= 1 && number <= 30,
    staleTime: REFERENCE_STALE_MS,
    gcTime: REFERENCE_GC_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
