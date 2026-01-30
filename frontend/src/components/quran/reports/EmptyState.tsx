"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Icon component (default: BarChart3) */
  icon?: React.ReactNode;
  /** Short title */
  title: string;
  /** Longer description */
  description?: string;
  /** Optional action (e.g. button or link) */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-10 px-4 text-center sm:py-12",
        className,
      )}
      role="status"
      aria-label={title}
    >
      <div className="text-muted-foreground mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
        {icon ?? <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />}
      </div>
      <h3 className="text-sm font-medium sm:text-base">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground sm:text-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
