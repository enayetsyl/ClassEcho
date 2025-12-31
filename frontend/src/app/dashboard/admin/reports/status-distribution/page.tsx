"use client";

import React, { useState } from "react";
import { useStatusDistributionQuery } from "@/hooks/use-reports";
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
import { IStatusDistribution } from "@/types/reports.types";

export default function StatusDistributionPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: report, isLoading } = useStatusDistributionQuery(params);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-500";
      case "assigned":
        return "bg-yellow-500";
      case "reviewed":
        return "bg-blue-500";
      case "published":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution Report</CardTitle>
          <CardDescription>
            Breakdown of videos by status across the system
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
            <Skeleton className="h-64" />
          ) : report ? (
            <>
              <div className="mb-6">
                <div className="text-2xl font-bold mb-2">
                  Total Videos: {report.total}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.distributions.map((dist) => (
                    <TableRow key={dist.status}>
                      <TableCell>
                        <Badge className={getStatusColor(dist.status)}>
                          {dist.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{dist.count}</TableCell>
                      <TableCell>{dist.percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* By Class Breakdown */}
              {report.byClass && Object.keys(report.byClass).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">By Class</h3>
                  <div className="space-y-4">
                    {Object.entries(report.byClass).map(([className, distributions]) => (
                      <Card key={className}>
                        <CardHeader>
                          <CardTitle className="text-base">{className}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {distributions.map((dist: IStatusDistribution) => (
                                <TableRow key={dist.status}>
                                  <TableCell>
                                    <Badge className={getStatusColor(dist.status)}>
                                      {dist.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{dist.count}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
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

