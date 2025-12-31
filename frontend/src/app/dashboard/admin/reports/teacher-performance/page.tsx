"use client";

import React, { useState } from "react";
import {
  useGetTeacherPerformanceMetricsQuery,
  useGetTeacherPerformanceSummaryQuery,
} from "@/hooks/use-reports";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetAllClassesQuery } from "@/hooks/use-class";
import { useGetAllSubjectsQuery } from "@/hooks/use-subject";
import { ITeacherPerformanceMetrics } from "@/types/reports.types";

export default function TeacherPerformancePage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");

  const { data: classes = [] } = useGetAllClassesQuery();
  const { data: subjects = [] } = useGetAllSubjectsQuery();

  const filters: any = {};
  if (dateFrom) filters.dateFrom = dateFrom;
  if (dateTo) filters.dateTo = dateTo;
  if (subjectFilter) filters.subjectId = subjectFilter;
  if (classFilter) filters.classId = classFilter;
  if (minRating) filters.minRating = parseFloat(minRating);
  if (maxRating) filters.maxRating = parseFloat(maxRating);

  const { data: summary, isLoading: summaryLoading } =
    useGetTeacherPerformanceSummaryQuery(filters);
  const { data: metrics, isLoading: metricsLoading } =
    useGetTeacherPerformanceMetricsQuery(filters);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setSubjectFilter("");
    setClassFilter("");
    setMinRating("");
    setMaxRating("");
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-800";
    if (rating >= 4.0) return "bg-blue-100 text-blue-800";
    if (rating >= 3.5) return "bg-yellow-100 text-yellow-800";
    if (rating >= 3.0) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "improving":
        return <Badge variant="default" className="bg-green-500">Improving</Badge>;
      case "declining":
        return <Badge variant="destructive">Declining</Badge>;
      default:
        return <Badge variant="outline">Stable</Badge>;
    }
  };

  if (summaryLoading || metricsLoading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">Loading performance data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Analytics</CardTitle>
          <CardDescription>
            Comprehensive performance metrics and analytics for all teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="w-48"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="w-48"
            />
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              placeholder="Min Rating"
              className="w-32"
              min="1"
              max="5"
              step="0.1"
            />
            <Input
              type="number"
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
              placeholder="Max Rating"
              className="w-32"
              min="1"
              max="5"
              step="0.1"
            />
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total Teachers</div>
                  <div className="text-2xl font-bold">{summary.totalTeachers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">
                    Teachers with Videos
                  </div>
                  <div className="text-2xl font-bold">
                    {summary.teachersWithVideos}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">
                    Average Overall Rating
                  </div>
                  <div className="text-2xl font-bold">
                    {summary.averageOverallRating.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">
                    Coverage Rate
                  </div>
                  <div className="text-2xl font-bold">
                    {summary.totalTeachers > 0
                      ? (
                          (summary.teachersWithVideos / summary.totalTeachers) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Performers */}
          {summary && summary.topPerformers.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Teachers with the highest average ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.topPerformers.map((teacher) => (
                    <Card key={teacher.teacherId}>
                      <CardContent className="pt-6">
                        <div className="font-semibold">{teacher.teacherName}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher.teacherEmail}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                              teacher.averageRating
                            )}`}
                          >
                            {teacher.averageRating.toFixed(2)} / 5.0
                          </span>
                          {getTrendBadge(teacher.performanceTrend)}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {teacher.reviewedVideos} reviews •{" "}
                          {teacher.responseRate.toFixed(0)}% response rate
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Needs Improvement */}
          {summary && summary.needsImprovement.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Needs Improvement</CardTitle>
                <CardDescription>
                  Teachers who may benefit from additional support
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summary.needsImprovement.map((teacher) => (
                    <Card key={teacher.teacherId}>
                      <CardContent className="pt-6">
                        <div className="font-semibold">{teacher.teacherName}</div>
                        <div className="text-sm text-muted-foreground">
                          {teacher.teacherEmail}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                              teacher.averageRating
                            )}`}
                          >
                            {teacher.averageRating.toFixed(2)} / 5.0
                          </span>
                          {getTrendBadge(teacher.performanceTrend)}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {teacher.reviewedVideos} reviews •{" "}
                          {teacher.responseRate.toFixed(0)}% response rate
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Teachers Performance</CardTitle>
              <CardDescription>
                Detailed performance metrics for all teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && metrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total Videos</TableHead>
                        <TableHead>Published</TableHead>
                        <TableHead>Reviewed</TableHead>
                        <TableHead>Avg Rating</TableHead>
                        <TableHead>Response Rate</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Last Review</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.map((teacher: ITeacherPerformanceMetrics) => (
                        <TableRow key={teacher.teacherId}>
                          <TableCell className="font-medium">
                            {teacher.teacherName}
                          </TableCell>
                          <TableCell>{teacher.teacherEmail}</TableCell>
                          <TableCell>{teacher.totalVideos}</TableCell>
                          <TableCell>{teacher.publishedVideos}</TableCell>
                          <TableCell>{teacher.reviewedVideos}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${getRatingColor(
                                teacher.averageRating
                              )}`}
                            >
                              {teacher.averageRating.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {teacher.responseRate.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {getTrendBadge(teacher.performanceTrend)}
                          </TableCell>
                          <TableCell>
                            {teacher.lastReviewDate
                              ? new Date(
                                  teacher.lastReviewDate
                                ).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No teacher performance data found for the selected filters.
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

