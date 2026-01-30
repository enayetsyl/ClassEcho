import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";
import {
  IQuranEntry,
  ICreateQuranEntryPayload,
  IQuranEntryFilters,
  IQuranPaginatedEntries,
} from "@/types/quran.types";
import * as quranEntryService from "@/services/quran-entry.service";

export const useGetQuranEntriesQuery = (params?: IQuranEntryFilters) =>
  useQuery<IQuranPaginatedEntries, Error>({
    queryKey: ["quran-entries", params],
    queryFn: () => quranEntryService.getAllQuranEntries(params),
  });

export const useGetQuranEntryQuery = (id: string | undefined) =>
  useQuery<IQuranEntry, Error>({
    queryKey: ["quran-entry", id],
    queryFn: () => quranEntryService.getQuranEntryById(id!),
    enabled: Boolean(id),
  });

export const useGetQuranEntriesByStudentQuery = (
  studentId: string | undefined,
  params?: Pick<IQuranEntryFilters, "page" | "limit" | "sortBy" | "sortOrder">,
) =>
  useQuery<IQuranPaginatedEntries, Error>({
    queryKey: ["quran-entries-by-student", studentId, params],
    queryFn: () =>
      quranEntryService.getQuranEntriesByStudent(studentId!, params),
    enabled: Boolean(studentId),
  });

export const useCreateQuranEntryMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    IQuranEntry,
    AxiosError<IGenericErrorResponse>,
    ICreateQuranEntryPayload
  >({
    mutationFn: quranEntryService.createQuranEntry,
    onSuccess: (_, variables) => {
      toast.success("Quran entry created successfully");
      qc.invalidateQueries({ queryKey: ["quran-entries"] });
      qc.invalidateQueries({
        queryKey: ["quran-entries-by-student", variables.studentId],
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to create Quran entry";
      toast.error(msg);
    },
  });
};

export const useUpdateQuranEntryMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    IQuranEntry,
    AxiosError<IGenericErrorResponse>,
    {
      id: string;
      data: Partial<Omit<ICreateQuranEntryPayload, "studentId" | "reportDate">>;
    }
  >({
    mutationFn: ({ id, data }) => quranEntryService.updateQuranEntry(id, data),
    onSuccess: (data) => {
      toast.success("Quran entry updated successfully");
      qc.invalidateQueries({ queryKey: ["quran-entries"] });
      qc.invalidateQueries({ queryKey: ["quran-entry", data._id] });
      const studentId =
        typeof data.student === "string" ? data.student : data.student?._id;
      if (studentId) {
        qc.invalidateQueries({
          queryKey: ["quran-entries-by-student", studentId],
        });
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to update Quran entry";
      toast.error(msg);
    },
  });
};

export const useDeleteQuranEntryMutation = () => {
  const qc = useQueryClient();
  return useMutation<void, AxiosError<IGenericErrorResponse>, string>({
    mutationFn: quranEntryService.deleteQuranEntry,
    onSuccess: () => {
      toast.success("Quran entry deleted successfully");
      qc.invalidateQueries({ queryKey: ["quran-entries"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to delete Quran entry";
      toast.error(msg);
    },
  });
};

export const useBulkImportQuranEntriesMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    { created: number; errors: string[] },
    AxiosError<IGenericErrorResponse>,
    ICreateQuranEntryPayload[]
  >({
    mutationFn: quranEntryService.bulkImportQuranEntries,
    onSuccess: (data) => {
      const msg =
        data.errors.length > 0
          ? `Imported ${data.created} entries. ${data.errors.length} errors.`
          : `Successfully imported ${data.created} entries.`;
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["quran-entries"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Bulk import failed";
      toast.error(msg);
    },
  });
};
