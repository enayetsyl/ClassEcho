import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as subjectService from "@/services/subject.service";
import { ISubject, ICreateSubject, IUpdateSubject } from "@/types/subject.types";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";

// 1️⃣ Fetch all subjects
export const useGetAllSubjectsQuery = () =>
  useQuery<ISubject[], Error>({
    queryKey: ["subjects"],
    queryFn: subjectService.getAllSubjects,
  });

// 2️⃣ Create a subject
export const useCreateSubjectMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    ISubject,
    AxiosError<IGenericErrorResponse>,
    ICreateSubject
  >({
    mutationFn: subjectService.createSubject,
    onSuccess: () => {
      toast.success("Subject created successfully");
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to create subject";
      toast.error(msg);
    },
  });
};

// 3️⃣ Update a subject
export const useUpdateSubjectMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    ISubject,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: IUpdateSubject }
  >({
    mutationFn: ({ id, data }) => subjectService.updateSubject(id, data),
    onSuccess: () => {
      toast.success("Subject updated successfully");
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to update subject";
      toast.error(msg);
    },
  });
};

// 4️⃣ Delete a subject
export const useDeleteSubjectMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    AxiosError<IGenericErrorResponse>,
    string
  >({
    mutationFn: (id) => subjectService.deleteSubject(id),
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      qc.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to delete subject";
      toast.error(msg);
    },
  });
};
