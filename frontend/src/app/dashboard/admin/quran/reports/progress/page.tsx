"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useProgressReportQuery } from "@/hooks/use-quran-reports";
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
import type { IQuranProgressFilters } from "@/types/quran.types";
import {
  ReportPageSkeleton,
  ReportErrorAlert,
  EmptyState,
} from "@/components/quran/reports";
import {
  MasteryGauge,
  MasteryDistributionChart,
  ImprovementLeaderboard,
  MilestoneTracker,
} from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

function trendVariant(
  trend: "improving" | "declining" | "stable",
): "default" | "secondary" | "destructive" | "outline" {
  if (trend === "improving") return "default";
  if (trend === "declining") return "destructive";
  return "secondary";
}

export default function ProgressReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranProgressFilters = useMemo(() => {
    const base: IQuranProgressFilters = {
      ...(classFilter.trim() && { class: classFilter.trim() }),
    };
    if (!dateRangeValidation.valid) return base;
    const result = {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(selectedStudentId && { studentId: selectedStudentId }),
    };
    return result;
  }, [startDate, endDate, classFilter, selectedStudentId, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error, refetch } =
    useProgressReportQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSelectedStudentId("");
  };

  const selectedStudent = useMemo(() => {
    if (!report?.students || !selectedStudentId) return null;
    return report.students.find((s) => s.student._id === selectedStudentId) ?? null;
  }, [report?.students, selectedStudentId]);

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">
              Progress & mastery
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Mastery score, improvement velocity, and milestones
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
              Date range, class, optional student
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
              <Select
                value={selectedStudentId || "all"}
                onValueChange={(v) => setSelectedStudentId(v === "all" ? "" : v)}
              >
                <SelectTrigger className="w-full min-w-0 max-w-[220px]">
                  <SelectValue placeholder="Student (all)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All students</SelectItem>
                  {report?.students.map((s) => (
                    <SelectItem key={s.student._id} value={s.student._id}>
                      {s.student.nameEn} ({s.student.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                filterCount={4}
                statCount={4}
                chartCount={2}
                chartHeight={200}
              />
            ) : report ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="pt-6 flex flex-col items-center">
                      <MasteryGauge
                        value={report.summary.avgMasteryScore}
                        grade={
                          report.summary.avgMasteryScore >= 90
                            ? "A"
                            : report.summary.avgMasteryScore >= 80
                              ? "B"
                              : report.summary.avgMasteryScore >= 70
                                ? "C"
                                : report.summary.avgMasteryScore >= 60
                                  ? "D"
                                  : "F"
                        }
                        label="Avg mastery"
                        size={72}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {report.summary.studentsImproving}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Improving ({report.summary.totalStudents > 0
                          ? ((report.summary.studentsImproving / report.summary.totalStudents) * 100).toFixed(0)
                          : 0}%)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-destructive">
                        {report.summary.studentsDeclining}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Declining ({report.summary.totalStudents > 0
                          ? ((report.summary.studentsDeclining / report.summary.totalStudents) * 100).toFixed(0)
                          : 0}%)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {report.summary.studentsStable}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Stable ({report.summary.totalStudents > 0
                          ? ((report.summary.studentsStable / report.summary.totalStudents) * 100).toFixed(0)
                          : 0}%)
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Mastery distribution</CardTitle>
                      <CardDescription>Students by grade (A–F)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MasteryDistributionChart
                        distribution={report.masteryDistribution}
                        height={220}
                        emptyMessage="No distribution data"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Improvement leaderboard</CardTitle>
                      <CardDescription>Top by improvement velocity (% fewer mistakes)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ImprovementLeaderboard
                        data={report.improvementLeaderboard}
                        title=""
                        maxRows={10}
                        emptyMessage="No data"
                      />
                    </CardContent>
                  </Card>
                </div>

                {selectedStudent && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Selected student</CardTitle>
                        <CardDescription>
                          {selectedStudent.student.nameEn} ({selectedStudent.student.class})
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center">
                        <MasteryGauge
                          value={selectedStudent.progress.masteryScore}
                          grade={selectedStudent.progress.masteryGrade}
                          label="Mastery"
                          size={100}
                        />
                        <div className="mt-4 flex gap-2">
                          <Badge variant={trendVariant(selectedStudent.progress.trend)}>
                            {selectedStudent.progress.trend}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Velocity: {selectedStudent.progress.improvementVelocity >= 0 ? "+" : ""}
                            {selectedStudent.progress.improvementVelocity.toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Milestones</CardTitle>
                        <CardDescription>Achievements in this period</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MilestoneTracker
                          milestones={selectedStudent.progress.milestones}
                          emptyMessage="No milestones in this period"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student detail</CardTitle>
                    <CardDescription>
                      Mastery score, grade, trend, improvement velocity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-right">Mastery</TableHead>
                          <TableHead className="text-right">Grade</TableHead>
                          <TableHead>Trend</TableHead>
                          <TableHead className="text-right">Velocity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.students.map((s) => (
                          <TableRow
                            key={s.student._id}
                            className={selectedStudentId === s.student._id ? "bg-muted/50" : undefined}
                          >
                            <TableCell>
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedStudentId(
                                    selectedStudentId === s.student._id ? "" : s.student._id,
                                  )
                                }
                                className="text-left font-medium hover:underline"
                              >
                                {s.student.nameEn}
                              </button>
                              <span className="text-muted-foreground text-xs ml-1">
                                ({s.student.class})
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {s.progress.masteryScore}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{s.progress.masteryGrade}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={trendVariant(s.progress.trend)}>
                                {s.progress.trend}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {s.progress.improvementVelocity >= 0 ? "+" : ""}
                              {s.progress.improvementVelocity.toFixed(1)}%
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
                title="No progress data"
                description="Adjust filters or ensure at least 2 entries per student in the period."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
