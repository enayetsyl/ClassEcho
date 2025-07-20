"use client";

import React, {useState} from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGetTeacherFeedbackQuery } from "@/hooks/use-video";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={page > 1 ? "#" : undefined}
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
                      isActive={page === idx + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(idx + 1);
                      }}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={page < totalPage ? "#" : undefined}
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
