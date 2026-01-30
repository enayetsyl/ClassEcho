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
import type { IStudentTrendReport } from "@/types/quran.types";

const COLORS = { total: "#3B82F6", totalMA: "#8B5CF6" };

export interface StudentProgressChartProps {
  timeline: IStudentTrendReport["timeline"];
  movingAverage: IStudentTrendReport["movingAverage"];
  height?: number;
  emptyMessage?: string;
}

export function StudentProgressChart({
  timeline,
  movingAverage,
  height = 300,
  emptyMessage = "No progress data",
}: StudentProgressChartProps) {
  const timelineByPeriod = new Map(timeline.map((t) => [t.period, t]));
  const data = movingAverage.map((ma) => {
    const t = timelineByPeriod.get(ma.period);
    return {
      period: ma.period,
      total: t?.total ?? 0,
      totalMA: ma.totalMA,
      tanbih: t?.tanbih ?? 0,
      fath: t?.fath ?? 0,
    };
  });

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
        <XAxis dataKey="period" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="total" name="Total mistakes" stroke={COLORS.total} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="totalMA" name="Moving avg" stroke={COLORS.totalMA} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
