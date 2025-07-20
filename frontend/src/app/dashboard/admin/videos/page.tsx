// src/app/dashboard/admin/videos/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllVideosQuery,
  useAssignReviewerMutation,
  usePublishVideoMutation,
} from "@/hooks/use-video";
import { useGetAllTeachers } from "@/hooks/use-user";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PaginationControl } from "@/components/ui/shared/Pagination";
import { useGetAllClassesQuery } from "@/hooks/use-class";
import { useGetAllSectionsQuery } from "@/hooks/use-section";
import { useGetAllSubjectsQuery } from "@/hooks/use-subject";
import { Input } from "@/components/ui/input";

export default function VideoListPage() {
  const router = useRouter();

  type FilterStatus =
    | "all"
    | "unassigned"
    | "assigned"
    | "reviewed"
    | "published";
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  const [dialogVideoId, setDialogVideoId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");

  // --- pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // --- fetch filter options
  const { data: classes = [] } = useGetAllClassesQuery();
  const { data: sections = [] } = useGetAllSectionsQuery();
  const { data: subjects = [] } = useGetAllSubjectsQuery();
  const { data: teachers = [] } = useGetAllTeachers();

  // --- build filter object only with active filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: Record<string, any> = {};
  if (statusFilter !== "all") filters.status = statusFilter;
  if (classFilter) filters.classId = classFilter;
  if (sectionFilter) filters.sectionId = sectionFilter;
  if (subjectFilter) filters.subjectId = subjectFilter;
  if (teacherFilter) filters.teacherId = teacherFilter;
  if (dateFromFilter) filters.dateFrom = dateFromFilter;
  if (dateToFilter) filters.dateTo = dateToFilter;

  const queryParams = { ...filters, page, limit };

  const { data, isFetching, refetch } = useGetAllVideosQuery(queryParams);
  const videos = data?.data ?? [];
  const totalPage = data?.meta.totalPage ?? 1;

  // 3️⃣ Mutations
  const assignReviewer = useAssignReviewerMutation();

  const publishVideo = usePublishVideoMutation();

  const clearFilters = () => {
    setStatusFilter("all");
    setClassFilter("");
    setSectionFilter("");
    setSubjectFilter("");
    setTeacherFilter("");
    setDateFromFilter("");
    setDateToFilter("");
    setPage(1);
    refetch();
  };

  return (
    <div className="p-4">
      <Card className="my-8">
        <CardHeader>
          <CardTitle>All Class Recordings</CardTitle>
          <CardDescription>
            Filter, assign reviewers, and publish feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter bar */}
          <div className="flex flex-wrap items-center space-x-4 mb-4">
            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={(val: string) =>
                setStatusFilter(val as FilterStatus)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            {/* Class */}
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Section */}
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subject */}
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Teacher */}
            <Select value={teacherFilter} onValueChange={setTeacherFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-center items-center gap-2">
              {/* Date From */}
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                placeholder="From"
              />

              {/* Date To */}
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                placeholder="To"
              />
            </div>

            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v._id}>
                  <TableCell>{v.class.name}</TableCell>
                  <TableCell>{v.teacher.name}</TableCell>
                  <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                  <TableCell>{v.status}</TableCell>
                  <TableCell>{v?.assignedReviewer?.name ?? "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Assign Reviewer */}
                    {v.status === "unassigned" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Assign</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Reviewer</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <Select
                              value={
                                dialogVideoId === v._id ? selectedReviewer : ""
                              }
                              onValueChange={setSelectedReviewer}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Reviewer" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {teachers.map((t) => (
                                  <SelectItem key={t._id} value={t._id}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() =>
                                assignReviewer.mutate(
                                  { id: v._id!, reviewerId: selectedReviewer },
                                  { onSuccess: () => setDialogVideoId(null) }
                                )
                              }
                              disabled={
                                !selectedReviewer || assignReviewer.isPending
                              }
                            >
                              {assignReviewer.isPending
                                ? "Assigning…"
                                : "Assign"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {/* Publish Video */}
                    {v.status === "reviewed" && (
                      <Button
                        size="sm"
                        onClick={() => publishVideo.mutate(v._id!)}
                        disabled={publishVideo.isPending}
                      >
                        {publishVideo.isPending ? "Publishing…" : "Publish"}
                      </Button>
                    )}

                    {/* View Details */}
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/admin/videos/${v._id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isFetching && <div className="text-center py-4">Loading…</div>}
          <div className="flex justify-end mt-4">
            <PaginationControl
              page={page}
              totalPage={totalPage}
              onPageChange={setPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
