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
import type { IAlertsReport } from "@/types/quran.types";

export interface InterventionTrackerProps {
  interventions: IAlertsReport["interventions"];
  emptyMessage?: string;
  className?: string;
}

function outcomeVariant(
  outcome: "successful" | "ongoing" | "unsuccessful"
): "default" | "secondary" | "destructive" {
  if (outcome === "successful") return "default";
  if (outcome === "unsuccessful") return "destructive";
  return "secondary";
}

export function InterventionTracker({
  interventions,
  emptyMessage = "No interventions recorded yet",
  className,
}: InterventionTrackerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Intervention history</CardTitle>
        <CardDescription>
          Recorded follow-ups and outcomes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interventions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {emptyMessage}
          </p>
        ) : (
          <ul className="space-y-3">
            {interventions.map((int, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2 text-sm border-b pb-2 last:border-0 last:pb-0"
              >
                <span className="font-medium">{int.student.nameEn}</span>
                <span className="text-muted-foreground">{int.date}</span>
                <Badge variant="outline" className="text-xs">
                  {int.type}
                </Badge>
                <Badge variant={outcomeVariant(int.outcome)} className="capitalize">
                  {int.outcome}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
