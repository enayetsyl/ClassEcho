"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { IComparativeReport } from "@/types/quran.types";

export interface PeerComparisonRadarProps {
  peerComparison: NonNullable<IComparativeReport["peerComparison"]>;
  height?: number;
}

/** Normalize a value to 0–100 for radar (lower tanbih/fath = better, so invert; mastery/completion higher = better) */
function toRadarValue(
  tanbih: number,
  fath: number,
  mastery: number,
  completion: number,
): { tanbih: number; fath: number; mastery: number; completion: number } {
  const scale = (v: number, lowGood: boolean, max = 20) =>
    lowGood ? Math.max(0, 100 - (v / max) * 100) : Math.min(100, v);
  return {
    tanbih: scale(tanbih, true),
    fath: scale(fath, true),
    mastery: scale(mastery, false, 100),
    completion: scale(completion, false, 100),
  };
}

function PeerComparisonRadarInner({
  peerComparison,
  height = 280,
}: PeerComparisonRadarProps) {
  const { targetStudent, classAverage, topQuartile } = peerComparison;
  const target = toRadarValue(
    targetStudent.metrics.avgTanbih,
    targetStudent.metrics.avgFath,
    targetStudent.metrics.masteryScore,
    targetStudent.metrics.testCompletionRate,
  );
  const avg = toRadarValue(
    classAverage.avgTanbih,
    classAverage.avgFath,
    classAverage.masteryScore,
    classAverage.testCompletionRate,
  );
  const top = {
    ...toRadarValue(
      topQuartile.avgTanbih,
      topQuartile.avgFath,
      topQuartile.masteryScore,
      100,
    ),
  };

  const data = [
    { subject: "Tanbih (lower better)", student: target.tanbih, classAvg: avg.tanbih, top25: top.tanbih, fullMark: 100 },
    { subject: "Fath (lower better)", student: target.fath, classAvg: avg.fath, top25: top.fath, fullMark: 100 },
    { subject: "Mastery", student: target.mastery, classAvg: avg.mastery, top25: top.mastery, fullMark: 100 },
    { subject: "Completion", student: target.completion, classAvg: avg.completion, top25: top.completion, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 16, right: 24, left: 24, bottom: 8 }}>
        <PolarGrid className="stroke-muted" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name="Student" dataKey="student" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2} />
        <Radar name="Class avg" dataKey="classAvg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} strokeWidth={1.5} />
        <Radar name="Top 25%" dataKey="top25" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={1.5} />
        <Tooltip
          formatter={(value: number) => [value.toFixed(1), ""]}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export const PeerComparisonRadar = React.memo(PeerComparisonRadarInner);
