import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as sectionService from "@/services/section.service";
import { ISection, ICreateSection, IUpdateSection } from "@/types/section.types";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";

// 1️⃣ Fetch all sections
export const useGetAllSectionsQuery = () =>
  useQuery<ISection[], Error>({
    queryKey: ["sections"],
    queryFn: sectionService.getAllSections,
  });

// 2️⃣ Create a section
export const useCreateSectionMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    ISection,
    AxiosError<IGenericErrorResponse>,
    ICreateSection
  >({
    mutationFn: sectionService.createSection,
    onSuccess: () => {
      toast.success("Section created successfully");
      qc.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to create section";
      toast.error(msg);
    },
  });
};

// 3️⃣ Update a section
export const useUpdateSectionMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    ISection,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: IUpdateSection }
  >({
    mutationFn: ({ id, data }) => sectionService.updateSection(id, data),
    onSuccess: () => {
      toast.success("Section updated successfully");
      qc.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to update section";
      toast.error(msg);
    },
  });
};

// 4️⃣ Delete a section
export const useDeleteSectionMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    AxiosError<IGenericErrorResponse>,
    string
  >({
    mutationFn: (id) => sectionService.deleteSection(id),
    onSuccess: () => {
      toast.success("Section deleted successfully");
      qc.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? "Failed to delete section";
      toast.error(msg);
    },
  });
};
