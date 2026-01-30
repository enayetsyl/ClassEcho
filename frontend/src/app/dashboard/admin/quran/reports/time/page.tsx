"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTimeAnalysisQuery } from "@/hooks/use-quran-reports";
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
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranReportFiltersExtended } from "@/types/quran.types";
import { TimeSeriesChart, SupervisionComparisonArea } from "@/components/quran/charts";
import { ReportPageSkeleton, ReportErrorAlert, EmptyState } from "@/components/quran/reports";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function TimeAnalysisPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<"all" | "true" | "false">("all");
  const [granularity, setGranularity] = useState<"day" | "week" | "month">("week");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranReportFiltersExtended = useMemo(() => {
    const base: IQuranReportFiltersExtended = {
      granularity,
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
    };
    if (!dateRangeValidation.valid) return base;
    return {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate, classFilter, supervisionFilter, granularity, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error, refetch } = useTimeAnalysisQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  const trendVariant =
    report?.comparison.trend === "improving"
      ? "default"
      : report?.comparison.trend === "declining"
        ? "destructive"
        : "secondary";

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">Time analysis</h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Trends over time with granularity (day/week/month)
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports">
            <Button variant="outline">← Reports</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Date range, granularity, class, supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From" className="max-w-[180px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" className="max-w-[180px]" />
              <Select value={granularity} onValueChange={(v) => setGranularity(v as "day" | "week" | "month")}>
                <SelectTrigger className="max-w-[140px]">
                  <SelectValue placeholder="Granularity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="max-w-[180px]" />
              <Select value={supervisionFilter} onValueChange={(v) => setSupervisionFilter(v as "all" | "true" | "false")}>
                <SelectTrigger className="max-w-[180px]">
                  <SelectValue placeholder="Supervision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
            </div>

            {!dateRangeValidation.valid && dateRangeValidation.message && (
              <p className="text-destructive text-sm mb-4">{dateRangeValidation.message}</p>
            )}
            {isError && (
              <ReportErrorAlert
                message={error ? getApiErrorMessage(error) : "Failed to load report."}
                onRetry={() => refetch()}
                className="mb-4"
              />
            )}

            {isLoading ? (
              <ReportPageSkeleton filterCount={6} statCount={0} chartCount={2} chartHeight={300} />
            ) : report ? (
              <>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="text-sm text-muted-foreground">Trend:</span>
                  <Badge variant={trendVariant} className="capitalize">
                    {report.comparison.trend}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Change: {report.comparison.percentageChange >= 0 ? "+" : ""}
                    {report.comparison.percentageChange.toFixed(1)}% (first vs second half)
                  </span>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Time series</CardTitle>
                    <CardDescription>Tanbih, Fath, and mistakes over time ({report.granularity})</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TimeSeriesChart data={report.data} granularity={report.granularity} height={300} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Supervised vs unsupervised</CardTitle>
                    <CardDescription>Tanbih + Fath by supervision over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SupervisionComparisonArea data={report.data} height={260} />
                  </CardContent>
                </Card>
              </>
            ) : (
              <EmptyState title="No report data" description="Adjust filters or ensure entries exist." />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
