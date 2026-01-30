"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BAR_COLORS = ["#3B82F6", "#10B981"];

export interface TestTypeDataPoint {
  name: string;
  tanbih: number;
  fath: number;
}

export interface QuranMistakesByTestTypeChartProps {
  /** Data: one item per test type (e.g. New, Recent, Older) */
  data: TestTypeDataPoint[];
  /** Chart height in pixels */
  height?: number;
  /** Message when no data */
  emptyMessage?: string;
}

function QuranMistakesByTestTypeChartInner({
  data,
  height = 240,
  emptyMessage = "No test data in this period",
}: QuranMistakesByTestTypeChartProps) {
  const hasData = data.some((d) => d.tanbih > 0 || d.fath > 0);

  if (!hasData) {
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
        <XAxis dataKey="name" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="tanbih"
          name="Tanbih"
          fill={BAR_COLORS[0]}
          stackId="a"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="fath"
          name="Fath"
          fill={BAR_COLORS[1]}
          stackId="a"
          radius={[0, 0, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const QuranMistakesByTestTypeChart = React.memo(QuranMistakesByTestTypeChartInner);
