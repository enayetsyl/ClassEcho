"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

export interface MasteryDistributionChartProps {
  distribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  height?: number;
  emptyMessage?: string;
  className?: string;
}

export function MasteryDistributionChart({
  distribution,
  height = 200,
  emptyMessage = "No distribution data",
  className,
}: MasteryDistributionChartProps) {
  const data = ["A", "B", "C", "D", "F"].map((grade) => ({
    grade,
    count: distribution[grade as keyof typeof distribution] ?? 0,
  }));

  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return (
      <div
        className={cn("flex items-center justify-center text-muted-foreground text-sm", className)}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <XAxis
          dataKey="grade"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            const pct = total > 0 ? ((d.count / total) * 100).toFixed(0) : "0";
            return (
              <div className="rounded border bg-background px-2 py-1.5 text-sm shadow">
                Grade {d.grade}: {d.count} ({pct}%)
              </div>
            );
          }}
        />
        <Bar
          dataKey="count"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
          name="Students"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
