"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudentContentQuery } from "@/hooks/use-quran-reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranReportFiltersExtended } from "@/types/quran.types";
import { SurahStrengthChart, JuzHeatmap, ContentBubbleChart } from "@/components/quran/charts";
import { isValidMongoId, isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function StudentContentPage() {
  const params = useParams();
  const studentId = params?.id as string | undefined;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranReportFiltersExtended = useMemo(() => {
    if (!dateRangeValidation.valid) return {};
    return {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate, dateRangeValidation.valid]);

  const validStudentId = studentId && isValidMongoId(studentId);
  const { data: report, isLoading, isError, error } = useStudentContentQuery(
    validStudentId ? studentId : undefined,
    Object.keys(filters).length > 0 ? filters : undefined,
  );

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  if (!studentId || !validStudentId) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {studentId && !validStudentId ? "Invalid student ID." : "Missing student."}{" "}
              <Link href="/dashboard/admin/quran/students" className="text-primary underline">Students</Link> or{" "}
              <Link href="/dashboard/admin/quran/reports" className="text-primary underline">Reports</Link>.
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Student content analysis</h1>
            <p className="text-sm text-muted-foreground">
              Strong/weak surahs and juz, recommendations
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/quran/reports/student/${studentId}`}>
              <Button variant="outline">Student report</Button>
            </Link>
            <Link href={`/dashboard/admin/quran/reports/student/${studentId}/trend`}>
              <Button variant="outline">Trend</Button>
            </Link>
            <Link href="/dashboard/admin/quran/reports">
              <Button variant="outline">← Reports</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Optional date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From" className="max-w-[180px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" className="max-w-[180px]" />
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
            </div>
            {!dateRangeValidation.valid && dateRangeValidation.message && (
              <p className="text-destructive text-sm mb-4">{dateRangeValidation.message}</p>
            )}
            {isError && (
              <p className="text-destructive text-sm mb-4">
                {error ? getApiErrorMessage(error) : "Failed to load."}
              </p>
            )}

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-[320px] w-full" />
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[280px] w-full" />
              </div>
            ) : report ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">{report.student.nameEn}</CardTitle>
                    <CardDescription>{report.student.class} · Content analysis</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Surah strength (strong vs weak)</CardTitle>
                    <CardDescription>Avg mistakes by surah</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SurahStrengthChart
                      strong={report.surahAnalysis.strong}
                      weak={report.surahAnalysis.weak}
                      height={320}
                    />
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Juz heatmap</CardTitle>
                    <CardDescription>Performance by Juz (1–30)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JuzHeatmap data={report.juzAnalysis.all} height={200} />
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Surah bubble chart</CardTitle>
                    <CardDescription>Tests count vs avg mistakes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContentBubbleChart data={report.surahAnalysis.all} height={280} />
                  </CardContent>
                </Card>

                {report.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recommendations</CardTitle>
                      <CardDescription>Actionable insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {report.recommendations.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 rounded border p-3">
                            <Badge variant={r.priority === "high" ? "destructive" : r.priority === "medium" ? "default" : "secondary"} className="shrink-0 capitalize">
                              {r.priority}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{r.content}</p>
                              <p className="text-xs text-muted-foreground">{r.basedOn}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <p className="text-muted-foreground py-4">No data. Adjust filters or ensure entries with content exist.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
