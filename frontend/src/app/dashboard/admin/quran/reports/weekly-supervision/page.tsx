"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuranWeeklySupervisionQuery } from "@/hooks/use-quran-reports";
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
import type {
  IQuranReportFilters,
  IQuranWeeklySupervisionByClassItem,
  IQuranWeeklySupervisionRow,
} from "@/types/quran.types";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";
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

const COLOR_SUPERVISED = "#3B82F6";
const COLOR_UNSUPERVISED = "#F59E0B";

function formatWeekLabel(weekStart: string | Date): string {
  try {
    const d = typeof weekStart === "string" ? new Date(weekStart) : weekStart;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(weekStart);
  }
}

function buildChartData(weeks: IQuranWeeklySupervisionRow[]) {
  return weeks.map((w) => {
    const ws =
      typeof w.weekStart === "string"
        ? w.weekStart
        : ((w.weekStart as Date).toISOString?.() ?? String(w.weekStart));
    return {
      label: formatWeekLabel(ws),
      weekStart: ws,
      supervisedFath: w.supervised.fathPerTest,
      unsupervisedFath: w.nonSupervised.fathPerTest,
      supervisedTanbih: w.supervised.tanbihPerTest,
      unsupervisedTanbih: w.nonSupervised.tanbihPerTest,
      supervisedFathTotal: w.supervised.totalFath,
      unsupervisedFathTotal: w.nonSupervised.totalFath,
      supervisedTanbihTotal: w.supervised.totalTanbih,
      unsupervisedTanbihTotal: w.nonSupervised.totalTanbih,
      supervisedTestsGiven: w.supervised.testsGiven,
      unsupervisedTestsGiven: w.nonSupervised.testsGiven,
    };
  });
}

export default function QuranWeeklySupervisionReportPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [showRates, setShowRates] = useState<boolean>(true);

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
    data: byClass,
    isLoading,
    isError,
    error,
  } = useQuranWeeklySupervisionQuery(filters);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
    setSupervisionFilter("all");
  };

  const hasData =
    byClass && byClass.length > 0 && byClass.some((c) => c.weeks.length > 0);

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Weekly supervision comparison (by class)
            </h1>
            <p className="text-sm text-muted-foreground">
              Fath and Tanbih by week, compared within each class: supervised vs
              unsupervised. Uses &quot;per test given&quot; so totals are not
              misleading when attendance or tests given differ.
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
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              </div>
            ) : hasData ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-muted-foreground">
                    Chart metric:
                  </span>
                  <Button
                    variant={showRates ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRates(true)}
                  >
                    Per test given (rate)
                  </Button>
                  <Button
                    variant={!showRates ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowRates(false)}
                  >
                    Total
                  </Button>
                </div>

                {(byClass as IQuranWeeklySupervisionByClassItem[]).map(
                  (item) => {
                    const weeks = item.weeks ?? [];
                    if (weeks.length === 0) return null;
                    const chartData = buildChartData(weeks);
                    const useRates = showRates;
                    const fathKeySup = useRates
                      ? "supervisedFath"
                      : "supervisedFathTotal";
                    const fathKeyNon = useRates
                      ? "unsupervisedFath"
                      : "unsupervisedFathTotal";
                    const tanbihKeySup = useRates
                      ? "supervisedTanbih"
                      : "supervisedTanbihTotal";
                    const tanbihKeyNon = useRates
                      ? "unsupervisedTanbih"
                      : "unsupervisedTanbihTotal";

                    return (
                      <Card key={item.class} className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Class: {item.class}
                          </CardTitle>
                          <CardDescription>
                            Supervised vs unsupervised within this class. Hover
                            for tests given.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Fath {useRates ? "(per test given)" : "(total)"}
                            </h4>
                            <ResponsiveContainer width="100%" height={280}>
                              <LineChart
                                data={chartData}
                                margin={{
                                  top: 8,
                                  right: 8,
                                  left: 8,
                                  bottom: 8,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  className="stroke-muted"
                                />
                                <XAxis dataKey="label" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (!active || !payload?.length)
                                      return null;
                                    const p = payload[0]?.payload;
                                    return (
                                      <div className="rounded-md border bg-background p-3 text-sm shadow">
                                        <p className="font-medium mb-2">
                                          {label}
                                        </p>
                                        {payload.map((entry) => (
                                          <p key={entry.dataKey}>
                                            {entry.name}:{" "}
                                            {Number(entry.value).toFixed(2)}
                                          </p>
                                        ))}
                                        {p && (
                                          <p className="text-muted-foreground mt-2 border-t pt-2">
                                            Tests given — Supervised:{" "}
                                            {p.supervisedTestsGiven ?? 0},
                                            Unsupervised:{" "}
                                            {p.unsupervisedTestsGiven ?? 0}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey={fathKeySup}
                                  name="Supervised Fath"
                                  stroke={COLOR_SUPERVISED}
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey={fathKeyNon}
                                  name="Unsupervised Fath"
                                  stroke={COLOR_UNSUPERVISED}
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Tanbih {useRates ? "(per test given)" : "(total)"}
                            </h4>
                            <ResponsiveContainer width="100%" height={280}>
                              <LineChart
                                data={chartData}
                                margin={{
                                  top: 8,
                                  right: 8,
                                  left: 8,
                                  bottom: 8,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  className="stroke-muted"
                                />
                                <XAxis dataKey="label" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (!active || !payload?.length)
                                      return null;
                                    const p = payload[0]?.payload;
                                    return (
                                      <div className="rounded-md border bg-background p-3 text-sm shadow">
                                        <p className="font-medium mb-2">
                                          {label}
                                        </p>
                                        {payload.map((entry) => (
                                          <p key={entry.dataKey}>
                                            {entry.name}:{" "}
                                            {Number(entry.value).toFixed(2)}
                                          </p>
                                        ))}
                                        {p && (
                                          <p className="text-muted-foreground mt-2 border-t pt-2">
                                            Tests given — Supervised:{" "}
                                            {p.supervisedTestsGiven ?? 0},
                                            Unsupervised:{" "}
                                            {p.unsupervisedTestsGiven ?? 0}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  }}
                                />
                                <Legend />
                                <Line
                                  type="monotone"
                                  dataKey={tanbihKeySup}
                                  name="Supervised Tanbih"
                                  stroke={COLOR_SUPERVISED}
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey={tanbihKeyNon}
                                  name="Unsupervised Tanbih"
                                  stroke={COLOR_UNSUPERVISED}
                                  strokeWidth={2}
                                  dot={{ r: 3 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  },
                )}
              </>
            ) : (
              <p className="text-muted-foreground py-4">
                No weekly data for this period. Adjust filters or ensure entries
                exist.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
