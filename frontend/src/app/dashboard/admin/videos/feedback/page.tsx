"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGetTeacherFeedbackQuery } from "@/hooks/use-video";

export default function TeacherFeedbackList() {
  const router = useRouter();
    const {
    data: videos = [],
    isLoading,
    isError,
  } = useGetTeacherFeedbackQuery();

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

  return (
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
      </CardContent>
    </Card>
  );
}
