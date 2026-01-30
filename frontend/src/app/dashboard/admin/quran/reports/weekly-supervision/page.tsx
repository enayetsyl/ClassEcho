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
import type { IQuranReportFilters } from "@/types/quran.types";
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
import type { IQuranWeeklySupervisionRow } from "@/types/quran.types";

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

export default function QuranWeeklySupervisionReportPage() {
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
    data: weeks,
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

  const chartData = useMemo(() => {
    if (!weeks?.length) return [];
    return weeks.map((w: IQuranWeeklySupervisionRow) => {
      const ws =
        typeof w.weekStart === "string"
          ? w.weekStart
          : ((w.weekStart as Date).toISOString?.() ?? String(w.weekStart));
      return {
        label: formatWeekLabel(ws),
        weekStart: ws,
        supervisedFath: w.supervised.totalFath,
        unsupervisedFath: w.nonSupervised.totalFath,
        supervisedTanbih: w.supervised.totalTanbih,
        unsupervisedTanbih: w.nonSupervised.totalTanbih,
      };
    });
  }, [weeks]);

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Weekly supervision comparison
            </h1>
            <p className="text-sm text-muted-foreground">
              Fath and Tanbih by week: supervised vs unsupervised students
              (default: last 365 days)
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
            ) : chartData.length > 0 ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Fath by week: supervised vs unsupervised
                    </CardTitle>
                    <CardDescription>
                      Total Fath per week for supervised and unsupervised
                      students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="supervisedFath"
                          name="Supervised Fath"
                          stroke={COLOR_SUPERVISED}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="unsupervisedFath"
                          name="Unsupervised Fath"
                          stroke={COLOR_UNSUPERVISED}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Tanbih by week: supervised vs unsupervised
                    </CardTitle>
                    <CardDescription>
                      Total Tanbih per week for supervised and unsupervised
                      students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="supervisedTanbih"
                          name="Supervised Tanbih"
                          stroke={COLOR_SUPERVISED}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="unsupervisedTanbih"
                          name="Unsupervised Tanbih"
                          stroke={COLOR_UNSUPERVISED}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
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
