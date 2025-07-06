"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {  useGetAssignedVideosQuery } from "@/hooks/use-video";

export default function ReviewerDashboard() {
  const router = useRouter();
  // 1️⃣ Use the hook with params for pending reviews
 const { data: videos = [], isLoading, isError } = useGetAssignedVideosQuery();


  if (isLoading) {
    return (
      <Card className="my-8">
        <CardContent>Loading pending reviews…</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="my-8">
        <CardContent>Failed to load pending reviews.</CardContent>
      </Card>
    );
  }


  return (
    <div className="px-5">
      <Card className="my-8">
      <CardHeader>
        <CardTitle>Pending Reviews</CardTitle>
        <CardDescription>Videos assigned to you for review</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map(v => (
              <TableRow key={v._id}>
                <TableCell>{v.class.name}</TableCell>
                <TableCell>{v.teacher.name}</TableCell>
                <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => router.push(`/dashboard/admin/videos/reviewer/${v._id}`)}>
                    Review Now
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
