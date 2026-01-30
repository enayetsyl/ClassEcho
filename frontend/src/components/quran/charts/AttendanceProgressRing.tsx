"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface AttendanceProgressRingProps {
  /** Percentage 0–100 */
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function AttendanceProgressRing({
  value,
  label = "Attendance",
  size = 80,
  strokeWidth = 8,
  className,
}: AttendanceProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 90
      ? "stroke-green-500"
      : clamped >= 70
        ? "stroke-amber-500"
        : "stroke-red-500";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", color)}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
          aria-label={`${label}: ${clamped.toFixed(0)}%`}
        >
          {clamped.toFixed(0)}%
        </span>
      </div>
      {label && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          {label}
        </p>
      )}
    </div>
  );
}
