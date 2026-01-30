"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface DistributionHistogramProps {
  mistakesHistogram: Array<{ range: string; count: number }>;
  masteryHistogram: Array<{ range: string; count: number }>;
  height?: number;
  emptyMessage?: string;
}

function DistributionHistogramInner({
  mistakesHistogram,
  masteryHistogram,
  height = 260,
  emptyMessage = "No distribution data",
}: DistributionHistogramProps) {
  const hasMistakes = mistakesHistogram.some((d) => d.count > 0);
  const hasMastery = masteryHistogram.some((d) => d.count > 0);
  if (!hasMistakes && !hasMastery) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  const mistakesData = mistakesHistogram.map((d) => ({ name: d.range, mistakes: d.count, fill: "#f59e0b" }));
  const masteryData = masteryHistogram.map((d) => ({ name: d.range, mastery: d.count, fill: "#3b82f6" }));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Mistakes (avg per student)</p>
        <ResponsiveContainer width="100%" height={height / 2}>
          <BarChart data={mistakesData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={(value: number) => [value, "Students"]} />
            <Bar dataKey="mistakes" name="Students" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Mastery score range</p>
        <ResponsiveContainer width="100%" height={height / 2}>
          <BarChart data={masteryData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={(value: number) => [value, "Students"]} />
            <Bar dataKey="mastery" name="Students" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const DistributionHistogram = React.memo(DistributionHistogramInner);
