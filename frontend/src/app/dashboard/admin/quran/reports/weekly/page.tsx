"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuranWeeklySummaryQuery } from "@/hooks/use-quran-reports";
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
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

function formatWeekDate(iso: string): string {
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

export default function QuranWeeklyTrendPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<
    "all" | "true" | "false"
  >("all");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate
        ? isValidDateRange(startDate, endDate)
        : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranReportFilters = useMemo(() => {
    const base: IQuranReportFilters = {
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
    };
    if (!dateRangeValidation.valid) return base;
    return {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [
    startDate,
    endDate,
    classFilter,
    supervisionFilter,
    dateRangeValidation.valid,
  ]);

  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useQuranWeeklySummaryQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  const trendVariant =
    report?.trend === "improving"
      ? "default"
      : report?.trend === "declining"
        ? "destructive"
        : "secondary";

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Weekly trend report</h1>
            <p className="text-sm text-muted-foreground">
              Mistake trends by week (default: last 365 days)
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports">
            <Button variant="outline">← Overall report</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Optional date range, class, and supervision filters
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

            {!dateRangeValidation.valid && dateRangeValidation.message && (
              <p className="text-destructive text-sm mb-4">
                {dateRangeValidation.message}
              </p>
            )}

            {isError && (
              <p className="text-destructive text-sm mb-4">
                {error ? getApiErrorMessage(error) : "Failed to load report."}
              </p>
            )}

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[280px] w-full" />
              </div>
            ) : report ? (
              <>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Trend:
                    </span>
                    <Badge variant={trendVariant} className="capitalize">
                      {report.trend}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg change:{" "}
                    <span
                      className={
                        report.avgMistakesChange < 0
                          ? "text-green-600 font-medium"
                          : report.avgMistakesChange > 0
                            ? "text-red-600 font-medium"
                            : "font-medium"
                      }
                    >
                      {report.avgMistakesChange >= 0 ? "+" : ""}
                      {report.avgMistakesChange.toFixed(1)}%
                    </span>{" "}
                    (first half vs second half of period)
                  </div>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Weekly trend chart
                    </CardTitle>
                    <CardDescription>
                      Total mistakes, Tanbih, and Fath per week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuranWeeklyTrendChart
                      weeks={report.weeks}
                      height={300}
                      emptyMessage="No weekly data for this period"
                    />
                  </CardContent>
                </Card>

                {report.weeks.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Weekly summary table
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Week</TableHead>
                            <TableHead className="text-right">
                              Reports
                            </TableHead>
                            <TableHead className="text-right">
                              Tests missed
                            </TableHead>
                            <TableHead className="text-right">Tanbih</TableHead>
                            <TableHead className="text-right">Fath</TableHead>
                            <TableHead className="text-right">
                              Total mistakes
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {report.weeks.map((w, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">
                                {formatWeekDate(w.weekStart)}
                              </TableCell>
                              <TableCell className="text-right">
                                {w.reports}
                              </TableCell>
                              <TableCell className="text-right">
                                {w.testsMissed}
                              </TableCell>
                              <TableCell className="text-right">
                                {w.totalTanbih}
                              </TableCell>
                              <TableCell className="text-right">
                                {w.totalFath}
                              </TableCell>
                              <TableCell className="text-right">
                                {w.totalMistakes}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {report.weeks.length === 0 && (
                  <p className="text-muted-foreground py-4">
                    No weekly data. Adjust filters or ensure entries exist for
                    the period.
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground py-4">
                No report data. Adjust filters or ensure entries exist.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
