"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ITimeAnalysisReport } from "@/types/quran.types";

const COLORS = { supervised: "#10B981", unsupervised: "#F59E0B" };

export interface SupervisionComparisonAreaProps {
  data: ITimeAnalysisReport["data"];
  height?: number;
  emptyMessage?: string;
}

function SupervisionComparisonAreaInner({
  data,
  height = 260,
  emptyMessage = "No supervision data",
}: SupervisionComparisonAreaProps) {
  const chartData = data.map((d) => ({
    period: d.period,
    supervised: d.supervised.tanbih + d.supervised.fath,
    unsupervised: d.unsupervised.tanbih + d.unsupervised.fath,
    supervisedCount: d.supervised.count,
    unsupervisedCount: d.unsupervised.count,
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
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="period" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="supervised" name="Supervised (Tanbih+Fath)" stackId="1" stroke={COLORS.supervised} fill={COLORS.supervised} fillOpacity={0.6} />
        <Area type="monotone" dataKey="unsupervised" name="Unsupervised (Tanbih+Fath)" stackId="1" stroke={COLORS.unsupervised} fill={COLORS.unsupervised} fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const SupervisionComparisonArea = React.memo(SupervisionComparisonAreaInner);
