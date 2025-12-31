"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";

export default function ReportsDashboardPage() {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: dashboard, isLoading } = useManagementDashboardQuery(params);

  const reportCards = [
    {
      title: "Status Distribution",
      description: "View video status breakdown",
      href: "/dashboard/admin/reports/status-distribution",
      color: "bg-blue-500",
    },
    {
      title: "Turnaround Time",
      description: "Review processing times",
      href: "/dashboard/admin/reports/turnaround-time",
      color: "bg-green-500",
    },
    {
      title: "Teacher Performance",
      description: "Teacher ratings and trends",
      href: "/dashboard/admin/reports/teacher-performance",
      color: "bg-purple-500",
    },
    {
      title: "Reviewer Productivity",
      description: "Reviewer workload and efficiency",
      href: "/dashboard/admin/reports/reviewer-productivity",
      color: "bg-orange-500",
    },
    {
      title: "Subject Analytics",
      description: "Performance by subject",
      href: "/dashboard/admin/reports/subject-analytics",
      color: "bg-pink-500",
    },
    {
      title: "Class Analytics",
      description: "Performance by class",
      href: "/dashboard/admin/reports/class-analytics",
      color: "bg-indigo-500",
    },
    {
      title: "Language Review",
      description: "Language review compliance",
      href: "/dashboard/admin/reports/language-review-compliance",
      color: "bg-teal-500",
    },
    {
      title: "Time Trends",
      description: "Historical trends and patterns",
      href: "/dashboard/admin/reports/time-trends",
      color: "bg-cyan-500",
    },
    {
      title: "Operational Efficiency",
      description: "Queue sizes and SLA metrics",
      href: "/dashboard/admin/reports/operational-efficiency",
      color: "bg-red-500",
    },
    {
      title: "Quality Metrics",
      description: "Review quality indicators",
      href: "/dashboard/admin/reports/quality-metrics",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Management Reports</CardTitle>
          <CardDescription>
            Comprehensive analytics and insights for video review management
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

          {/* Dashboard Summary */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : dashboard ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{dashboard.totalVideos}</div>
                  <p className="text-xs text-muted-foreground">Total Videos</p>
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
                    {dashboard.systemHealthScore}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    System Health Score
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((report) => (
              <Link key={report.href} href={report.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg ${report.color} flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {report.title.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

