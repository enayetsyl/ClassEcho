"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskScoreGauge } from "@/components/quran/charts/RiskScoreGauge";
import type { IAlertsReport } from "@/types/quran.types";

export type AlertItem = IAlertsReport["alerts"][number];

export interface AlertCardProps {
  alert: AlertItem;
  className?: string;
}

function priorityVariant(
  priority: "immediate" | "soon" | "routine"
): "destructive" | "default" | "secondary" {
  if (priority === "immediate") return "destructive";
  if (priority === "soon") return "default";
  return "secondary";
}

export function AlertCard({ alert, className }: AlertCardProps) {
  const { student, riskScore, riskLevel, factors, recommendations } = alert;

  return (
    <Card className={className}>
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-base flex items-center gap-2 flex-wrap">
            <span>
              {student.nameEn}
              {student.studentId ? (
                <span className="text-muted-foreground font-normal text-sm ml-1">
                  (ID: {student.studentId})
                </span>
              ) : null}
            </span>
            <Badge
              variant={
                riskLevel === "critical"
                  ? "destructive"
                  : riskLevel === "high"
                    ? "default"
                    : "secondary"
              }
              className="shrink-0 capitalize"
            >
              {riskLevel}
            </Badge>
          </CardTitle>
          <CardDescription>{student.class}</CardDescription>
        </div>
        <RiskScoreGauge
          value={riskScore}
          riskLevel={riskLevel}
          label=""
          size={56}
          strokeWidth={6}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
          <li>{factors.attendanceDecline.description}</li>
          <li>{factors.mistakesIncrease.description}</li>
          <li>{factors.streakBroken.description}</li>
          <li>{factors.recentGaps.description}</li>
          <li>{factors.tajweedSeverity.description}</li>
        </ul>
        {recommendations.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Recommended actions
            </p>
            <ul className="space-y-1">
              {recommendations.map((r, i) => (
                <li key={i} className="text-sm flex items-center gap-2 flex-wrap">
                  <Badge variant={priorityVariant(r.priority)} className="text-xs">
                    {r.priority}
                  </Badge>
                  <span>{r.action}</span>
                  <span className="text-muted-foreground text-xs">
                    → {r.assignTo}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
