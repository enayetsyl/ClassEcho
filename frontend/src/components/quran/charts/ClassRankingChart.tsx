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
import type { IComparativeReport } from "@/types/quran.types";

export interface ClassRankingChartProps {
  classRankings: IComparativeReport["classRankings"];
  height?: number;
  emptyMessage?: string;
}

function ClassRankingChartInner({
  classRankings,
  height = 280,
  emptyMessage = "No class rankings",
}: ClassRankingChartProps) {
  const chartData = classRankings.map((r) => ({
    name: r.class,
    avgMasteryScore: r.avgMasteryScore,
    avgMistakes: r.avgMistakes,
    totalStudents: r.totalStudents,
    rank: r.rank,
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
        <YAxis className="text-xs" domain={[0, 100]} />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === "avgMasteryScore" ? `${value.toFixed(1)}` : value.toFixed(2),
            name === "avgMasteryScore" ? "Avg mastery" : "Avg mistakes",
          ]}
          labelFormatter={(label, payload) => {
            const p = payload[0]?.payload;
            if (p) return `${label} (#${p.rank}, ${p.totalStudents} students)`;
            return label;
          }}
        />
        <Legend />
        <Bar
          dataKey="avgMasteryScore"
          name="Avg mastery score"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="avgMistakes"
          name="Avg mistakes"
          fill="#f59e0b"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const ClassRankingChart = React.memo(ClassRankingChartInner);
