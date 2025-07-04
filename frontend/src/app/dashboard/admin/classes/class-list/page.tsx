// frontend/src/app/dashboard/admin/classes/class-list/page.tsx
"use client";

import React, { useState } from "react";
import { useGetAllClassesQuery, useDeleteClassMutation, useUpdateClassMutation } from "@/hooks/use-class";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { IClass } from "@/types/class.types";

const formSchema = z.object({
  name: z.string().min(1, "Class name cannot be empty"),
});
type FormValues = z.infer<typeof formSchema>;

export default function ClassListPage() {
  // 1️⃣ Load classes
  const { data: classes = [], isLoading } = useGetAllClassesQuery();

  // 2️⃣ Mutations
  const deleteClass = useDeleteClassMutation();
  const updateClass = useUpdateClassMutation();

  // 3️⃣ State for edit dialog
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<IClass | null>(null);

  // 4️⃣ Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  // Open dialog and populate form
  function onEditClick(cls: IClass) {
    setCurrentClass(cls);
    form.reset({ name: cls.name });
    setIsEditOpen(true);
  }

  // Close dialog
  function closeDialog() {
    setIsEditOpen(false);
    setCurrentClass(null);
  }

  // Handle form submit
  function onSubmit(values: FormValues) {
    if (currentClass) {
      updateClass.mutate(
        { id: currentClass._id, data: values },
        { onSuccess: closeDialog }
      );
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Manage Classes</h1>

      <Table className="max-w-5xl">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls._id}>
              <TableCell>{cls.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(cls)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  
                  onClick={() => {
                    if (
                      window.confirm(`Delete class “${cls.name}”?`)
                    ) {
                      deleteClass.mutate(cls._id);
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

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
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
                <Button type="submit" disabled={updateClass.isPending}>
                  {updateClass.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
