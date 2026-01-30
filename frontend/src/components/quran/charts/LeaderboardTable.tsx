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
import { Badge } from "@/components/ui/badge";
import type { IPerformersReport } from "@/types/quran.types";

type PerformerRow = IPerformersReport["topPerformers"][0];

export interface LeaderboardTableProps {
  top: PerformerRow[];
  worst: PerformerRow[];
  metric?: string;
  titleTop?: string;
  titleWorst?: string;
}

function TrendBadge({ trend }: { trend: string }) {
  const v = trend === "improving" ? "default" : trend === "declining" ? "destructive" : "secondary";
  return <Badge variant={v as "default" | "destructive" | "secondary"} className="capitalize text-xs">{trend}</Badge>;
}

function PerformerTable({ rows, title }: { rows: PerformerRow[]; title: string }) {
  if (rows.length === 0) {
    return (
      <div>
        <h3 className="font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">No data</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Entries</TableHead>
            <TableHead className="text-right">Tanbih</TableHead>
            <TableHead className="text-right">Fath</TableHead>
            <TableHead className="text-right">Mistakes</TableHead>
            <TableHead className="text-right">Completion</TableHead>
            <TableHead>Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.student._id}>
              <TableCell className="font-medium">{r.rank}</TableCell>
              <TableCell>
                {r.student.nameEn}
                <span className="text-muted-foreground text-xs ml-1">({r.student.class})</span>
              </TableCell>
              <TableCell className="text-right">{r.stats.entriesCount}</TableCell>
              <TableCell className="text-right">{r.stats.avgTanbih.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.stats.avgFath.toFixed(1)}</TableCell>
              <TableCell className="text-right">{r.stats.avgMistakes.toFixed(1)}</TableCell>
              <TableCell className="text-right">{(r.stats.testCompletionRate * 100).toFixed(0)}%</TableCell>
              <TableCell><TrendBadge trend={r.trend} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function LeaderboardTable({
  top,
  worst,
  titleTop = "Top performers",
  titleWorst = "Need improvement",
}: LeaderboardTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PerformerTable rows={top} title={titleTop} />
      <PerformerTable rows={worst} title={titleWorst} />
    </div>
  );
}
