"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStudentTrendQuery } from "@/hooks/use-quran-reports";
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
import { StudentProgressChart } from "@/components/quran/charts";
import { isValidMongoId, isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function StudentTrendPage() {
  const routeParams = useParams();
  const studentId = routeParams?.id as string | undefined;

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
  const { data: report, isLoading, isError, error } = useStudentTrendQuery(
    validStudentId ? studentId : undefined,
    Object.keys(filters).length > 0 ? filters : undefined,
  );

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const trendVariant =
    report?.overallSummary.trend === "improving"
      ? "default"
      : report?.overallSummary.trend === "declining"
        ? "destructive"
        : "secondary";

  if (!studentId || !validStudentId) {
    return (
      <ProtectedRoute>
        <div className="p-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {studentId && !validStudentId
                ? "Invalid student ID."
                : "Missing student."}{" "}
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
            <h1 className="text-2xl font-semibold">Student trend</h1>
            <p className="text-sm text-muted-foreground">
              Progress over time and moving average
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/admin/quran/reports/student/${studentId}`}>
              <Button variant="outline">Student report</Button>
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
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : report ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">{report.student.nameEn}</CardTitle>
                    <CardDescription>
                      {report.student.class} · Trend:{" "}
                      <Badge variant={trendVariant} className="capitalize">{report.overallSummary.trend}</Badge>
                      {" "}· Improvement: {report.overallSummary.improvementRate >= 0 ? "+" : ""}
                      {report.overallSummary.improvementRate.toFixed(1)}%
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid gap-4 md:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{report.overallSummary.totalEntries}</div>
                      <p className="text-xs text-muted-foreground">Entries</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{report.overallSummary.avgTanbih.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">Avg Tanbih</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{report.overallSummary.avgFath.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">Avg Fath</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{(report.overallSummary.testCompletionRate * 100).toFixed(0)}%</div>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Progress & moving average</CardTitle>
                    <CardDescription>Total mistakes and moving average over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudentProgressChart
                      timeline={report.timeline}
                      movingAverage={report.movingAverage}
                      height={300}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">By test type</CardTitle>
                    <CardDescription>Avg Tanbih / Fath and trend per type</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="rounded border p-4">
                      <p className="font-medium text-sm">New</p>
                      <p className="text-muted-foreground text-sm">Tanbih: {report.byTestType.new.avgTanbih.toFixed(1)} · Fath: {report.byTestType.new.avgFath.toFixed(1)}</p>
                      <Badge variant="secondary" className="mt-1 capitalize text-xs">{report.byTestType.new.trend}</Badge>
                    </div>
                    <div className="rounded border p-4">
                      <p className="font-medium text-sm">Recent</p>
                      <p className="text-muted-foreground text-sm">Tanbih: {report.byTestType.recent.avgTanbih.toFixed(1)} · Fath: {report.byTestType.recent.avgFath.toFixed(1)}</p>
                      <Badge variant="secondary" className="mt-1 capitalize text-xs">{report.byTestType.recent.trend}</Badge>
                    </div>
                    <div className="rounded border p-4">
                      <p className="font-medium text-sm">Older</p>
                      <p className="text-muted-foreground text-sm">Tanbih: {report.byTestType.older.avgTanbih.toFixed(1)} · Fath: {report.byTestType.older.avgFath.toFixed(1)}</p>
                      <Badge variant="secondary" className="mt-1 capitalize text-xs">{report.byTestType.older.trend}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-muted-foreground py-4">No data. Adjust filters or ensure entries exist.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
