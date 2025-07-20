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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function VideoListPage() {
  const router = useRouter();

  type FilterStatus =
    | "all"
    | "unassigned"
    | "assigned"
    | "reviewed"
    | "published";
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [dialogVideoId, setDialogVideoId] = useState<string | null>(null);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);


  // 1️⃣ Fetch videos (automatically typed)
  const filters =
    statusFilter === "all"
      ? {}
      : ({ status: statusFilter } as { status: Exclude<FilterStatus, "all"> });
  const queryParams = { ...filters, page, limit };

  const { data, isFetching } = useGetAllVideosQuery(queryParams);
   const videos = data?.data ?? [];
  const totalPage = data?.meta.totalPage ?? 1;

  // 2️⃣ Fetch teachers (for the Assign dialog)
  const { data: teachers = [] } = useGetAllTeachers();
 
  // 3️⃣ Mutations
  const assignReviewer = useAssignReviewerMutation();

  const publishVideo = usePublishVideoMutation();

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
        <div className="flex items-center space-x-4 mb-4">
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
          <Button
            onClick={() => {
              /* React-Query refetch happens automatically on statusFilter change */
            }}
          >
            Refresh
          </Button>
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
                          value={dialogVideoId === v._id ? selectedReviewer : ""}
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
                            disabled={!selectedReviewer || assignReviewer.isPending}
                          >
                            {assignReviewer.isPending ? "Assigning…" : "Assign"}
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
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    
                  />
                </PaginationItem>

                {Array.from({ length: totalPage }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(idx + 1);
                      }}
                      isActive={page === idx + 1}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPage) setPage(page + 1);
                    }}
                    
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            </div>
      </CardContent>
    </Card>
   </div>
  );
}
