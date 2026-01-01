"use client";

import React, { useState } from "react";
import { useTeacherPerformanceQuery } from "@/hooks/use-reports";
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

export default function TeacherPerformancePage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params = {
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  };

  const { data: report, isLoading } = useTeacherPerformanceQuery(params);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 4) return "bg-blue-500";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTrendColor = (trend: "improving" | "declining" | "stable") => {
    if (trend === "improving") return "bg-green-500";
    if (trend === "declining") return "bg-red-500";
    return "bg-gray-500";
  };

  const getTrendIcon = (trend: "improving" | "declining" | "stable") => {
    if (trend === "improving") return "↑";
    if (trend === "declining") return "↓";
    return "→";
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Report</CardTitle>
          <CardDescription>
            Teacher ratings and performance metrics
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
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.overallAverage.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall Average Rating
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {report.activeTeachers?.length || report.teachers.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active Teachers
                    </p>
                  </CardContent>
                </Card>
                {report.deactivatedTeachers && report.deactivatedTeachers.length > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {report.deactivatedTeachers.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Deactivated Teachers
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {report.topPerformers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Videos</TableHead>
                        <TableHead>Published</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.topPerformers.map((teacher) => (
                        <TableRow key={teacher.teacherId}>
                          <TableCell className="font-medium">
                            {teacher.teacherName}
                          </TableCell>
                          <TableCell>{teacher.teacherEmail}</TableCell>
                          <TableCell>
                            <Badge className={getRatingColor(teacher.averageRating)}>
                              {teacher.averageRating.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTrendColor(teacher.trend)}>
                              {getTrendIcon(teacher.trend)} {teacher.trend}
                            </Badge>
                          </TableCell>
                          <TableCell>{teacher.totalVideos}</TableCell>
                          <TableCell>{teacher.publishedVideos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {report.activeTeachers && report.activeTeachers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Active Teachers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Videos</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Comment Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.activeTeachers.map((teacher) => (
                        <TableRow key={teacher.teacherId}>
                          <TableCell className="font-medium">
                            {teacher.teacherName}
                          </TableCell>
                          <TableCell>{teacher.teacherEmail}</TableCell>
                          <TableCell>
                            <Badge className={getRatingColor(teacher.averageRating)}>
                              {teacher.averageRating.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>{teacher.totalVideos}</TableCell>
                          <TableCell>{teacher.publishedVideos}</TableCell>
                          <TableCell>
                            {teacher.commentRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {report.deactivatedTeachers && report.deactivatedTeachers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                    Deactivated Teachers
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Videos</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Comment Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.deactivatedTeachers.map((teacher) => (
                        <TableRow key={teacher.teacherId} className="opacity-60">
                          <TableCell className="font-medium">
                            {teacher.teacherName}
                          </TableCell>
                          <TableCell>{teacher.teacherEmail}</TableCell>
                          <TableCell>
                            <Badge className={getRatingColor(teacher.averageRating)}>
                              {teacher.averageRating.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTrendColor(teacher.trend)}>
                              {getTrendIcon(teacher.trend)} {teacher.trend}
                            </Badge>
                          </TableCell>
                          <TableCell>{teacher.totalVideos}</TableCell>
                          <TableCell>{teacher.publishedVideos}</TableCell>
                          <TableCell>
                            {teacher.commentRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {(!report.activeTeachers || report.activeTeachers.length === 0) &&
               (!report.deactivatedTeachers || report.deactivatedTeachers.length === 0) &&
               report.teachers && report.teachers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">All Teachers</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Videos</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Comment Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.teachers.map((teacher) => (
                        <TableRow key={teacher.teacherId}>
                          <TableCell className="font-medium">
                            {teacher.teacherName}
                          </TableCell>
                          <TableCell>{teacher.teacherEmail}</TableCell>
                          <TableCell>
                            <Badge className={getRatingColor(teacher.averageRating)}>
                              {teacher.averageRating.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTrendColor(teacher.trend)}>
                              {getTrendIcon(teacher.trend)} {teacher.trend}
                            </Badge>
                          </TableCell>
                          <TableCell>{teacher.totalVideos}</TableCell>
                          <TableCell>{teacher.publishedVideos}</TableCell>
                          <TableCell>
                            {teacher.commentRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

