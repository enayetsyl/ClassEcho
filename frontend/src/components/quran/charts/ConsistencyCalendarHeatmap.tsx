"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ConsistencyCalendarHeatmapProps {
  data: Array<{
    date: string;
    entriesCount: number;
    status: "full" | "partial" | "missing";
  }>;
  emptyMessage?: string;
  className?: string;
}

const STATUS_COLORS = {
  full: "bg-green-500/80",
  partial: "bg-amber-400/80",
  missing: "bg-muted",
};

export function ConsistencyCalendarHeatmap({
  data,
  emptyMessage = "No calendar data",
  className,
}: ConsistencyCalendarHeatmapProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        {emptyMessage}
      </p>
    );
  }

  const byDate = new Map(data.map((d) => [d.date, d]));
  const dates = data.map((d) => d.date).sort();
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];

  const cells: { date: string; status: "full" | "partial" | "missing"; count: number }[] = [];
  if (minDate && maxDate) {
    const start = new Date(minDate);
    const end = new Date(maxDate);
    for (let t = start.getTime(); t <= end.getTime(); t += 24 * 60 * 60 * 1000) {
      const key = new Date(t).toISOString().slice(0, 10);
      const rec = byDate.get(key);
      cells.push({
        date: key,
        status: rec?.status ?? "missing",
        count: rec?.entriesCount ?? 0,
      });
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        Full = good activity · Partial = some tests · Missing = no entry
      </p>
      <div className="grid grid-cols-7 sm:grid-cols-14 gap-0.5">
        {cells.slice(0, 84).map((c) => (
          <div
            key={c.date}
            className={cn(
              "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-sm min-w-0",
              STATUS_COLORS[c.status],
            )}
            title={`${c.date}: ${c.count} entries (${c.status})`}
          />
        ))}
      </div>
      {cells.length > 84 && (
        <p className="text-xs text-muted-foreground">
          Showing first 84 days of range
        </p>
      )}
    </div>
  );
}
