"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useGetQuranStudentsQuery,
  useDeleteQuranStudentMutation,
} from "@/hooks/use-quran-students";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PaginationControl } from "@/components/ui/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type { IQuranStudentFilters } from "@/types/quran.types";

const LIMIT = 10;

export default function QuranStudentListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "true" | "false">(
    "all",
  );

  const params: IQuranStudentFilters = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(search.trim() && { search: search.trim() }),
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
      ...(activeFilter !== "all" && { active: activeFilter }),
    }),
    [page, search, classFilter, supervisionFilter, activeFilter],
  );

  const { data, isFetching } = useGetQuranStudentsQuery(params);
  const deleteStudent = useDeleteQuranStudentMutation();

  const students = data?.data ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const handleDelete = (student: { _id: string; nameEn: string }) => {
    if (
      window.confirm(
        `Deactivate student "${student.nameEn}"? They will be marked inactive.`,
      )
    ) {
      deleteStudent.mutate(student._id);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setClassFilter("");
    setSupervisionFilter("all");
    setActiveFilter("all");
    setPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Quran Students</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/admin/quran/students/add">
              <Button className="w-full md:w-auto">Add Student</Button>
            </Link>
            <Link href="/dashboard/admin/quran/students/bulk">
              <Button variant="outline" className="w-full md:w-auto">
                Bulk Import
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="sm:col-span-2"
            />
            <Input
              placeholder="Class"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={supervisionFilter}
              onValueChange={(v) => {
                setSupervisionFilter(v as "all" | "true" | "false");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Supervision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={activeFilter}
              onValueChange={(v) => {
                setActiveFilter(v as "all" | "true" | "false");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border">
          {isFetching ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No students found.</p>
              <Link href="/dashboard/admin/quran/students/add" className="mt-2">
                <Button variant="link">Add your first student</Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Name (EN)</TableHead>
                    <TableHead>Name (BN)</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-24">Supervision</TableHead>
                    <TableHead className="w-24">Active</TableHead>
                    <TableHead className="text-right w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {s.studentId}
                      </TableCell>
                      <TableCell>{s.nameEn}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.nameBn || "—"}
                      </TableCell>
                      <TableCell>{s.class}</TableCell>
                      <TableCell>
                        <Badge
                          variant={s.supervision ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {s.supervision ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.active ? "default" : "outline"}
                          className="text-xs"
                        >
                          {s.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/dashboard/admin/quran/students/${s._id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteStudent.isPending}
                          onClick={() => handleDelete(s)}
                        >
                          Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPage > 1 && (
                <PaginationControl
                  page={page}
                  totalPage={totalPage}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
