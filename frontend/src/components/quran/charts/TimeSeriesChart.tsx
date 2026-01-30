"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ITimeAnalysisReport } from "@/types/quran.types";

const COLORS = { totalTanbih: "#3B82F6", totalFath: "#10B981", totalMistakes: "#F59E0B", avgMistakesPerStudent: "#8B5CF6" };

export interface TimeSeriesChartProps {
  data: ITimeAnalysisReport["data"];
  granularity: "day" | "week" | "month";
  height?: number;
  emptyMessage?: string;
}

function TimeSeriesChartInner({
  data,
  granularity,
  height = 300,
  emptyMessage = "No time series data",
}: TimeSeriesChartProps) {
  const chartData = data.map((d) => ({
    period: d.period,
    totalTanbih: d.metrics.totalTanbih,
    totalFath: d.metrics.totalFath,
    totalMistakes: d.metrics.totalMistakes,
    avgMistakesPerStudent: Number(d.metrics.avgMistakesPerStudent?.toFixed(1) ?? 0),
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
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="period" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalTanbih" name="Tanbih" stroke={COLORS.totalTanbih} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="totalFath" name="Fath" stroke={COLORS.totalFath} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="totalMistakes" name="Total mistakes" stroke={COLORS.totalMistakes} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="avgMistakesPerStudent" name="Avg mistakes/student" stroke={COLORS.avgMistakesPerStudent} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const TimeSeriesChart = React.memo(TimeSeriesChartInner);
