"use client";

import React, { useState } from "react";
import { useManagementDashboardQuery } from "@/hooks/use-reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ManagementDashboardPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: dashboard, isLoading } = useManagementDashboardQuery(params);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Management Dashboard</CardTitle>
          <CardDescription>
            Key performance indicators and system overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Range Filter */}
          <div className="flex gap-4 mb-6">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="max-w-xs"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="max-w-xs"
            />
            {(dateFrom || dateTo) && (
              <Button
                variant="outline"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : dashboard ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.totalVideos}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total Videos
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.videosPublishedThisMonth}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Published This Month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.averageTeacherPerformanceScore.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg Teacher Score
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.reviewCompletionRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Review Completion Rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.averageReviewTurnaroundTime.toFixed(1)} days
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg Review Time
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.activeTeachersCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active Teachers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {dashboard.activeReviewersCount}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active Reviewers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">
                        {dashboard.systemHealthScore}
                      </div>
                      <Badge className={getHealthColor(dashboard.systemHealthScore)}>
                        {dashboard.systemHealthScore >= 80
                          ? "Healthy"
                          : dashboard.systemHealthScore >= 60
                          ? "Warning"
                          : "Critical"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      System Health Score
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-lg font-semibold">
                        {dashboard.statusSummary.unassigned}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Unassigned
                      </p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {dashboard.statusSummary.assigned}
                      </div>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {dashboard.statusSummary.reviewed}
                      </div>
                      <p className="text-xs text-muted-foreground">Reviewed</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {dashboard.statusSummary.published}
                      </div>
                      <p className="text-xs text-muted-foreground">Published</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

