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
  Cell,
} from "recharts";
import type { IComparativeReport } from "@/types/quran.types";

export interface UstadEffectivenessChartProps {
  ustadComparison: IComparativeReport["ustadComparison"];
  height?: number;
  emptyMessage?: string;
}

const EFFECTIVENESS_COLOR = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444",
};

function UstadEffectivenessChartInner({
  ustadComparison,
  height = 280,
  emptyMessage = "No ustad data",
}: UstadEffectivenessChartProps) {
  const chartData = ustadComparison.map((u) => ({
    name: u.ustadName.length > 12 ? u.ustadName.slice(0, 12) + "…" : u.ustadName,
    fullName: u.ustadName,
    studentsCount: u.studentsCount,
    entriesCount: u.entriesCount,
    avgStudentMistakes: u.avgStudentMistakes,
    avgStudentImprovement: u.avgStudentImprovement,
    testCompletionRate: u.testCompletionRate,
    effectiveness: u.effectiveness,
  }));

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
        <YAxis className="text-xs" />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "avgStudentImprovement") return [`${value.toFixed(1)}%`, "Avg improvement"];
            if (name === "testCompletionRate") return [`${value.toFixed(1)}%`, "Completion"];
            if (name === "avgStudentMistakes") return [value.toFixed(2), "Avg mistakes"];
            return [value, name];
          }}
          labelFormatter={(_, payload) => payload[0]?.payload?.fullName ?? _}
        />
        <Bar dataKey="avgStudentImprovement" name="Avg improvement" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={EFFECTIVENESS_COLOR[entry.effectiveness]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export const UstadEffectivenessChart = React.memo(UstadEffectivenessChartInner);
