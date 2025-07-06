"use client";

import React, { useState } from "react";
import {
  useGetAllSectionsQuery,
  useDeleteSectionMutation,
  useUpdateSectionMutation,
} from "@/hooks/use-section";
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
import type { ISection } from "@/types/section.types";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, "Section name cannot be empty"),
});
type FormValues = z.infer<typeof formSchema>;

export default function SectionListPage() {
  const { data: sections = [], isLoading } = useGetAllSectionsQuery();
  const deleteSection = useDeleteSectionMutation();
  const updateSection = useUpdateSectionMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<ISection | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  function onEditClick(sec: ISection) {
    setCurrentSection(sec);
    form.reset({ name: sec.name });
    setIsEditOpen(true);
  }

  function closeDialog() {
    setIsEditOpen(false);
    setCurrentSection(null);
  }

  function onSubmit(values: FormValues) {
    if (currentSection) {
      updateSection.mutate(
        { id: currentSection._id, data: values },
        { onSuccess: closeDialog }
      );
    }
  }

  if (isLoading) return <div>Loading...</div>;

  return (
     <div className="p-4 space-y-6">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Manage Classes</h1>
        <Link href="/dashboard/admin/sections/create-section">
          <Button className="w-full md:w-auto">Add Section</Button>
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
          {sections.map((sec) => (
            <TableRow key={sec._id}>
              <TableCell>{sec.name}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditClick(sec)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete section “${sec.name}”?`)) {
                      deleteSection.mutate(sec._id);
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
            <DialogTitle>Edit Section</DialogTitle>
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
                    <FormLabel>Section Name</FormLabel>
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
                <Button type="submit" disabled={updateSection.isPending}>
                  {updateSection.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
