"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useTestTypeAnalysisQuery } from "@/hooks/use-quran-reports";
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
import { TestTypeComparisonChart } from "@/components/quran/charts";
import { QuranMistakesByTestTypeChart } from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function TestTypeAnalysisPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<"all" | "true" | "false">("all");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranReportFiltersExtended = useMemo(() => {
    const base: IQuranReportFiltersExtended = {
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
    };
    if (!dateRangeValidation.valid) return base;
    return {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate, classFilter, supervisionFilter, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error } = useTestTypeAnalysisQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  const barData = report?.byTestType
    ? [
        { name: "New", tanbih: report.byTestType.new.totalTanbih, fath: report.byTestType.new.totalFath },
        { name: "Recent", tanbih: report.byTestType.recent.totalTanbih, fath: report.byTestType.recent.totalFath },
        { name: "Older", tanbih: report.byTestType.older.totalTanbih, fath: report.byTestType.older.totalFath },
      ]
    : [];

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Test type analysis</h1>
            <p className="text-sm text-muted-foreground">
              Tanbih/Fath and completion by new, recent, and older tests
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports">
            <Button variant="outline">← Reports</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Date range, class, and supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From" className="max-w-[180px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" className="max-w-[180px]" />
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
              <p className="text-destructive text-sm mb-4">
                {error ? getApiErrorMessage(error) : "Failed to load report."}
              </p>
            )}

            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-[280px] w-full" />
                <Skeleton className="h-[240px] w-full" />
              </div>
            ) : report ? (
              <>
                <div className="grid gap-4 md:grid-cols-3 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{report.summary.totalEntries}</div>
                      <p className="text-xs text-muted-foreground">Total entries</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{report.summary.totalStudents}</div>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {(
                          ((report.byTestType.new.givenCount + report.byTestType.recent.givenCount + report.byTestType.older.givenCount) /
                            (report.summary.totalEntries * 3)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                      <p className="text-xs text-muted-foreground">Test completion rate</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">By test type (stacked)</CardTitle>
                    <CardDescription>Tanbih and Fath per test type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestTypeComparisonChart byTestType={report.byTestType} height={280} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mistakes by test type</CardTitle>
                    <CardDescription>Same data as bar chart</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuranMistakesByTestTypeChart data={barData} height={240} emptyMessage="No test data" />
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
