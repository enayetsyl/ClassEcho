"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { IJuzAnalysisItem } from "@/types/quran.types";

export interface JuzHeatmapProps {
  data: IJuzAnalysisItem[];
  height?: number;
  emptyMessage?: string;
}

function getColor(avgMistakes: number, maxMistakes: number): string {
  if (maxMistakes <= 0) return "bg-muted";
  const ratio = avgMistakes / maxMistakes;
  if (ratio <= 0.2) return "bg-green-500/80 text-white";
  if (ratio <= 0.5) return "bg-green-300/80 text-gray-900";
  if (ratio <= 0.7) return "bg-amber-400/80 text-gray-900";
  return "bg-red-500/80 text-white";
}

export function JuzHeatmap({
  data,
  height = 200,
  emptyMessage = "No juz data",
}: JuzHeatmapProps) {
  const byNumber = new Map(data.map((d) => [d.juzNumber, d]));
  const allJuz = Array.from({ length: 30 }, (_, i) => i + 1);
  const maxMistakes = Math.max(...data.map((d) => d.avgTanbih + d.avgFath), 1);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Juz 1–30: greener = fewer mistakes</p>
      <div
        className="grid grid-cols-10 gap-1 w-full"
        style={{ minHeight: height }}
      >
        {allJuz.map((num) => {
          const item = byNumber.get(num);
          const mistakes = item ? item.avgTanbih + item.avgFath : 0;
          const color = item ? getColor(mistakes, maxMistakes) : "bg-muted";
          return (
            <div
              key={num}
              className={cn(
                "flex flex-col items-center justify-center rounded p-1 text-[10px] font-medium min-h-[32px]",
                color,
              )}
              title={item ? `Juz ${num}: ${mistakes.toFixed(1)} avg mistakes (${item.testsCount} tests)` : `Juz ${num}: no data`}
            >
              <span>{num}</span>
              {item && <span className="opacity-80">{mistakes.toFixed(0)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
