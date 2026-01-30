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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetQuranEntryQuery,
  useUpdateQuranEntryMutation,
} from "@/hooks/use-quran-entries";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import { getApiErrorMessage } from "@/lib/api-error";
import type { IQuranEntry, IQuranStudent } from "@/types/quran.types";
import { ContentSelector } from "@/components/quran/forms";

const contentSchema = z.object({
  type: z.enum(["surah", "juz", "custom"]),
  surahNumber: z.number().min(1).max(114).optional(),
  surahName: z.string().optional(),
  ayahStart: z.number().min(1).optional(),
  ayahEnd: z.number().min(1).optional(),
  juzNumber: z.number().min(1).max(30).optional(),
  customDescription: z.string().max(200).optional(),
});

const testSchema = z.object({
  given: z.boolean(),
  tanbih: z.coerce.number().int().min(0),
  fath: z.coerce.number().int().min(0),
  note: z.string().optional(),
  content: contentSchema.optional(),
});

const tajweedSchema = z.object({
  harf: z.string().optional(),
  ghunna: z.string().optional(),
  madd: z.string().optional(),
  other: z.string().optional(),
});

const formSchema = z.object({
  newTest: testSchema,
  recentTest: testSchema,
  olderTest: testSchema,
  tajweedNotes: tajweedSchema,
  generalNote: z.string().optional(),
  ustadName: z.string().optional(),
  signature: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultContent = {
  type: "surah" as const,
  surahNumber: undefined as number | undefined,
  surahName: undefined as string | undefined,
  ayahStart: undefined as number | undefined,
  ayahEnd: undefined as number | undefined,
  juzNumber: undefined as number | undefined,
  customDescription: undefined as string | undefined,
};

const defaultTest = {
  given: false,
  tanbih: 0,
  fath: 0,
  note: "",
  content: defaultContent,
};
const defaultTajweed = { harf: "", ghunna: "", madd: "", other: "" };

function getStudentDisplay(entry: IQuranEntry): string {
  const s = entry.student;
  if (typeof s === "object" && s !== null && "nameEn" in s) {
    return (s as IQuranStudent).nameEn;
  }
  return typeof s === "string" ? s : "—";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

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
        name={`${prefix}.content`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Content</FormLabel>
            <FormControl>
              <ContentSelector
                value={field.value ?? defaultContent}
                onChange={field.onChange}
                testType={prefix === "newTest" ? "new" : prefix === "recentTest" ? "recent" : "older"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
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

function buildContentPayload(content: FormValues["newTest"]["content"]) {
  if (!content?.type) return undefined;
  const base = { type: content.type };
  if (content.type === "surah") {
    return {
      ...base,
      ...(content.surahNumber != null && { surahNumber: content.surahNumber }),
      ...(content.surahName && { surahName: content.surahName }),
      ...(content.ayahStart != null && { ayahStart: content.ayahStart }),
      ...(content.ayahEnd != null && { ayahEnd: content.ayahEnd }),
    };
  }
  if (content.type === "juz") {
    return {
      ...base,
      ...(content.juzNumber != null && { juzNumber: content.juzNumber }),
    };
  }
  if (content.type === "custom") {
    return {
      ...base,
      ...(content.customDescription && { customDescription: content.customDescription }),
    };
  }
  return base;
}

export default function EditQuranEntryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const { data: entry, isLoading, isError, error } = useGetQuranEntryQuery(id);
  const { mutate, isPending } = useUpdateQuranEntryMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newTest: defaultTest,
      recentTest: defaultTest,
      olderTest: defaultTest,
      tajweedNotes: defaultTajweed,
      generalNote: "",
      ustadName: "",
      signature: "",
    },
  });

  useEffect(() => {
    if (entry) {
      const toContent = (t: IQuranEntry["newTest"]) =>
        t?.content?.type
          ? {
              type: t.content.type,
              surahNumber: t.content.surahNumber,
              surahName: t.content.surahName,
              ayahStart: t.content.ayahStart,
              ayahEnd: t.content.ayahEnd,
              juzNumber: t.content.juzNumber,
              customDescription: t.content.customDescription,
            }
          : defaultContent;

      form.reset({
        newTest: {
          given: entry.newTest?.given ?? false,
          tanbih: entry.newTest?.tanbih ?? 0,
          fath: entry.newTest?.fath ?? 0,
          note: entry.newTest?.note ?? "",
          content: toContent(entry.newTest),
        },
        recentTest: {
          given: entry.recentTest?.given ?? false,
          tanbih: entry.recentTest?.tanbih ?? 0,
          fath: entry.recentTest?.fath ?? 0,
          note: entry.recentTest?.note ?? "",
          content: toContent(entry.recentTest),
        },
        olderTest: {
          given: entry.olderTest?.given ?? false,
          tanbih: entry.olderTest?.tanbih ?? 0,
          fath: entry.olderTest?.fath ?? 0,
          note: entry.olderTest?.note ?? "",
          content: toContent(entry.olderTest),
        },
        tajweedNotes: {
          harf: entry.tajweedNotes?.harf ?? "",
          ghunna: entry.tajweedNotes?.ghunna ?? "",
          madd: entry.tajweedNotes?.madd ?? "",
          other: entry.tajweedNotes?.other ?? "",
        },
        generalNote: entry.generalNote ?? "",
        ustadName: entry.ustadName ?? "",
        signature: entry.signature ?? "",
      });
    }
  }, [entry, form]);

  const onSubmit = (values: FormValues) => {
    if (!id) return;
    const payload = {
      newTest: {
        ...values.newTest,
        content: buildContentPayload(values.newTest.content),
      },
      recentTest: {
        ...values.recentTest,
        content: buildContentPayload(values.recentTest.content),
      },
      olderTest: {
        ...values.olderTest,
        content: buildContentPayload(values.olderTest.content),
      },
      tajweedNotes: Object.fromEntries(
        Object.entries(values.tajweedNotes).filter(
          ([, v]) => v != null && v !== "",
        ),
      ),
      generalNote: values.generalNote || undefined,
      ustadName: values.ustadName || undefined,
      signature: values.signature || undefined,
    };
    mutate(
      { id, data: payload },
      {
        onSuccess: () => router.push("/dashboard/admin/quran/entries"),
      },
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !entry) {
    return (
      <ProtectedRoute>
        <div className="p-4 max-w-xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {error ? getApiErrorMessage(error) : "Entry not found."}
              </p>
              <Link
                href="/dashboard/admin/quran/entries"
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
      <div className="p-4 sm:p-6 max-w-2xl mx-auto min-w-0">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Link href="/dashboard/admin/quran/entries">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <CardTitle className="text-xl">Edit Quran Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg border bg-muted/30 p-4 text-sm">
              <p>
                <span className="font-medium">Student:</span>{" "}
                {getStudentDisplay(entry)}
              </p>
              <p>
                <span className="font-medium">Report date:</span>{" "}
                {formatDate(entry.reportDate)}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                    {isPending ? "Saving..." : "Save changes"}
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
