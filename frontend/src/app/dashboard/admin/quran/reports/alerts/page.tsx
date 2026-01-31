"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAlertsReportQuery } from "@/hooks/use-quran-reports";
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
import type { IQuranAlertsFilters } from "@/types/quran.types";
import {
  ReportPageSkeleton,
  ReportErrorAlert,
  EmptyState,
} from "@/components/quran/reports";
import { AlertCard, InterventionTracker } from "@/components/quran/alerts";
import { getApiErrorMessage } from "@/lib/api-error";

export default function AlertsReportPage() {
  const [classFilter, setClassFilter] = useState("");
  const [riskLevel, setRiskLevel] = useState<IQuranAlertsFilters["riskLevel"]>("all");
  const [limit, setLimit] = useState<string>("20");

  const filters: IQuranAlertsFilters = useMemo(() => {
    const f: IQuranAlertsFilters = {
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(riskLevel && riskLevel !== "all" && { riskLevel }),
      limit: Math.min(parseInt(limit, 10) || 20, 100),
    };
    return f;
  }, [classFilter, riskLevel, limit]);

  const { data: report, isLoading, isError, error, refetch } =
    useAlertsReportQuery(filters);

  const clearFilters = () => {
    setClassFilter("");
    setRiskLevel("all");
    setLimit("20");
  };

  const criticalAlerts = report?.alerts.filter((a) => a.riskLevel === "critical") ?? [];

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate sm:text-2xl">
              Student risk alerts & interventions
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm mt-0.5">
              Risk scores, factors, and recommended actions (last 4 weeks vs previous 4 weeks)
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
              Class, risk level, limit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-4">
              <Input
                placeholder="Class"
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full min-w-0 max-w-[180px]"
              />
              <Select
                value={riskLevel ?? "all"}
                onValueChange={(v) =>
                  setRiskLevel(
                    v === "all"
                      ? "all"
                      : (v as IQuranAlertsFilters["riskLevel"])
                  )
                }
              >
                <SelectTrigger className="w-full min-w-0 max-w-[160px]">
                  <SelectValue placeholder="Risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="Limit"
                className="w-full min-w-0 max-w-[100px]"
              />
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            </div>

            {isError && (
              <ReportErrorAlert
                message={error ? getApiErrorMessage(error) : "Failed to load."}
                onRetry={() => refetch()}
                className="mb-4"
              />
            )}

            {isLoading ? (
              <ReportPageSkeleton
                filterCount={3}
                statCount={4}
                chartCount={1}
                chartHeight={200}
              />
            ) : report ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {report.summary.lowRisk}
                      </div>
                      <p className="text-xs text-muted-foreground">Low risk</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {report.summary.mediumRisk}
                      </div>
                      <p className="text-xs text-muted-foreground">Medium risk</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {report.summary.highRisk}
                      </div>
                      <p className="text-xs text-muted-foreground">High risk</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {report.summary.criticalRisk}
                      </div>
                      <p className="text-xs text-muted-foreground">Critical risk</p>
                    </CardContent>
                  </Card>
                </div>

                {criticalAlerts.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">
                      Critical alerts (immediate attention)
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {criticalAlerts.map((a) => (
                        <AlertCard key={a.student._id} alert={a} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Alerts</h2>
                    <div className="space-y-4">
                      {report.alerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">
                          No alerts match the current filters.
                        </p>
                      ) : (
                        report.alerts.map((a) => (
                          <AlertCard key={a.student._id} alert={a} />
                        ))
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-3">
                      Focus recommendations
                    </h2>
                    {report.focusRecommendations.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground">
                            No focus recommendations for the selected alerts.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {report.focusRecommendations.map((fr) => (
                          <Card key={fr.student._id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">
                                {fr.student.nameEn} ({fr.student.class})
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                              <ul className="list-disc list-inside space-y-1">
                                {fr.content.map((c, i) => (
                                  <li key={i}>
                                    <span className="font-medium">{c.name}</span>
                                    {c.reason ? ` — ${c.reason}` : null}
                                    <Badge
                                      variant="outline"
                                      className="ml-1 text-xs capitalize"
                                    >
                                      {c.priority}
                                    </Badge>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    <div className="mt-6">
                      <InterventionTracker
                        interventions={report.interventions}
                        emptyMessage="No interventions recorded yet"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                title="No alerts data"
                description="Adjust filters or ensure entries exist in the last 8 weeks."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
