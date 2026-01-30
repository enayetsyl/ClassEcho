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
import type { IClassAnalyticsReport } from "@/types/quran.types";

export interface ClassDistributionStackedProps {
  byMastery: IClassAnalyticsReport["distributions"]["byMastery"];
  byRisk: IClassAnalyticsReport["distributions"]["byRisk"];
  height?: number;
  emptyMessage?: string;
}

const MASTERY_COLORS = {
  A: "#22c55e",
  B: "#84cc16",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

const RISK_COLORS = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export function ClassDistributionStacked({
  byMastery,
  byRisk,
  height = 260,
  emptyMessage = "No distribution data",
}: ClassDistributionStackedProps) {
  const masteryData = byMastery.map((row) => ({
    name: row.class,
    A: row.A,
    B: row.B,
    C: row.C,
    D: row.D,
    F: row.F,
  }));

  const riskData = byRisk.map((row) => ({
    name: row.class,
    low: row.low,
    medium: row.medium,
    high: row.high,
    critical: row.critical,
  }));

  const hasMastery = masteryData.some((d) => d.A + d.B + d.C + d.D + d.F > 0);
  const hasRisk = riskData.some((d) => d.low + d.medium + d.high + d.critical > 0);

  if (!hasMastery && !hasRisk) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hasMastery && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            By mastery grade
          </p>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={masteryData}
              margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              stackOffset="stack"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="A" name="A" stackId="mastery" fill={MASTERY_COLORS.A} radius={[0, 0, 0, 0]} />
              <Bar dataKey="B" name="B" stackId="mastery" fill={MASTERY_COLORS.B} radius={[0, 0, 0, 0]} />
              <Bar dataKey="C" name="C" stackId="mastery" fill={MASTERY_COLORS.C} radius={[0, 0, 0, 0]} />
              <Bar dataKey="D" name="D" stackId="mastery" fill={MASTERY_COLORS.D} radius={[0, 0, 0, 0]} />
              <Bar dataKey="F" name="F" stackId="mastery" fill={MASTERY_COLORS.F} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {hasRisk && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            By risk level
          </p>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={riskData}
              margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
              stackOffset="stack"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
              <YAxis className="text-xs" />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" name="Low" stackId="risk" fill={RISK_COLORS.low} radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" name="Medium" stackId="risk" fill={RISK_COLORS.medium} radius={[0, 0, 0, 0]} />
              <Bar dataKey="high" name="High" stackId="risk" fill={RISK_COLORS.high} radius={[0, 0, 0, 0]} />
              <Bar dataKey="critical" name="Critical" stackId="risk" fill={RISK_COLORS.critical} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
