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

const TrendBadge = React.memo(function TrendBadge({ trend }: { trend: string }) {
  const v = trend === "improving" ? "default" : trend === "declining" ? "destructive" : "secondary";
  return <Badge variant={v as "default" | "destructive" | "secondary"} className="capitalize text-xs">{trend}</Badge>;
});

const PerformerRow = React.memo(function PerformerRow({ r }: { r: PerformerRow }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{r.rank}</TableCell>
      <TableCell>
        <span className="truncate">{r.student.nameEn}</span>
        <span className="text-muted-foreground text-xs ml-1">({r.student.class})</span>
      </TableCell>
      <TableCell className="text-right">{r.stats.entriesCount}</TableCell>
      <TableCell className="text-right">{r.stats.avgTanbih.toFixed(1)}</TableCell>
      <TableCell className="text-right">{r.stats.avgFath.toFixed(1)}</TableCell>
      <TableCell className="text-right">{r.stats.avgMistakes.toFixed(1)}</TableCell>
      <TableCell className="text-right">{(r.stats.testCompletionRate * 100).toFixed(0)}%</TableCell>
      <TableCell><TrendBadge trend={r.trend} /></TableCell>
    </TableRow>
  );
});

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
    <div className="min-w-0 overflow-x-auto">
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
            <PerformerRow key={r.student._id} r={r} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LeaderboardTableInner({
  top,
  worst,
  titleTop = "Top performers",
  titleWorst = "Need improvement",
}: LeaderboardTableProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 overflow-x-auto">
      <PerformerTable rows={top} title={titleTop} />
      <PerformerTable rows={worst} title={titleWorst} />
    </div>
  );
}

export const LeaderboardTable = React.memo(LeaderboardTableInner);
