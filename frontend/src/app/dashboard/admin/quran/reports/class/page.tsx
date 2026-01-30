"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useQuranClassBreakdownQuery } from "@/hooks/use-quran-reports";
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
import { QuranClassComparisonChart } from "@/components/quran/charts";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function QuranClassBreakdownPage() {
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
    data: breakdown,
    isLoading,
    isError,
    error,
  } = useQuranClassBreakdownQuery(filters);

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
            <h1 className="text-2xl font-semibold">Class breakdown report</h1>
            <p className="text-sm text-muted-foreground">
              Stats by class (default: last 365 days)
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
                <Card className="mb-6">
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
                    <Skeleton className="h-5 w-40" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : breakdown && breakdown.length > 0 ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Average mistakes by class
                    </CardTitle>
                    <CardDescription>
                      Comparison of avg total mistakes per entry by class
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <QuranClassComparisonChart
                      data={breakdown}
                      height={300}
                      emptyMessage="No class data for this period"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Class breakdown table
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead className="text-right">Students</TableHead>
                          <TableHead className="text-right">Entries</TableHead>
                          <TableHead className="text-right">
                            Avg Tanbih
                          </TableHead>
                          <TableHead className="text-right">Avg Fath</TableHead>
                          <TableHead className="text-right">
                            Avg mistakes
                          </TableHead>
                          <TableHead className="text-right">
                            Completion %
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {breakdown.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">
                              {row.class}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.studentCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.entryCount}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.avgTanbih.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.avgFath.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.avgTotalMistakes.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {row.testCompletionRate.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-muted-foreground py-4">
                No class data. Adjust filters or ensure entries exist for the
                period.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
