"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskScoreGaugeProps {
  /** Risk score 0–100 */
  value: number;
  riskLevel: RiskLevel;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "stroke-green-500",
  medium: "stroke-yellow-500",
  high: "stroke-orange-500",
  critical: "stroke-red-500",
};

export function RiskScoreGauge({
  value,
  riskLevel,
  label = "Risk",
  size = 80,
  strokeWidth = 8,
  className,
}: RiskScoreGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = RISK_COLORS[riskLevel];

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
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums"
          style={{ fontSize: size * 0.2 }}
        >
          {Math.round(clamped)}
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground mt-1 capitalize">
          {riskLevel}
        </span>
      )}
    </div>
  );
}
