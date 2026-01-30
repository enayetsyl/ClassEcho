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
import type { ITestTypeMetrics } from "@/types/quran.types";

const BAR_COLORS = { tanbih: "#3B82F6", fath: "#10B981" };

export interface TestTypeComparisonChartProps {
  byTestType: {
    new: ITestTypeMetrics;
    recent: ITestTypeMetrics;
    older: ITestTypeMetrics;
  };
  height?: number;
  emptyMessage?: string;
}

export function TestTypeComparisonChart({
  byTestType,
  height = 280,
  emptyMessage = "No test type data",
}: TestTypeComparisonChartProps) {
  const data = [
    { name: "New", tanbih: byTestType.new.totalTanbih, fath: byTestType.new.totalFath, given: byTestType.new.givenCount },
    { name: "Recent", tanbih: byTestType.recent.totalTanbih, fath: byTestType.recent.totalFath, given: byTestType.recent.givenCount },
    { name: "Older", tanbih: byTestType.older.totalTanbih, fath: byTestType.older.totalFath, given: byTestType.older.givenCount },
  ];

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
        <Bar dataKey="tanbih" name="Tanbih" fill={BAR_COLORS.tanbih} stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="fath" name="Fath" fill={BAR_COLORS.fath} stackId="a" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
