import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";
import {
  IQuranStudent,
  ICreateQuranStudentPayload,
  IQuranStudentFilters,
  IQuranPaginatedStudents,
} from "@/types/quran.types";
import * as quranStudentService from "@/services/quran-student.service";

export const useGetQuranStudentsQuery = (params?: IQuranStudentFilters) =>
  useQuery<IQuranPaginatedStudents, Error>({
    queryKey: ["quran-students", params],
    queryFn: () => quranStudentService.getAllQuranStudents(params),
  });

export const useGetQuranStudentQuery = (id: string | undefined) =>
  useQuery<IQuranStudent, Error>({
    queryKey: ["quran-student", id],
    queryFn: () => quranStudentService.getQuranStudentById(id!),
    enabled: Boolean(id),
  });

export const useCreateQuranStudentMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    IQuranStudent,
    AxiosError<IGenericErrorResponse>,
    ICreateQuranStudentPayload
  >({
    mutationFn: quranStudentService.createQuranStudent,
    onSuccess: () => {
      toast.success("Quran student created successfully");
      qc.invalidateQueries({ queryKey: ["quran-students"] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to create Quran student";
      toast.error(msg);
    },
  });
};

export const useUpdateQuranStudentMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    IQuranStudent,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: Partial<ICreateQuranStudentPayload> }
  >({
    mutationFn: ({ id, data }) =>
      quranStudentService.updateQuranStudent(id, data),
    onSuccess: (_, variables) => {
      toast.success("Quran student updated successfully");
      qc.invalidateQueries({ queryKey: ["quran-students"] });
      qc.invalidateQueries({ queryKey: ["quran-student", variables.id] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to update Quran student";
      toast.error(msg);
    },
  });
};

export const useDeleteQuranStudentMutation = () => {
  const qc = useQueryClient();
  return useMutation<void, AxiosError<IGenericErrorResponse>, string>({
    mutationFn: quranStudentService.deleteQuranStudent,
    onSuccess: () => {
      toast.success("Quran student deactivated successfully");
      qc.invalidateQueries({ queryKey: ["quran-students"] });
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to deactivate Quran student";
      toast.error(msg);
    },
  });
};

export const useBulkImportQuranStudentsMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    { created: number; errors: string[] },
    AxiosError<IGenericErrorResponse>,
    ICreateQuranStudentPayload[]
  >({
    mutationFn: quranStudentService.bulkImportQuranStudents,
    onSuccess: (data) => {
      const msg =
        data.errors.length > 0
          ? `Imported ${data.created} students. ${data.errors.length} errors.`
          : `Successfully imported ${data.created} students.`;
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["quran-students"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Bulk import failed";
      toast.error(msg);
    },
  });
};
