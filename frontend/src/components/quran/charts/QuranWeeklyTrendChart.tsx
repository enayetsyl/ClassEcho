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
import type { IQuranWeeklySummary } from "@/types/quran.types";

const COLORS = {
  total: "#3B82F6",
  tanbih: "#10B981",
  fath: "#F59E0B",
};

export interface QuranWeeklyTrendChartProps {
  /** Weekly summary data (weeks in order) */
  weeks: IQuranWeeklySummary[];
  /** Chart height in pixels */
  height?: number;
  /** Message when no data */
  emptyMessage?: string;
}

function formatWeekLabel(weekStart: string): string {
  try {
    return new Date(weekStart).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return weekStart;
  }
}

export function QuranWeeklyTrendChart({
  weeks,
  height = 280,
  emptyMessage = "No weekly data",
}: QuranWeeklyTrendChartProps) {
  const data = weeks.map((w) => ({
    label: formatWeekLabel(w.weekStart),
    weekStart: w.weekStart,
    totalMistakes: w.totalMistakes,
    totalTanbih: w.totalTanbih,
    totalFath: w.totalFath,
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
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="label" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalMistakes"
          name="Total mistakes"
          stroke={COLORS.total}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="totalTanbih"
          name="Tanbih"
          stroke={COLORS.tanbih}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="totalFath"
          name="Fath"
          stroke={COLORS.fath}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
