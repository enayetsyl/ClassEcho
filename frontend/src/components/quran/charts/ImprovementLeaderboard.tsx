"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ImprovementLeaderboardItem {
  rank: number;
  student: {
    _id: string;
    studentId: number;
    nameEn: string;
    nameBn?: string;
    class: string;
  };
  improvementVelocity: number;
  previousAvgMistakes: number;
  currentAvgMistakes: number;
}

export interface ImprovementLeaderboardProps {
  data: ImprovementLeaderboardItem[];
  title?: string;
  maxRows?: number;
  emptyMessage?: string;
  className?: string;
}

export function ImprovementLeaderboard({
  data,
  title = "Improvement leaderboard",
  maxRows = 10,
  emptyMessage = "No data",
  className,
}: ImprovementLeaderboardProps) {
  const rows = data.slice(0, maxRows);

  if (rows.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      )}
      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li
            key={row.student._id}
            className="flex items-center justify-between gap-2 rounded border border-border/60 bg-muted/20 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 font-mono text-muted-foreground w-5">
                {row.rank}.
              </span>
              <span className="truncate font-medium">{row.student.nameEn}</span>
              <span className="shrink-0 text-muted-foreground text-xs">
                ({row.student.class})
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 font-medium tabular-nums",
                row.improvementVelocity >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground",
              )}
            >
              {row.improvementVelocity >= 0 ? "+" : ""}
              {row.improvementVelocity.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
