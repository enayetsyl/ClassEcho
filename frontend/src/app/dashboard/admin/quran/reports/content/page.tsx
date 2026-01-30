"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSurahAnalysisQuery, useJuzAnalysisQuery } from "@/hooks/use-quran-reports";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranReportFiltersExtended } from "@/types/quran.types";
import { LeaderboardTable } from "@/components/quran/charts";
import { QuranClassComparisonChart } from "@/components/quran/charts";
import { ReportPageSkeleton, ReportErrorAlert, EmptyState } from "@/components/quran/reports";
import { isValidDateRange } from "@/lib/validation";
import { getApiErrorMessage } from "@/lib/api-error";

export default function ContentAnalysisPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [contentType, setContentType] = useState<"surah" | "juz">("surah");

  const dateRangeValidation = useMemo(
    () =>
      startDate && endDate ? isValidDateRange(startDate, endDate) : { valid: true },
    [startDate, endDate],
  );

  const filters: IQuranReportFiltersExtended = useMemo(() => {
    const base: IQuranReportFiltersExtended = {
      testType: "all",
      ...(classFilter.trim() && { class: classFilter.trim() }),
    };
    if (!dateRangeValidation.valid) return base;
    return {
      ...base,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };
  }, [startDate, endDate, classFilter, dateRangeValidation.valid]);

  const surahQuery = useSurahAnalysisQuery(contentType === "surah" ? filters : undefined);
  const juzQuery = useJuzAnalysisQuery(contentType === "juz" ? filters : undefined);
  const surahReport = surahQuery.data;
  const juzReport = juzQuery.data;
  const surahLoading = surahQuery.isLoading;
  const juzLoading = juzQuery.isLoading;
  const surahError = surahQuery.isError;
  const juzError = juzQuery.isError;
  const surahErr = surahQuery.error;
  const juzErr = juzQuery.error;
  const surahRefetch = surahQuery.refetch;
  const juzRefetch = juzQuery.refetch;

  const report = contentType === "surah" ? surahReport : juzReport;
  const isLoading = contentType === "surah" ? surahLoading : juzLoading;
  const isError = contentType === "surah" ? surahError : juzError;
  const error = contentType === "surah" ? surahErr : juzErr;

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setClassFilter("");
  };

  const byClassData =
    report?.byClass?.map((c) => ({
      class: c.class,
      studentCount: c.studentCount,
      entryCount: c.testsCount,
      avgTanbih: c.avgTanbih,
      avgFath: c.avgFath,
      avgTotalMistakes: c.avgTanbih + c.avgFath,
      testCompletionRate: 1,
    })) ?? [];

  const topPerformers =
    report?.performers?.top?.map((p, i) => ({
      rank: i + 1,
      student: p.student,
      stats: {
        entriesCount: p.testsCount,
        testsGiven: p.testsCount,
        testsMissed: 0,
        totalTanbih: p.avgTanbih * p.testsCount,
        totalFath: p.avgFath * p.testsCount,
        totalMistakes: p.avgMistakes * p.testsCount,
        avgTanbih: p.avgTanbih,
        avgFath: p.avgFath,
        avgMistakes: p.avgMistakes,
        testCompletionRate: 1,
      },
      trend: "stable" as const,
      lastEntry: "",
    })) ?? [];

  const worstPerformers =
    report?.performers?.worst?.map((p, i) => ({
      rank: i + 1,
      student: p.student,
      stats: {
        entriesCount: p.testsCount,
        testsGiven: p.testsCount,
        testsMissed: 0,
        totalTanbih: p.avgTanbih * p.testsCount,
        totalFath: p.avgFath * p.testsCount,
        totalMistakes: p.avgMistakes * p.testsCount,
        avgTanbih: p.avgTanbih,
        avgFath: p.avgFath,
        avgMistakes: p.avgMistakes,
        testCompletionRate: 1,
      },
      trend: "stable" as const,
      lastEntry: "",
    })) ?? [];

  const overview = contentType === "surah" ? (report as typeof surahReport)?.surahOverview : (report as typeof juzReport)?.juzOverview;

  const refetch = contentType === "surah" ? surahRefetch : juzRefetch;

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">Content analysis (Surah / Juz)</h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Performance by surah or juz, top/worst performers, by class
            </p>
          </div>
          <Link href="/dashboard/admin/quran/reports">
            <Button variant="outline">← Reports</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Date range, content type, class</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
              <Select value={contentType} onValueChange={(v) => setContentType(v as "surah" | "juz")}>
                <SelectTrigger className="max-w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surah">Surah</SelectItem>
                  <SelectItem value="juz">Juz</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="From" className="max-w-[180px]" />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="To" className="max-w-[180px]" />
              <Input placeholder="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="max-w-[180px]" />
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
                {overview && overview.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base">{contentType === "surah" ? "Surah" : "Juz"} overview</CardTitle>
                      <CardDescription>Scrollable table</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto min-w-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{contentType === "surah" ? "Surah" : "Juz"}</TableHead>
                            {contentType === "surah" && <TableHead>Name</TableHead>}
                            <TableHead className="text-right">Tests</TableHead>
                            <TableHead className="text-right">Students</TableHead>
                            <TableHead className="text-right">Avg Tanbih</TableHead>
                            <TableHead className="text-right">Avg Fath</TableHead>
                            <TableHead className="text-right">Avg mistakes</TableHead>
                            <TableHead>Difficulty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overview.map((row: { surahNumber?: number; surahName?: string; juzNumber?: number; testsCount: number; studentsCount: number; avgTanbih: number; avgFath: number; avgMistakes: number; difficulty: string }) => (
                            <TableRow key={(row as { surahNumber?: number }).surahNumber ?? (row as { juzNumber?: number }).juzNumber}>
                              <TableCell className="font-medium">
                                {(row as { surahNumber?: number }).surahNumber ?? (row as { juzNumber?: number }).juzNumber}
                              </TableCell>
                              {contentType === "surah" && <TableCell>{(row as { surahName?: string }).surahName ?? "—"}</TableCell>}
                              <TableCell className="text-right">{row.testsCount}</TableCell>
                              <TableCell className="text-right">{row.studentsCount}</TableCell>
                              <TableCell className="text-right">{row.avgTanbih.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{row.avgFath.toFixed(1)}</TableCell>
                              <TableCell className="text-right">{row.avgMistakes.toFixed(1)}</TableCell>
                              <TableCell><Badge variant="secondary" className="capitalize">{row.difficulty}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Top performers & need improvement</CardTitle>
                    <CardDescription>Ranked by avg mistakes for this content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LeaderboardTable top={topPerformers} worst={worstPerformers} titleTop="Top performers" titleWorst="Need improvement" />
                  </CardContent>
                </Card>

                {byClassData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">By class</CardTitle>
                      <CardDescription>Avg Tanbih/Fath per class</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <QuranClassComparisonChart data={byClassData} height={260} emptyMessage="No class data" />
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <EmptyState
                title="No report data"
                description="Adjust filters or ensure entries with content exist."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
