"use client";

import React, { useState } from "react";
import { useReviewerProductivityQuery } from "@/hooks/use-reports";
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

export default function ReviewerProductivityPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: report, isLoading } = useReviewerProductivityQuery(params);

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reviewer Productivity Report</CardTitle>
          <CardDescription>
            Reviewer workload, completion times, and efficiency metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Skeleton className="h-64" />
          ) : report ? (
            <>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.totalPendingReviews}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total Pending Reviews
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.averageCompletionTime.toFixed(1)} days
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg Completion Time
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.reviewers.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active Reviewers
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Total Reviews</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Avg Days</TableHead>
                    <TableHead>This Month</TableHead>
                    <TableHead>Last Month</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.reviewers.map((reviewer) => (
                    <TableRow key={reviewer.reviewerId}>
                      <TableCell className="font-medium">
                        {reviewer.reviewerName}
                      </TableCell>
                      <TableCell>{reviewer.reviewerEmail}</TableCell>
                      <TableCell>{reviewer.totalReviews}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            reviewer.pendingReviews > 5 ? "destructive" : "default"
                          }
                        >
                          {reviewer.pendingReviews}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {reviewer.averageCompletionDays.toFixed(1)}
                      </TableCell>
                      <TableCell>{reviewer.reviewsThisMonth}</TableCell>
                      <TableCell>{reviewer.reviewsLastMonth}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

