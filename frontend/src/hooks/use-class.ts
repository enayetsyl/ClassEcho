// frontend/src/hooks/use-class.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as classService from "@/services/class.service";
import { IClass, ICreateClass, IUpdateClass } from "@/types/class.types";
import { AxiosError } from "axios";
import { IGenericErrorResponse } from "@/types/error.types";

// 1️⃣ Fetch all classes (returns IClass[])
export const useGetAllClassesQuery = () =>
  useQuery<IClass[], Error>({
    queryKey: ["classes"],
    queryFn: classService.getAllClasses,        // () => Promise<IClass[]>
  });

// 2️⃣ Create a class (returns IClass)
export const useCreateClassMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    IClass,                              // success type
    AxiosError<IGenericErrorResponse>,  // error type
    ICreateClass                        // input type
  >({
    mutationFn: classService.createClass,
    onSuccess: () => {
      toast.success('Class created successfully');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err) => {
      // now typed: err.response?.data.message
      const msg = err.response?.data.message ?? 'Failed to create class';
      toast.error(msg);
    },
  });
};

// 3️⃣ Update a class (returns IClass)
export const useUpdateClassMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    IClass,
    AxiosError<IGenericErrorResponse>,
    { id: string; data: IUpdateClass }
  >({
    mutationFn: ({ id, data }) => classService.updateClass(id, data),
    onSuccess: () => {
      toast.success('Class updated successfully');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? 'Failed to update class';
      toast.error(msg);
    },
  });
};

// 4️⃣ Delete a class (returns void)
export const useDeleteClassMutation = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    AxiosError<IGenericErrorResponse>,
    string
  >({
    mutationFn: (id) => classService.deleteClass(id),
    onSuccess: () => {
      toast.success('Class deleted successfully');
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err) => {
      const msg = err.response?.data.message ?? 'Failed to delete class';
      toast.error(msg);
    },
  });
};