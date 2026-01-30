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
  Cell,
} from "recharts";
import type { ISurahAnalysisItem } from "@/types/quran.types";

export interface SurahStrengthChartProps {
  strong: ISurahAnalysisItem[];
  weak: ISurahAnalysisItem[];
  height?: number;
  emptyMessage?: string;
}

const STRONG_COLOR = "#10B981";
const WEAK_COLOR = "#EF4444";

export function SurahStrengthChart({
  strong,
  weak,
  height = 320,
  emptyMessage = "No surah data",
}: SurahStrengthChartProps) {
  const strongData = strong.slice(0, 15).map((s) => ({ ...s, type: "Strong", fill: STRONG_COLOR }));
  const weakData = weak.slice(0, 15).map((s) => ({ ...s, type: "Weak", fill: WEAK_COLOR }));
  const data = [...strongData.map((s) => ({ name: `${s.surahNumber}. ${s.surahName}`, avgMistakes: s.avgMistakes, type: "Strong", fill: STRONG_COLOR })), ...weakData.map((s) => ({ name: `${s.surahNumber}. ${s.surahName}`, avgMistakes: s.avgMistakes, type: "Weak", fill: WEAK_COLOR }))].slice(0, 20);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" className="text-xs" />
        <YAxis dataKey="name" type="category" width={120} className="text-xs" tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="avgMistakes" name="Avg mistakes" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
