"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#10B981"];

export interface QuranMistakeDistributionChartProps {
  /** Total Tanbih count */
  totalTanbih: number;
  /** Total Fath count */
  totalFath: number;
  /** Chart height in pixels */
  height?: number;
  /** Message when no data */
  emptyMessage?: string;
}

export function QuranMistakeDistributionChart({
  totalTanbih,
  totalFath,
  height = 240,
  emptyMessage = "No mistake data in this period",
}: QuranMistakeDistributionChartProps) {
  const data = [
    { name: "Tanbih", value: totalTanbih },
    { name: "Fath", value: totalFath },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [value, "Mistakes"]} />
      </PieChart>
    </ResponsiveContainer>
  );
}
