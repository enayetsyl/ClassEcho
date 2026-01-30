"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ISurahAnalysisItem } from "@/types/quran.types";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export interface ContentBubbleChartProps {
  data: ISurahAnalysisItem[];
  height?: number;
  emptyMessage?: string;
}

export function ContentBubbleChart({
  data,
  height = 280,
  emptyMessage = "No content data",
}: ContentBubbleChartProps) {
  const chartData = data.slice(0, 30).map((s, i) => ({
    name: `${s.surahNumber}. ${s.surahName}`,
    x: s.testsCount,
    y: s.avgMistakes,
    z: Math.min(s.testsCount * 2 + 10, 400),
    fill: COLORS[i % COLORS.length],
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
      <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" dataKey="x" name="Tests" className="text-xs" />
        <YAxis type="number" dataKey="y" name="Avg mistakes" className="text-xs" />
        <ZAxis type="number" dataKey="z" range={[80, 400]} name="Size" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value: number) => [value, ""]} />
        <Legend />
        <Scatter name="Surahs" data={chartData}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
