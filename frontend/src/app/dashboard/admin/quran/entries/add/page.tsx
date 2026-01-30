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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCreateQuranEntryMutation } from "@/hooks/use-quran-entries";
import { useGetQuranStudentsQuery } from "@/hooks/use-quran-students";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/route/ProtectedRoute";

const testSchema = z.object({
  given: z.boolean(),
  tanbih: z.coerce.number().int().min(0),
  fath: z.coerce.number().int().min(0),
  note: z.string().optional(),
});

const tajweedSchema = z.object({
  harf: z.string().optional(),
  ghunna: z.string().optional(),
  madd: z.string().optional(),
  other: z.string().optional(),
});

const formSchema = z.object({
  studentId: z.string().min(1, "Select a student"),
  reportDate: z.string().min(1, "Report date is required"),
  newTest: testSchema,
  recentTest: testSchema,
  olderTest: testSchema,
  tajweedNotes: tajweedSchema,
  generalNote: z.string().optional(),
  ustadName: z.string().optional(),
  signature: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultTest = { given: false, tanbih: 0, fath: 0, note: "" };
const defaultTajweed = { harf: "", ghunna: "", madd: "", other: "" };

const defaultValues: FormValues = {
  studentId: "",
  reportDate: new Date().toISOString().slice(0, 10),
  newTest: defaultTest,
  recentTest: defaultTest,
  olderTest: defaultTest,
  tajweedNotes: defaultTajweed,
  generalNote: "",
  ustadName: "",
  signature: "",
};

function TestSection({
  title,
  prefix,
  form,
}: {
  title: string;
  prefix: "newTest" | "recentTest" | "olderTest";
  form: ReturnType<typeof useForm<FormValues>>;
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`${prefix}.given`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">
                Test given?
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.tanbih`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanbih</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.fath`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fath</FormLabel>
              <FormControl>
                <Input type="number" min={0} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name={`${prefix}.note`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl>
              <Textarea placeholder="Note for this test" {...field} rows={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default function AddQuranEntryPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const { mutate, isPending } = useCreateQuranEntryMutation();
  const { data: studentsData, isFetching: studentsLoading } =
    useGetQuranStudentsQuery({
      limit: 300,
      active: "true",
    });
  const students = studentsData?.data ?? [];

  const onSubmit = (values: FormValues) => {
    const payload = {
      studentId: values.studentId,
      reportDate: values.reportDate,
      newTest: values.newTest,
      recentTest: values.recentTest,
      olderTest: values.olderTest,
      tajweedNotes: Object.fromEntries(
        Object.entries(values.tajweedNotes).filter(
          ([, v]) => v != null && v !== "",
        ),
      ) as FormValues["tajweedNotes"],
      generalNote: values.generalNote || undefined,
      ustadName: values.ustadName || undefined,
      signature: values.signature || undefined,
    };
    mutate(payload, {
      onSuccess: () => router.push("/dashboard/admin/quran/entries"),
    });
  };

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Link href="/dashboard/admin/quran/entries">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <CardTitle className="text-xl">New Quran Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={studentsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                studentsLoading
                                  ? "Loading students..."
                                  : "Select student"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.nameEn} ({s.studentId}) — {s.class}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Report date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <TestSection title="New test" prefix="newTest" form={form} />
                <TestSection
                  title="Recent test"
                  prefix="recentTest"
                  form={form}
                />
                <TestSection
                  title="Older test"
                  prefix="olderTest"
                  form={form}
                />

                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="font-medium">Tajweed notes</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tajweedNotes.harf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harf</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Letter pronunciation"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tajweedNotes.ghunna"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghunna</FormLabel>
                          <FormControl>
                            <Input placeholder="Nasal sound" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tajweedNotes.madd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Madd</FormLabel>
                          <FormControl>
                            <Input placeholder="Elongation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tajweedNotes.other"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other</FormLabel>
                          <FormControl>
                            <Input placeholder="Other issues" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="generalNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General note</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="General observation"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ustadName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ustad / Ustadha name</FormLabel>
                        <FormControl>
                          <Input placeholder="Teacher name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature / Initial</FormLabel>
                        <FormControl>
                          <Input placeholder="Initials" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save entry"}
                  </Button>
                  <Link href="/dashboard/admin/quran/entries">
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
