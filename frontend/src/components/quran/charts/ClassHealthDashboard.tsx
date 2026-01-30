"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IClassAnalyticsReport } from "@/types/quran.types";

export interface ClassHealthDashboardProps {
  report: IClassAnalyticsReport;
  className?: string;
}

function gradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "text-green-600 dark:text-green-400";
    case "B":
      return "text-emerald-600 dark:text-emerald-400";
    case "C":
      return "text-amber-600 dark:text-amber-400";
    case "D":
      return "text-orange-600 dark:text-orange-400";
    case "F":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

export function ClassHealthDashboard({ report, className }: ClassHealthDashboardProps) {
  const { comparison, classHealth } = report;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Best class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{comparison.bestClass.class || "—"}</div>
            <p className="text-xs text-muted-foreground">
              Health score: {comparison.bestClass.score}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most improved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{comparison.mostImproved.class || "—"}</div>
            <p className="text-xs text-muted-foreground">
              Change: {comparison.mostImproved.improvement >= 0 ? "+" : ""}
              {comparison.mostImproved.improvement.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{comparison.needsAttention.class || "—"}</div>
            <p className="text-xs text-muted-foreground">
              {comparison.needsAttention.reason || "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Class health</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classHealth.map((ch) => (
            <Card key={ch.class}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{ch.class}</CardTitle>
                <Badge variant="outline" className={gradeColor(ch.healthGrade)}>
                  {ch.healthGrade}
                </Badge>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Health score: {ch.healthScore}</p>
                <p>
                  Students: {ch.metrics.studentCount} · Improving:{" "}
                  {ch.metrics.improvingStudents} · Declining: {ch.metrics.decliningStudents}
                </p>
                <p>
                  Avg mastery: {ch.metrics.avgMasteryScore.toFixed(1)} · Avg mistakes:{" "}
                  {ch.metrics.avgMistakes.toFixed(2)}
                </p>
                {ch.comparison && (
                  <p className="text-muted-foreground">
                    Score change:{" "}
                    {ch.comparison.healthScoreChange >= 0 ? "+" : ""}
                    {ch.comparison.healthScoreChange.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
