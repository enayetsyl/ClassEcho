"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useComparativeReportQuery } from "@/hooks/use-quran-reports";
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
import type { IQuranComparativeFilters } from "@/types/quran.types";
import {
  ReportPageSkeleton,
  ReportErrorAlert,
  EmptyState,
} from "@/components/quran/reports";
import {
  ClassRankingChart,
  PeerComparisonRadar,
  PercentileGauge,
  UstadEffectivenessChart,
  DistributionHistogram,
} from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function ComparativeReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [compareBy, setCompareBy] = useState<"class" | "supervision" | "all">("all");
  const [studentId, setStudentId] = useState("");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranComparativeFilters = useMemo(() => {
    const base: IQuranComparativeFilters = {
      ...(classFilter.trim() && { class: classFilter.trim() }),
      compareBy,
      ...(studentId && { studentId }),
    };
    if (!dateRangeValidation.valid) return base;
    return {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate, classFilter, compareBy, studentId, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error, refetch } =
    useComparativeReportQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setCompareBy("all");
    setStudentId("");
  };

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">
              Comparative metrics
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Class rankings, student rankings, peer comparison, ustad effectiveness
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
              Date range, class, compare by, optional student for peer comparison
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
                value={compareBy}
                onValueChange={(v) => setCompareBy(v as "class" | "supervision" | "all")}
              >
                <SelectTrigger className="w-full min-w-0 max-w-[160px]">
                  <SelectValue placeholder="Compare by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="class">By class</SelectItem>
                  <SelectItem value="supervision">By supervision</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={studentId || "none"}
                onValueChange={(v) => setStudentId(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full min-w-0 max-w-[220px]">
                  <SelectValue placeholder="Student (peer comparison)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No student</SelectItem>
                  {report?.studentRankings.map((r) => (
                    <SelectItem key={r.student._id} value={r.student._id}>
                      {r.student.nameEn} ({r.student.class})
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
                filterCount={5}
                statCount={2}
                chartCount={3}
                chartHeight={220}
              />
            ) : report ? (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Class rankings</CardTitle>
                      <CardDescription>Avg mastery and mistakes by class</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClassRankingChart
                        classRankings={report.classRankings}
                        height={260}
                        emptyMessage="No class rankings"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ustad effectiveness</CardTitle>
                      <CardDescription>Avg student improvement by ustad</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UstadEffectivenessChart
                        ustadComparison={report.ustadComparison}
                        height={260}
                        emptyMessage="No ustad data"
                      />
                    </CardContent>
                  </Card>
                </div>

                {report.peerComparison && (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Peer comparison</CardTitle>
                        <CardDescription>
                          Student vs class average vs top 25% (radar)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PeerComparisonRadar
                          peerComparison={report.peerComparison}
                          height={280}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Position</CardTitle>
                        <CardDescription>
                          {report.peerComparison.comparison.overallPosition}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center">
                        <PercentileGauge
                          value={
                            report.studentRankings.find(
                              (r) => r.student._id === report.peerComparison?.targetStudent._id,
                            )?.percentile ?? 0
                          }
                          label="Percentile (vs all in scope)"
                          size={120}
                        />
                        <div className="mt-4 text-sm space-y-1 text-center">
                          <p>
                            vs Tanbih avg:{" "}
                            {report.peerComparison.comparison.vsTanbihAvg >= 0 ? "+" : ""}
                            {report.peerComparison.comparison.vsTanbihAvg.toFixed(1)}%
                          </p>
                          <p>
                            vs Fath avg:{" "}
                            {report.peerComparison.comparison.vsFathAvg >= 0 ? "+" : ""}
                            {report.peerComparison.comparison.vsFathAvg.toFixed(1)}%
                          </p>
                          <p>
                            vs Mastery avg:{" "}
                            {report.peerComparison.comparison.vsMasteryAvg >= 0 ? "+" : ""}
                            {report.peerComparison.comparison.vsMasteryAvg.toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Distribution</CardTitle>
                    <CardDescription>Mistakes and mastery score histograms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DistributionHistogram
                      mistakesHistogram={report.distribution.mistakesHistogram}
                      masteryHistogram={report.distribution.masteryHistogram}
                      height={280}
                      emptyMessage="No distribution data"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student rankings</CardTitle>
                    <CardDescription>Rank, mastery, percentile, rank change</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto min-w-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead className="text-right">Avg mistakes</TableHead>
                          <TableHead className="text-right">Mastery</TableHead>
                          <TableHead className="text-right">Percentile</TableHead>
                          <TableHead className="text-right">Rank Δ</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.studentRankings.map((r) => (
                          <TableRow
                            key={r.student._id}
                            className={studentId === r.student._id ? "bg-muted/50" : undefined}
                          >
                            <TableCell className="tabular-nums font-medium">
                              {r.rank}
                            </TableCell>
                            <TableCell>
                              <button
                                type="button"
                                onClick={() =>
                                  setStudentId(studentId === r.student._id ? "" : r.student._id)
                                }
                                className="font-medium hover:underline text-left"
                              >
                                {r.student.nameEn}
                              </button>
                              <span className="text-muted-foreground text-xs ml-1">
                                ({r.student.class})
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.avgMistakes.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.masteryScore}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.percentile}%
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.rankChange > 0 ? (
                                <Badge variant="default" className="bg-green-600">+{r.rankChange}</Badge>
                              ) : r.rankChange < 0 ? (
                                <Badge variant="destructive">{r.rankChange}</Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
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
                title="No comparative data"
                description="Adjust filters or ensure entries exist for the period."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
