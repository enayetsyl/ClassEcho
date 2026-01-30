"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useClassAnalyticsQuery } from "@/hooks/use-quran-reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranClassAnalyticsFilters } from "@/types/quran.types";
import {
  ReportPageSkeleton,
  ReportErrorAlert,
  EmptyState,
} from "@/components/quran/reports";
import {
  ClassHealthDashboard,
  ClassComparisonBar,
  ClassDistributionStacked,
  YearOverYearComparison,
} from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function ClassAnalyticsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classesInput, setClassesInput] = useState("");
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranClassAnalyticsFilters = useMemo(() => {
    const base: IQuranClassAnalyticsFilters = {};
    if (!dateRangeValidation.valid) return base;
    const result = {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(compareWithPrevious && { compareWithPrevious: true }),
    };
    const classes = classesInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (classes.length > 0) result.classes = classes;
    return result;
  }, [startDate, endDate, classesInput, compareWithPrevious, dateRangeValidation.valid]);

  const { data: report, isLoading, isError, error, refetch } =
    useClassAnalyticsQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassesInput("");
    setCompareWithPrevious(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">
              Class / batch analytics
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Class health scores, comparison, distributions, timeline
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
              Date range, classes (comma-separated), compare with previous period
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
                placeholder="Classes (e.g. 1-5, 2-6)"
                value={classesInput}
                onChange={(e) => setClassesInput(e.target.value)}
                className="w-full min-w-0 max-w-[240px]"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id="compare"
                  checked={compareWithPrevious}
                  onCheckedChange={(v) => setCompareWithPrevious(v === true)}
                />
                <label htmlFor="compare" className="text-sm">
                  Compare with previous period
                </label>
              </div>
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
                statCount={3}
                chartCount={2}
                chartHeight={220}
              />
            ) : report ? (
              <>
                <ClassHealthDashboard report={report} className="mb-6" />

                <div className="grid grid-cols-1 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Class comparison</CardTitle>
                      <CardDescription>
                        Health score, avg mastery, attendance by class
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClassComparisonBar
                        classHealth={report.classHealth}
                        height={280}
                        emptyMessage="No class data"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Distributions</CardTitle>
                      <CardDescription>
                        By mastery grade and risk level per class
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ClassDistributionStacked
                        byMastery={report.distributions.byMastery}
                        byRisk={report.distributions.byRisk}
                        height={260}
                        emptyMessage="No distribution data"
                      />
                    </CardContent>
                  </Card>
                  {report.yearOverYear && (
                    <YearOverYearComparison
                      yearOverYear={report.yearOverYear}
                      className="h-fit"
                    />
                  )}
                </div>

                {report.timeline.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Timeline</CardTitle>
                      <CardDescription>
                        Avg mistakes and attendance by period and class
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {report.timeline.length} period(s). First:{" "}
                        {report.timeline[0]?.period} — Last:{" "}
                        {report.timeline[report.timeline.length - 1]?.period}
                      </p>
                      <ul className="mt-2 text-sm space-y-1">
                        {report.timeline.slice(0, 5).map((t) => (
                          <li key={t.period}>
                            {t.period}:{" "}
                            {t.classes
                              .map(
                                (c) =>
                                  `${c.class} (mistakes: ${c.avgMistakes.toFixed(1)}, att: ${c.attendance.toFixed(0)}%)`,
                              )
                              .join(" · ")}
                          </li>
                        ))}
                        {report.timeline.length > 5 && (
                          <li className="text-muted-foreground">
                            … and {report.timeline.length - 5} more periods
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <EmptyState
                title="No class analytics data"
                description="Adjust filters or ensure entries exist for the period."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
