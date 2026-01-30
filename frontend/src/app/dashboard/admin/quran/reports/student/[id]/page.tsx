"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuranStudentReportQuery } from "@/hooks/use-quran-reports";
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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranReportFilters } from "@/types/quran.types";
import { QuranWeeklyTrendChart } from "@/components/quran/charts";
import { isValidMongoId, isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function QuranStudentReportPage() {
  const params = useParams();
  const studentId = params?.id as string | undefined;

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate
        ? isValidDateRange(startDate, endDate)
        : { valid: true },
    [startDate, endDate],
  );

  const filters: Pick<IQuranReportFilters, "startDate" | "endDate"> =
    useMemo(() => {
      if (!dateRangeValidation.valid) return {};
      return {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };
    }, [startDate, endDate, dateRangeValidation.valid]);

  const validStudentId = studentId && isValidMongoId(studentId);
  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useQuranStudentReportQuery(
    validStudentId ? studentId : undefined,
    Object.keys(filters).length > 0 ? filters : undefined,
  );

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  // Normalize weeklyTrend for chart (weekStart may be string or Date from API)
  const weeklyTrendForChart = report?.weeklyTrend?.map((w) => ({
    ...w,
    weekStart:
      typeof w.weekStart === "string"
        ? w.weekStart
        : ((w.weekStart as Date).toISOString?.() ?? String(w.weekStart)),
  }));

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Student report</h1>
            <p className="text-sm text-muted-foreground">
              Per-student revision summary, weekly trend, and common issues
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/dashboard/admin/quran/reports/student/${studentId}/trend`}>
              <Button variant="outline">Trend</Button>
            </Link>
            <Link href={`/dashboard/admin/quran/reports/student/${studentId}/content`}>
              <Button variant="outline">Content analysis</Button>
            </Link>
            <Link href="/dashboard/admin/quran/reports">
              <Button variant="outline">← Reports</Button>
            </Link>
          </div>
        </div>

        {!studentId || !validStudentId ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {studentId && !validStudentId
                ? "Invalid student ID. Use a valid 24-character ID from the students list."
                : "Invalid student. Go back to"}{" "}
              <Link
                href="/dashboard/admin/quran/students"
                className="text-primary underline"
              >
                Quran Students
              </Link>{" "}
              or{" "}
              <Link
                href="/dashboard/admin/quran/reports"
                className="text-primary underline"
              >
                Reports
              </Link>
              .
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>
                Optional date range for this student&apos;s entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="From"
                  className="max-w-[180px]"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="To"
                  className="max-w-[180px]"
                />
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>

              {!dateRangeValidation.valid && dateRangeValidation.message && (
                <p className="text-destructive text-sm mb-4">
                  {dateRangeValidation.message}
                </p>
              )}

              {isLoading ? (
                <div className="space-y-6">
                  <Card className="mb-6">
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32 mt-2" />
                    </CardHeader>
                  </Card>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <Skeleton className="h-4 w-16 mb-2" />
                          <Skeleton className="h-8 w-12" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                  <Card className="mb-6">
                    <CardHeader>
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-56 mt-1" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : isError ? (
                <p className="text-destructive py-4">
                  {error
                    ? getApiErrorMessage(error)
                    : "Failed to load student report."}
                </p>
              ) : report ? (
                <>
                  {/* Student info card */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base">
                        {report.student.nameEn}
                        {report.student.nameBn && (
                          <span className="font-normal text-muted-foreground ml-2">
                            ({report.student.nameBn})
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        ID: {report.student.studentId} · Class:{" "}
                        {report.student.class}
                        {report.student.supervision && (
                          <Badge variant="secondary" className="ml-2">
                            Supervision
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Summary stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Entries</CardDescription>
                        <CardTitle className="text-2xl">
                          {report.summary.totalEntries}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Avg Tanbih</CardDescription>
                        <CardTitle className="text-2xl">
                          {report.summary.avgTanbih.toFixed(1)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Avg Fath</CardDescription>
                        <CardTitle className="text-2xl">
                          {report.summary.avgFath.toFixed(1)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Avg mistakes</CardDescription>
                        <CardTitle className="text-2xl">
                          {report.summary.avgTotalMistakes.toFixed(1)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Test completion</CardDescription>
                        <CardTitle className="text-2xl">
                          {report.summary.testCompletionRate.toFixed(0)}%
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Weekly trend chart */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Weekly trend (this student)
                      </CardTitle>
                      <CardDescription>
                        Total mistakes, Tanbih, and Fath per week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <QuranWeeklyTrendChart
                        weeks={weeklyTrendForChart ?? []}
                        height={300}
                        emptyMessage="No weekly data for this period"
                      />
                    </CardContent>
                  </Card>

                  {/* Entry history table */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base">Entry history</CardTitle>
                      <CardDescription>
                        All revision entries in the selected period
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      {report.entries.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Ustad</TableHead>
                              <TableHead className="text-right">
                                Tests given
                              </TableHead>
                              <TableHead className="text-right">
                                Tests missed
                              </TableHead>
                              <TableHead className="text-right">
                                Tanbih
                              </TableHead>
                              <TableHead className="text-right">Fath</TableHead>
                              <TableHead className="text-right">
                                Total mistakes
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.entries.map((entry) => (
                              <TableRow key={entry._id}>
                                <TableCell className="font-medium">
                                  {formatDate(entry.reportDate)}
                                </TableCell>
                                <TableCell>{entry.ustadName ?? "—"}</TableCell>
                                <TableCell className="text-right">
                                  {entry.testsGiven}
                                </TableCell>
                                <TableCell className="text-right">
                                  {entry.testsMissed}
                                </TableCell>
                                <TableCell className="text-right">
                                  {entry.totalTanbih}
                                </TableCell>
                                <TableCell className="text-right">
                                  {entry.totalFath}
                                </TableCell>
                                <TableCell className="text-right">
                                  {entry.totalMistakes}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-muted-foreground py-4">
                          No entries in this period. Adjust filters or add
                          entries for this student.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Common issues (Tajweed notes) */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Common issues (from Tajweed notes)
                      </CardTitle>
                      <CardDescription>
                        Recurring notes across entries
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Harf</h4>
                          {report.commonIssues.harf.length > 0 ? (
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {report.commonIssues.harf.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              None recorded
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Ghunna</h4>
                          {report.commonIssues.ghunna.length > 0 ? (
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {report.commonIssues.ghunna.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              None recorded
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Madd</h4>
                          {report.commonIssues.madd.length > 0 ? (
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {report.commonIssues.madd.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              None recorded
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Other</h4>
                          {report.commonIssues.other.length > 0 ? (
                            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                              {report.commonIssues.other.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              None recorded
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p className="text-muted-foreground py-4">
                  No report data. The student may not exist or have no entries
                  in the selected period.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
