"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuranOverallReportQuery } from "@/hooks/use-quran-reports";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranReportFilters } from "@/types/quran.types";
import {
  QuranMistakeDistributionChart,
  QuranMistakesByTestTypeChart,
} from "@/components/quran/charts";

function formatDateRange(start: string, end: string): string {
  try {
    const s = new Date(start).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const e = new Date(end).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${s} – ${e}`;
  } catch {
    return `${start} – ${end}`;
  }
}

export default function QuranReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<
    "all" | "true" | "false"
  >("all");

  const filters: IQuranReportFilters = useMemo(
    () => ({
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
    }),
    [startDate, endDate, classFilter, supervisionFilter],
  );

  const { data: report, isLoading } = useQuranOverallReportQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  const barData = report?.byTestType
    ? [
        {
          name: "New",
          tanbih: report.byTestType.new.tanbih,
          fath: report.byTestType.new.fath,
        },
        {
          name: "Recent",
          tanbih: report.byTestType.recent.tanbih,
          fath: report.byTestType.recent.fath,
        },
        {
          name: "Older",
          tanbih: report.byTestType.older.tanbih,
          fath: report.byTestType.older.fath,
        },
      ]
    : [];

  const testCompletionRate =
    report?.summary && report.summary.totalReports > 0
      ? (report.summary.totalTestsGiven / (report.summary.totalReports * 3)) *
        100
      : 0;

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Quran Reports</h1>
            <p className="text-sm text-muted-foreground">
              Overall dashboard and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/admin/quran/reports/weekly">
              <Button variant="outline">Weekly summary</Button>
            </Link>
            <Link href="/dashboard/admin/quran/reports/class">
              <Button variant="outline">Class breakdown</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overall report</CardTitle>
            <CardDescription>
              KPIs and mistake distribution for the selected period (default:
              last 365 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
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
              <Input
                placeholder="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="max-w-[180px]"
              />
              <Select
                value={supervisionFilter}
                onValueChange={(v) =>
                  setSupervisionFilter(v as "all" | "true" | "false")
                }
              >
                <SelectTrigger className="max-w-[180px]">
                  <SelectValue placeholder="Supervision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : report ? (
              <>
                {report.dateRange && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Period:{" "}
                    {formatDateRange(
                      report.dateRange.start,
                      report.dateRange.end,
                    )}
                  </p>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {report.totalStudents}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total students
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {report.activeStudents}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active students
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {report.totalEntries}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Entries (in period)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {report.summary.avgMistakesPerStudent.toFixed(1)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Avg mistakes per student
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {testCompletionRate.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Test completion rate
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>
                        Total reports:{" "}
                        <strong>{report.summary.totalReports}</strong>
                      </p>
                      <p>
                        Tests given:{" "}
                        <strong>{report.summary.totalTestsGiven}</strong>
                      </p>
                      <p>
                        Tests missed:{" "}
                        <strong>{report.summary.totalTestsMissed}</strong>
                      </p>
                      <p>
                        Total Tanbih:{" "}
                        <strong>{report.summary.totalTanbih}</strong>
                      </p>
                      <p>
                        Total Fath: <strong>{report.summary.totalFath}</strong>
                      </p>
                      <p>
                        Total mistakes:{" "}
                        <strong>{report.summary.totalMistakes}</strong>
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">By test type</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        New: Tanbih {report.byTestType.new.tanbih}, Fath{" "}
                        {report.byTestType.new.fath}, Given{" "}
                        {report.byTestType.new.givenCount}
                      </p>
                      <p>
                        Recent: Tanbih {report.byTestType.recent.tanbih}, Fath{" "}
                        {report.byTestType.recent.fath}, Given{" "}
                        {report.byTestType.recent.givenCount}
                      </p>
                      <p>
                        Older: Tanbih {report.byTestType.older.tanbih}, Fath{" "}
                        {report.byTestType.older.fath}, Given{" "}
                        {report.byTestType.older.givenCount}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Mistake distribution (Tanbih vs Fath)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuranMistakeDistributionChart
                        totalTanbih={report.summary.totalTanbih}
                        totalFath={report.summary.totalFath}
                        height={240}
                        emptyMessage="No mistake data in this period"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Mistakes by test type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuranMistakesByTestTypeChart
                        data={barData}
                        height={240}
                        emptyMessage="No test data in this period"
                      />
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground py-4">
                No report data. Adjust filters or ensure entries exist for the
                period.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
