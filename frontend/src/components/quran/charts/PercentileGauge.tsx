"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface PercentileGaugeProps {
  /** Percentile 0–100 (100 = top, best) */
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function PercentileGauge({
  value,
  label = "Percentile",
  size = 100,
  strokeWidth = 8,
  className,
}: PercentileGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    clamped >= 75
      ? "stroke-green-500"
      : clamped >= 50
        ? "stroke-emerald-400"
        : clamped >= 25
          ? "stroke-amber-500"
          : "stroke-orange-500";

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
            className={color}
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: size * 0.22, fontWeight: 600 }}
        >
          {Math.round(clamped)}
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  );
}
