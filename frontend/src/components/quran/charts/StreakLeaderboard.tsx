"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IConsistencyReport } from "@/types/quran.types";

export interface StreakLeaderboardProps {
  data: IConsistencyReport["streakLeaderboard"];
  title?: string;
  emptyMessage?: string;
  maxRows?: number;
}

export function StreakLeaderboard({
  data,
  title = "Streak leaderboard",
  emptyMessage = "No streak data",
  maxRows = 10,
}: StreakLeaderboardProps) {
  const rows = data.slice(0, maxRows);

  if (rows.length === 0) {
    return (
      <div>
        <h3 className="font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
      <h3 className="font-medium mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Current streak</TableHead>
            <TableHead className="text-right">Longest streak</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.student._id}>
              <TableCell className="font-medium">{r.rank}</TableCell>
              <TableCell>
                {r.student.nameEn}
                <span className="text-muted-foreground text-xs ml-1">
                  ({r.student.class})
                </span>
              </TableCell>
              <TableCell className="text-right">{r.currentStreak} wks</TableCell>
              <TableCell className="text-right">{r.longestStreak} wks</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
