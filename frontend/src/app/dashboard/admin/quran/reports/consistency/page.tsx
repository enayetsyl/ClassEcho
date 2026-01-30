"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useConsistencyReportQuery } from "@/hooks/use-quran-reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranConsistencyFilters } from "@/types/quran.types";
import {
  ReportPageSkeleton,
  ReportErrorAlert,
  EmptyState,
} from "@/components/quran/reports";
import {
  ConsistencyCalendarHeatmap,
  StreakLeaderboard,
  AttendanceProgressRing,
} from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

function statusVariant(
  status: "excellent" | "good" | "warning" | "critical",
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "excellent") return "default";
  if (status === "critical") return "destructive";
  if (status === "warning") return "outline";
  return "secondary";
}

export default function ConsistencyReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [minEntries, setMinEntries] = useState<string>("4");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranConsistencyFilters = useMemo(() => {
    const base: IQuranConsistencyFilters = {
      ...(classFilter.trim() && { class: classFilter.trim() }),
    };
    if (!dateRangeValidation.valid) return base;
    const result = {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
    const min = parseInt(minEntries, 10);
    if (!isNaN(min) && min > 0) result.minEntries = min;
    return result;
  }, [startDate, endDate, classFilter, minEntries, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error, refetch } =
    useConsistencyReportQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setMinEntries("4");
  };

  const atRiskStudents = report?.students.filter((s) => s.status === "critical") ?? [];

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">
              Consistency & attendance
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Streaks, attendance rate, and test regularity
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports" className="shrink-0">
            <Button variant="outline" size="sm" className="sm:size-default">
              ← Reports
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-2 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Date range, class, min entries for inclusion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="From"
                className="w-full min-w-0 max-w-[180px]"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="To"
                className="w-full min-w-0 max-w-[180px]"
              />
              <Input
                placeholder="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full min-w-0 max-w-[180px]"
              />
              <Input
                type="number"
                min={1}
                placeholder="Min entries"
                value={minEntries}
                onChange={(e) => setMinEntries(e.target.value)}
                className="w-full min-w-0 max-w-[120px]"
              />
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            </div>

            {!dateRangeValidation.valid && dateRangeValidation.message && (
              <p className="text-destructive text-xs sm:text-sm mb-4">
                {dateRangeValidation.message}
              </p>
            )}
            {isError && (
              <ReportErrorAlert
                message={error ? getApiErrorMessage(error) : "Failed to load."}
                onRetry={() => refetch()}
                className="mb-4"
              />
            )}

            {isLoading ? (
              <ReportPageSkeleton
                filterCount={5}
                statCount={4}
                chartCount={2}
                chartHeight={200}
              />
            ) : report ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <AttendanceProgressRing
                        value={report.summary.avgAttendanceRate}
                        label="Avg attendance"
                        size={72}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <AttendanceProgressRing
                        value={report.summary.avgTestRegularityScore}
                        label="Test regularity"
                        size={72}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {report.summary.studentsWithPerfectAttendance}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Perfect attendance
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-destructive">
                        {report.summary.studentsAtRisk}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        At risk
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Calendar heatmap</CardTitle>
                    <CardDescription>
                      Entry activity by day (full / partial / missing)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConsistencyCalendarHeatmap
                      data={report.calendarData}
                      emptyMessage="No calendar data for this range"
                    />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Streak leaderboard</CardTitle>
                      <CardDescription>Top by current streak</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StreakLeaderboard
                        data={report.streakLeaderboard}
                        title="Top streaks"
                        maxRows={10}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">At-risk students</CardTitle>
                      <CardDescription>Low attendance or gaps</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {atRiskStudents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No at-risk students in this range.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {atRiskStudents.slice(0, 10).map((s) => (
                            <li
                              key={s.student._id}
                              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                            >
                              <span>
                                {s.student.nameEn}{" "}
                                <span className="text-muted-foreground">
                                  ({s.student.class})
                                </span>
                              </span>
                              <Badge variant="destructive">
                                {s.metrics.attendanceRate.toFixed(0)}% · {s.metrics.consecutiveMissedWeeks} wks gap
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student detail</CardTitle>
                    <CardDescription>
                      Attendance, streak, last entry, status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-right">Attendance</TableHead>
                          <TableHead className="text-right">Regularity</TableHead>
                          <TableHead className="text-right">Streak</TableHead>
                          <TableHead className="text-right">Missed wks</TableHead>
                          <TableHead>Last entry</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.students.map((s) => (
                          <TableRow key={s.student._id}>
                            <TableCell>
                              {s.student.nameEn}
                              <span className="text-muted-foreground text-xs ml-1">
                                ({s.student.class})
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {s.metrics.attendanceRate.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right">
                              {s.metrics.testRegularityScore.toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-right">
                              {s.metrics.currentStreak} / {s.metrics.longestStreak}
                            </TableCell>
                            <TableCell className="text-right">
                              {s.metrics.missedWeeks}
                            </TableCell>
                            <TableCell>
                              {s.metrics.lastEntryDate ?? "—"}
                              {s.metrics.daysSinceLastEntry != null && (
                                <span className="text-muted-foreground text-xs ml-1">
                                  ({s.metrics.daysSinceLastEntry}d ago)
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(s.status)} className="capitalize">
                                {s.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <EmptyState
                title="No consistency data"
                description="Adjust filters or ensure entries exist (min entries met)."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
