"use client";

import React, { useState } from "react";
import { useTurnaroundTimeQuery } from "@/hooks/use-reports";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ITurnaroundTime } from "@/types/reports.types";

export default function TurnaroundTimePage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: report, isLoading } = useTurnaroundTimeQuery(params);

  const getTimeColor = (days: number, stage: string) => {
    if (stage === "uploadToAssignment") {
      if (days <= 1) return "bg-green-500";
      if (days <= 3) return "bg-yellow-500";
      return "bg-red-500";
    }
    if (stage === "assignmentToReview") {
      if (days <= 3) return "bg-green-500";
      if (days <= 7) return "bg-yellow-500";
      return "bg-red-500";
    }
    if (stage === "reviewToPublication") {
      if (days <= 1) return "bg-green-500";
      if (days <= 3) return "bg-yellow-500";
      return "bg-red-500";
    }
    // totalCycleTime
    if (days <= 7) return "bg-green-500";
    if (days <= 14) return "bg-yellow-500";
    return "bg-red-500";
  };

  const renderTimeMetrics = (
    title: string,
    data: ITurnaroundTime,
    stage: string
  ) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Average</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {data.averageDays.toFixed(2)} days
                  <Badge className={getTimeColor(data.averageDays, stage)}>
                    {data.averageDays <= 1
                      ? "Fast"
                      : data.averageDays <= 3
                      ? "Normal"
                      : "Slow"}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Median</div>
                <div className="text-2xl font-bold">
                  {data.medianDays.toFixed(2)} days
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <div className="text-sm text-muted-foreground">Minimum</div>
                <div className="text-lg font-semibold">
                  {data.minDays.toFixed(2)} days
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Maximum</div>
                <div className="text-lg font-semibold">
                  {data.maxDays.toFixed(2)} days
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Turnaround Time Report</CardTitle>
          <CardDescription>
            Time metrics for video processing stages from upload to publication
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
            <div className="space-y-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : report ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.uploadToAssignment.averageDays.toFixed(2)} days
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload → Assignment
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠️ Approximated (no assignedAt field)
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.assignmentToReview.averageDays.toFixed(2)} days
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Assignment → Review
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.reviewToPublication.averageDays.toFixed(2)} days
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Review → Publication
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.totalCycleTime.averageDays.toFixed(2)} days
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total Cycle Time
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {renderTimeMetrics(
                  "Upload to Assignment",
                  report.uploadToAssignment,
                  "uploadToAssignment"
                )}
                {renderTimeMetrics(
                  "Assignment to Review",
                  report.assignmentToReview,
                  "assignmentToReview"
                )}
                {renderTimeMetrics(
                  "Review to Publication",
                  report.reviewToPublication,
                  "reviewToPublication"
                )}
                {renderTimeMetrics(
                  "Total Cycle Time",
                  report.totalCycleTime,
                  "totalCycleTime"
                )}
              </div>

              {/* Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Metrics Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead>Average</TableHead>
                        <TableHead>Median</TableHead>
                        <TableHead>Min</TableHead>
                        <TableHead>Max</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Upload → Assignment
                        </TableCell>
                        <TableCell>
                          {report.uploadToAssignment.averageDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.uploadToAssignment.medianDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.uploadToAssignment.minDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.uploadToAssignment.maxDays.toFixed(2)} days
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Assignment → Review
                        </TableCell>
                        <TableCell>
                          {report.assignmentToReview.averageDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.assignmentToReview.medianDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.assignmentToReview.minDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.assignmentToReview.maxDays.toFixed(2)} days
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Review → Publication
                        </TableCell>
                        <TableCell>
                          {report.reviewToPublication.averageDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.reviewToPublication.medianDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.reviewToPublication.minDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.reviewToPublication.maxDays.toFixed(2)} days
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-semibold bg-muted/50">
                        <TableCell>Total Cycle Time</TableCell>
                        <TableCell>
                          {report.totalCycleTime.averageDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.totalCycleTime.medianDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.totalCycleTime.minDays.toFixed(2)} days
                        </TableCell>
                        <TableCell>
                          {report.totalCycleTime.maxDays.toFixed(2)} days
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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

