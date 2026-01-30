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
  Legend,
} from "recharts";
import type { IClassAnalyticsReport } from "@/types/quran.types";

export interface ClassComparisonBarProps {
  classHealth: IClassAnalyticsReport["classHealth"];
  height?: number;
  emptyMessage?: string;
}

export function ClassComparisonBar({
  classHealth,
  height = 280,
  emptyMessage = "No class data",
}: ClassComparisonBarProps) {
  const data = classHealth.map((ch) => ({
    name: ch.class,
    healthScore: ch.healthScore,
    avgMastery: ch.metrics.avgMasteryScore,
    avgMistakes: ch.metrics.avgMistakes,
    avgAttendance: ch.metrics.avgAttendance,
    completionRate: ch.metrics.testCompletionRate,
  }));

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
        <YAxis className="text-xs" domain={[0, 100]} />
        <Tooltip
          formatter={(value: number, name: string) => [
            typeof value === "number" ? value.toFixed(2) : value,
            name === "healthScore"
              ? "Health score"
              : name === "avgMastery"
                ? "Avg mastery"
                : name === "avgMistakes"
                  ? "Avg mistakes"
                  : name === "avgAttendance"
                    ? "Attendance %"
                    : name === "completionRate"
                      ? "Completion %"
                      : name,
          ]}
        />
        <Legend />
        <Bar
          dataKey="healthScore"
          name="Health score"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="avgMastery"
          name="Avg mastery"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="avgAttendance"
          name="Attendance %"
          fill="#eab308"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
