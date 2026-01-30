"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MilestoneItem {
  type: string;
  description: string;
  date: string;
  value: string;
}

export interface MilestoneTrackerProps {
  milestones: MilestoneItem[];
  emptyMessage?: string;
  className?: string;
}

export function MilestoneTracker({
  milestones,
  emptyMessage = "No milestones in this period",
  className,
}: MilestoneTrackerProps) {
  if (!milestones?.length) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {milestones.map((m, i) => (
        <li
          key={`${m.date}-${m.type}-${i}`}
          className="flex items-start gap-3 rounded border border-border/60 bg-muted/30 px-3 py-2 text-sm"
        >
          <span className="shrink-0 text-muted-foreground tabular-nums">
            {m.date}
          </span>
          <span className="font-medium">{m.description}</span>
          {m.value && (
            <span className="ml-auto shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium">
              {m.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
