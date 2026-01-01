"use client";

import React, { useState } from "react";
import { usePendingVideosQuery } from "@/hooks/use-reports";
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
import { IPendingVideo } from "@/types/reports.types";
import Link from "next/link";

export default function PendingVideosPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: report, isLoading } = usePendingVideosQuery(params);

  const getDaysColor = (days: number, status: "assigned" | "reviewed") => {
    if (status === "assigned") {
      if (days > 7) return "bg-red-500";
      if (days > 3) return "bg-yellow-500";
      return "bg-green-500";
    } else {
      // reviewed
      if (days > 3) return "bg-red-500";
      if (days > 1) return "bg-yellow-500";
      return "bg-green-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderVideoTable = (
    title: string,
    videos: IPendingVideo[],
    averageDays: number,
    exceedingSLA: number,
    status: "assigned" | "reviewed"
  ) => {
    if (videos.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>
              Average: {averageDays.toFixed(2)} days | Exceeding SLA: {exceedingSLA}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No videos pending {status === "assigned" ? "review" : "publication"}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>
            Total: {videos.length} videos | Average: {averageDays.toFixed(2)} days | Exceeding
            SLA: {exceedingSLA}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Days in Status</TableHead>
                <TableHead>Video</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.videoId}>
                  <TableCell className="font-medium">{video.teacherName}</TableCell>
                  <TableCell>{video.className}</TableCell>
                  <TableCell>{video.sectionName}</TableCell>
                  <TableCell>{video.subjectName}</TableCell>
                  <TableCell>{formatDate(video.date)}</TableCell>
                  <TableCell>
                    {video.assignedReviewerName ? (
                      <div>
                        <div className="font-medium">{video.assignedReviewerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {video.assignedReviewerEmail}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getDaysColor(video.daysInStatus, status)}>
                      {video.daysInStatus.toFixed(1)} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Video
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Videos Report</CardTitle>
          <CardDescription>
            Videos pending review (assigned but not reviewed) and videos pending publication
            (reviewed but not published)
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
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          ) : report ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.pendingReview.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pending Review
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg: {report.pendingReview.averageDays.toFixed(1)} days
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {report.pendingReview.exceedingSLA}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Review Exceeding SLA
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      &gt; 7 days
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.pendingPublication.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pending Publication
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg: {report.pendingPublication.averageDays.toFixed(1)} days
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">
                      {report.pendingPublication.exceedingSLA}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Publication Exceeding SLA
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      &gt; 3 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Review Videos */}
              {renderVideoTable(
                "Videos Pending Review",
                report.pendingReview.videos,
                report.pendingReview.averageDays,
                report.pendingReview.exceedingSLA,
                "assigned"
              )}

              {/* Pending Publication Videos */}
              {renderVideoTable(
                "Videos Pending Publication",
                report.pendingPublication.videos,
                report.pendingPublication.averageDays,
                report.pendingPublication.exceedingSLA,
                "reviewed"
              )}
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

