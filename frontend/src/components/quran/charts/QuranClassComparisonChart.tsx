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
import type { IQuranClassBreakdown } from "@/types/quran.types";

const BAR_COLOR = "#3B82F6";

export interface QuranClassComparisonChartProps {
  /** Class breakdown data */
  data: IQuranClassBreakdown[];
  /** Chart height in pixels */
  height?: number;
  /** Message when no data */
  emptyMessage?: string;
}

function QuranClassComparisonChartInner({
  data,
  height = 280,
  emptyMessage = "No class data",
}: QuranClassComparisonChartProps) {
  const chartData = data.map((d) => ({
    name: d.class,
    avgMistakes: d.avgTotalMistakes,
    studentCount: d.studentCount,
    entryCount: d.entryCount,
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
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          formatter={(value: number) => [value.toFixed(2), "Avg mistakes"]}
          labelFormatter={(label, payload) => {
            const p = payload[0]?.payload;
            if (p) {
              return `${label} (${p.studentCount} students, ${p.entryCount} entries)`;
            }
            return label;
          }}
        />
        <Bar
          dataKey="avgMistakes"
          name="Avg mistakes"
          fill={BAR_COLOR}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const QuranClassComparisonChart = React.memo(QuranClassComparisonChartInner);
