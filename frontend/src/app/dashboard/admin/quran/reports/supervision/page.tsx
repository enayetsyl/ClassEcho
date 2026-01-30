"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSupervisionDetailedQuery } from "@/hooks/use-quran-reports";
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
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranReportFiltersExtended } from "@/types/quran.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ReportPageSkeleton, ReportErrorAlert, EmptyState } from "@/components/quran/reports";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function SupervisionDetailedPage() {
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

  const { data: report, isLoading, isError, error, refetch } = useSupervisionDetailedQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  const timelineChartData =
    report?.timeline?.map((t) => ({
      period: t.period,
      supervisedEntries: t.supervised.entries,
      unsupervisedEntries: t.unsupervised.entries,
      supervisedMistakes: t.supervised.tanbih + t.supervised.fath,
      unsupervisedMistakes: t.unsupervised.tanbih + t.unsupervised.fath,
    })) ?? [];

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">Supervision comparison (detailed)</h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Supervised vs unsupervised: KPIs, by test type, timeline
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports">
            <Button variant="outline">← Reports</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Date range, class, supervision</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
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
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
            </div>
            {!dateRangeValidation.valid && dateRangeValidation.message && (
              <p className="text-destructive text-sm mb-4">{dateRangeValidation.message}</p>
            )}
            {isError && (
              <ReportErrorAlert
                message={error ? getApiErrorMessage(error) : "Failed to load."}
                onRetry={() => refetch()}
                className="mb-4"
              />
            )}

            {isLoading ? (
              <ReportPageSkeleton filterCount={4} statCount={0} chartCount={2} chartHeight={280} />
            ) : report ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Supervised</CardTitle>
                      <CardDescription>Students with supervision</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>Students: <strong>{report.summary.supervised.studentCount}</strong></p>
                      <p>Entries: <strong>{report.summary.supervised.entryCount}</strong></p>
                      <p>Avg Tanbih: <strong>{report.summary.supervised.avgTanbih.toFixed(1)}</strong></p>
                      <p>Avg Fath: <strong>{report.summary.supervised.avgFath.toFixed(1)}</strong></p>
                      <p>Avg mistakes: <strong>{report.summary.supervised.avgMistakes.toFixed(1)}</strong></p>
                      <p>Completion: <strong>{(report.summary.supervised.testCompletionRate * 100).toFixed(0)}%</strong></p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Unsupervised</CardTitle>
                      <CardDescription>Students without supervision</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>Students: <strong>{report.summary.unsupervised.studentCount}</strong></p>
                      <p>Entries: <strong>{report.summary.unsupervised.entryCount}</strong></p>
                      <p>Avg Tanbih: <strong>{report.summary.unsupervised.avgTanbih.toFixed(1)}</strong></p>
                      <p>Avg Fath: <strong>{report.summary.unsupervised.avgFath.toFixed(1)}</strong></p>
                      <p>Avg mistakes: <strong>{report.summary.unsupervised.avgMistakes.toFixed(1)}</strong></p>
                      <p>Completion: <strong>{(report.summary.unsupervised.testCompletionRate * 100).toFixed(0)}%</strong></p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Difference</CardTitle>
                    <CardDescription>{report.summary.difference.conclusion}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>Tanbih diff: {report.summary.difference.tanbihDiff >= 0 ? "+" : ""}{report.summary.difference.tanbihDiff.toFixed(1)}</p>
                    <p>Fath diff: {report.summary.difference.fathDiff >= 0 ? "+" : ""}{report.summary.difference.fathDiff.toFixed(1)}</p>
                    <p>Mistakes diff: {report.summary.difference.mistakesDiff >= 0 ? "+" : ""}{report.summary.difference.mistakesDiff.toFixed(1)}</p>
                    <p>Completion rate diff: {report.summary.difference.completionRateDiff >= 0 ? "+" : ""}{(report.summary.difference.completionRateDiff * 100).toFixed(1)}%</p>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">By test type</CardTitle>
                    <CardDescription>Supervised vs unsupervised avg Tanbih/Fath</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
                    <div className="rounded border p-4">
                      <p className="font-medium mb-2">New</p>
                      <p>Supervised: Tanbih {report.byTestType.new.supervised.avgTanbih.toFixed(1)} / Fath {report.byTestType.new.supervised.avgFath.toFixed(1)}</p>
                      <p>Unsupervised: Tanbih {report.byTestType.new.unsupervised.avgTanbih.toFixed(1)} / Fath {report.byTestType.new.unsupervised.avgFath.toFixed(1)}</p>
                    </div>
                    <div className="rounded border p-4">
                      <p className="font-medium mb-2">Recent</p>
                      <p>Supervised: Tanbih {report.byTestType.recent.supervised.avgTanbih.toFixed(1)} / Fath {report.byTestType.recent.supervised.avgFath.toFixed(1)}</p>
                      <p>Unsupervised: Tanbih {report.byTestType.recent.unsupervised.avgTanbih.toFixed(1)} / Fath {report.byTestType.recent.unsupervised.avgFath.toFixed(1)}</p>
                    </div>
                    <div className="rounded border p-4">
                      <p className="font-medium mb-2">Older</p>
                      <p>Supervised: Tanbih {report.byTestType.older.supervised.avgTanbih.toFixed(1)} / Fath {report.byTestType.older.supervised.avgFath.toFixed(1)}</p>
                      <p>Unsupervised: Tanbih {report.byTestType.older.unsupervised.avgTanbih.toFixed(1)} / Fath {report.byTestType.older.unsupervised.avgFath.toFixed(1)}</p>
                    </div>
                  </CardContent>
                </Card>

                {timelineChartData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Timeline</CardTitle>
                      <CardDescription>Entries and mistakes (Tanbih+Fath) by period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={timelineChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="period" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="supervisedMistakes" name="Supervised (Tanbih+Fath)" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                          <Line type="monotone" dataKey="unsupervisedMistakes" name="Unsupervised (Tanbih+Fath)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
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
