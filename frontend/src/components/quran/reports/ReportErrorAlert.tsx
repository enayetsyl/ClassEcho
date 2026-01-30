"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReportErrorAlertProps {
  /** Error message to show */
  message: string;
  /** Optional retry callback */
  onRetry?: () => void;
  className?: string;
}

export function ReportErrorAlert({
  message,
  onRetry,
  className,
}: ReportErrorAlertProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:flex-row sm:items-center sm:gap-3",
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-2 sm:items-center">
        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-medium underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          Try again
        </button>
      )}
    </div>
  );
}
