"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IClassAnalyticsReport } from "@/types/quran.types";

export interface YearOverYearComparisonProps {
  yearOverYear: NonNullable<IClassAnalyticsReport["yearOverYear"]>;
  className?: string;
}

export function YearOverYearComparison({
  yearOverYear,
  className,
}: YearOverYearComparisonProps) {
  const { currentYear, previousYear, change } = yearOverYear;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Period comparison</CardTitle>
        <p className="text-xs text-muted-foreground">
          Current period vs previous period (same length)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground mb-1">Current period</p>
            <p>Avg mastery: {currentYear.avgMastery.toFixed(1)}</p>
            <p>Avg mistakes: {currentYear.avgMistakes.toFixed(2)}</p>
            <p>Completion: {currentYear.completionRate.toFixed(1)}%</p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground mb-1">Previous period</p>
            <p>Avg mastery: {previousYear.avgMastery.toFixed(1)}</p>
            <p>Avg mistakes: {previousYear.avgMistakes.toFixed(2)}</p>
            <p>Completion: {previousYear.completionRate.toFixed(1)}%</p>
          </div>
        </div>
        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-1">Change</p>
          <p>
            Mastery: {change.masteryChange >= 0 ? "+" : ""}
            {change.masteryChange.toFixed(2)}
          </p>
          <p>
            Mistakes: {change.mistakesChange >= 0 ? "+" : ""}
            {change.mistakesChange.toFixed(2)} (negative = fewer mistakes)
          </p>
          <p>
            Completion: {change.completionChange >= 0 ? "+" : ""}
            {change.completionChange.toFixed(2)}%
          </p>
        </div>
        <p className="text-sm text-muted-foreground italic">{change.insight}</p>
      </CardContent>
    </Card>
  );
}
