"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MasteryGaugeProps {
  /** Score 0–100 */
  value: number;
  /** Letter grade A–F */
  grade: "A" | "B" | "C" | "D" | "F";
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MasteryGauge({
  value,
  grade,
  label = "Mastery",
  size = 80,
  strokeWidth = 8,
  className,
}: MasteryGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const gradeColor =
    grade === "A"
      ? "stroke-green-500"
      : grade === "B"
        ? "stroke-emerald-500"
        : grade === "C"
          ? "stroke-amber-500"
          : grade === "D"
            ? "stroke-orange-500"
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
            className={cn("transition-all duration-500", gradeColor)}
          />
        </svg>
        <span
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          aria-label={`${label}: ${clamped} (${grade})`}
        >
          <span className="text-sm font-bold leading-none">{grade}</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {clamped}
          </span>
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
