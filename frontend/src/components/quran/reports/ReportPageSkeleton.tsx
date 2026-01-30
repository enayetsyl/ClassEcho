"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface ReportPageSkeletonProps {
  /** Number of filter row placeholders (default 5) */
  filterCount?: number;
  /** Number of stat/KPI cards (default 3) */
  statCount?: number;
  /** Number of chart blocks (default 2) */
  chartCount?: number;
  /** Height of each chart placeholder in px (default 280) */
  chartHeight?: number;
  className?: string;
}

export function ReportPageSkeleton({
  filterCount = 5,
  statCount = 3,
  chartCount = 2,
  chartHeight = 280,
  className,
}: ReportPageSkeletonProps) {
  return (
    <div className={className ?? "space-y-6"}>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {Array.from({ length: filterCount }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full min-w-[120px] max-w-[180px] sm:max-w-[180px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: statCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      {Array.from({ length: chartCount }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full rounded-md" style={{ height: chartHeight }} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
