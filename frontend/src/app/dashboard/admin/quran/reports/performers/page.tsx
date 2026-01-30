"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePerformersQuery } from "@/hooks/use-quran-reports";
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
import type { IQuranReportFiltersExtended } from "@/types/quran.types";
import { LeaderboardTable } from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function PerformersPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<"all" | "true" | "false">("all");
  const [testType, setTestType] = useState<string>("all");
  const [metric, setMetric] = useState<string>("avgMistakes");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranReportFiltersExtended = useMemo(() => {
    const base: IQuranReportFiltersExtended = {
      testType: testType as "all" | "new" | "recent" | "older",
      metric,
      limit: 10,
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
    };
    if (!dateRangeValidation.valid) return base;
    return {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate, classFilter, supervisionFilter, testType, metric, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error } = usePerformersQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Performers</h1>
            <p className="text-sm text-muted-foreground">
              Top and worst performers by metric and test type
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports">
            <Button variant="outline">← Reports</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Date range, test type, metric, class, supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From" className="max-w-[180px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" className="max-w-[180px]" />
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger className="max-w-[140px]">
                  <SelectValue placeholder="Test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="older">Older</SelectItem>
                </SelectContent>
              </Select>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="max-w-[160px]">
                  <SelectValue placeholder="Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avgMistakes">Avg mistakes</SelectItem>
                  <SelectItem value="testCompletionRate">Completion rate</SelectItem>
                  <SelectItem value="avgTanbih">Avg Tanbih</SelectItem>
                  <SelectItem value="avgFath">Avg Fath</SelectItem>
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
              </div>
            ) : report ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Leaderboard</CardTitle>
                    <CardDescription>
                      Top and worst by {report.filters.metric} ({report.filters.testType})
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeaderboardTable
                      top={report.topPerformers}
                      worst={report.worstPerformers}
                      titleTop="Top performers"
                      titleWorst="Need improvement"
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-muted-foreground py-4">No report data. Adjust filters or ensure entries exist.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
