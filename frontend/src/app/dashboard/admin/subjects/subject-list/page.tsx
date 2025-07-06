"use client";

import React, { useState } from "react";
import {
  useGetAllSubjectsQuery,
  useDeleteSubjectMutation,
  useUpdateSubjectMutation,
} from "@/hooks/use-subject";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ISubject } from "@/types/subject.types";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Subject name cannot be empty"),
});
type FormValues = z.infer<typeof formSchema>;

export default function SubjectListPage() {
  const { data: subjects = [], isLoading } = useGetAllSubjectsQuery();
  const deleteSubject = useDeleteSubjectMutation();
  const updateSubject = useUpdateSubjectMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<ISubject | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  function onEditClick(subj: ISubject) {
    setCurrentSubject(subj);
    form.reset({ name: subj.name });
    setIsEditOpen(true);
  }

  function closeDialog() {
    setIsEditOpen(false);
    setCurrentSubject(null);
  }

  function onSubmit(values: FormValues) {
    if (currentSubject) {
      updateSubject.mutate(
        { id: currentSubject._id, data: values },
        { onSuccess: closeDialog }
      );
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Manage Subjects</h1>
        <Link href="/dashboard/admin/subjects/create-subject">
          <Button className="w-full md:w-auto">Add Subject</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
            <Table className="min-w-[480px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subj) => (
            <TableRow key={subj._id}>
              <TableCell>{subj.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(subj)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete subject “${subj.name}”?`)) {
                      deleteSubject.mutate(subj._id);
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
</div>
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => open || closeDialog()}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateSubject.isPending}>
                  {updateSubject.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
