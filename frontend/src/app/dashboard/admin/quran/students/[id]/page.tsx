"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  useGetQuranStudentQuery,
  useUpdateQuranStudentMutation,
} from "@/hooks/use-quran-students";
import { ProtectedRoute } from "@/route/ProtectedRoute";

const formSchema = z.object({
  studentId: z.coerce
    .number()
    .int()
    .positive("Student ID must be a positive integer"),
  nameEn: z.string().min(1, "English name is required"),
  nameBn: z.string().optional(),
  class: z.string().min(1, "Class is required"),
  supervision: z.boolean(),
  active: z.boolean(),
  notes: z.string().optional(),
  photo: z
    .union([z.string().url("Must be a valid URL"), z.literal("")])
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditQuranStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const { data: student, isLoading, isError } = useGetQuranStudentQuery(id);
  const { mutate, isPending } = useUpdateQuranStudentMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: 0,
      nameEn: "",
      nameBn: "",
      class: "",
      supervision: false,
      active: true,
      notes: "",
      photo: "",
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        studentId: student.studentId,
        nameEn: student.nameEn,
        nameBn: student.nameBn ?? "",
        class: student.class,
        supervision: student.supervision,
        active: student.active,
        notes: student.notes ?? "",
        photo: student.photo ?? "",
      });
    }
  }, [student, form]);

  const onSubmit = (values: FormValues) => {
    if (!id) return;
    const payload = {
      studentId: values.studentId,
      nameEn: values.nameEn,
      nameBn: values.nameBn || undefined,
      class: values.class,
      supervision: values.supervision,
      active: values.active,
      notes: values.notes || undefined,
      photo: values.photo || undefined,
    };
    mutate(
      { id, data: payload },
      {
        onSuccess: () => router.push("/dashboard/admin/quran/students"),
      },
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="p-4 flex justify-center items-center min-h-[200px] text-muted-foreground">
          Loading...
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !student) {
    return (
      <ProtectedRoute>
        <div className="p-4 max-w-xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Student not found.</p>
              <Link
                href="/dashboard/admin/quran/students"
                className="inline-block mt-2"
              >
                <Button variant="outline">Back to list</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Link href="/dashboard/admin/quran/students">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <CardTitle className="text-xl">Edit Quran Student</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : 0,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="English name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Bengali) — optional</FormLabel>
                      <FormControl>
                        <Input placeholder="Bengali name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 1-5 or Hifz 1st Year"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-wrap gap-6">
                  <FormField
                    control={form.control}
                    name="supervision"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          Under supervision
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Active</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes — optional</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="General notes"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL — optional</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                  <Link href="/dashboard/admin/quran/students">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
