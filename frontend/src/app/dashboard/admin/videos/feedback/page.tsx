"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGetTeacherFeedbackQuery } from "@/hooks/use-video";
import { PaginationControl } from "@/components/ui/shared/Pagination";

export default function TeacherFeedbackList() {
  const router = useRouter();
    const [page, setPage]   = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, isError } =
    useGetTeacherFeedbackQuery({ page, limit });


  if (isLoading) {
    return (
      <Card className="my-8">
        <CardContent>Loading feedback…</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="my-8">
        <CardContent>Failed to load feedback.</CardContent>
      </Card>
    );
  }

    const videos    = data!.data;
  const totalPage = data!.meta.totalPage;

  return (
    <div className="px-5">
      <Card className="my-8">
      <CardHeader>
        <CardTitle>My Feedback</CardTitle>
        <CardDescription>All published reviews of your classes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map(v => (
              <TableRow key={v._id}>
                <TableCell>{v.class.name}</TableCell>
                <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                <TableCell>{v.assignedReviewer?.name}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => router.push(`/dashboard/admin/videos/feedback/${v._id}`)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {/* Pagination */}
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
