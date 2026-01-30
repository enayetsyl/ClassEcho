"use client";

import React from "react";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCreateQuranStudentMutation } from "@/hooks/use-quran-students";
import { useRouter } from "next/navigation";
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

const defaultValues: FormValues = {
  studentId: 0,
  nameEn: "",
  nameBn: "",
  class: "",
  supervision: false,
  active: true,
  notes: "",
  photo: "",
};

export default function AddQuranStudentPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const { mutate, isPending } = useCreateQuranStudentMutation();

  const onSubmit = (values: FormValues) => {
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
    mutate(payload, {
      onSuccess: () => router.push("/dashboard/admin/quran/students"),
    });
  };

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
            <CardTitle className="text-xl">Add Quran Student</CardTitle>
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
                          placeholder="e.g. 1"
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0 cursor-pointer">
                          Active
                        </FormLabel>
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
                    {isPending ? "Creating..." : "Create Student"}
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
