"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  useGetQuranEntriesQuery,
  useDeleteQuranEntryMutation,
} from "@/hooks/use-quran-entries";
import { useGetQuranStudentsQuery } from "@/hooks/use-quran-students";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/route/ProtectedRoute";
import type {
  IQuranEntryFilters,
  IQuranEntry,
  IQuranStudent,
} from "@/types/quran.types";

const LIMIT = 10;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getStudentDisplay(entry: IQuranEntry): string {
  const s = entry.student;
  if (typeof s === "object" && s !== null && "nameEn" in s) {
    return (s as IQuranStudent).nameEn;
  }
  return typeof s === "string" ? s : "—";
}

function getStudentClass(entry: IQuranEntry): string {
  const s = entry.student;
  if (typeof s === "object" && s !== null && "class" in s) {
    return (s as IQuranStudent).class;
  }
  return "—";
}

export default function QuranEntryListPage() {
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [supervisionFilter, setSupervisionFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ustadName, setUstadName] = useState("");

  const params: IQuranEntryFilters = useMemo(
    () => ({
      page,
      limit: LIMIT,
      ...(studentId && { studentId }),
      ...(classFilter.trim() && { class: classFilter.trim() }),
      ...(supervisionFilter !== "all" && { supervision: supervisionFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(ustadName.trim() && { ustadName: ustadName.trim() }),
    }),
    [
      page,
      studentId,
      classFilter,
      supervisionFilter,
      startDate,
      endDate,
      ustadName,
    ],
  );

  const { data, isFetching } = useGetQuranEntriesQuery(params);
  const deleteEntry = useDeleteQuranEntryMutation();

  // Load students for filter dropdown (first 200)
  const { data: studentsData } = useGetQuranStudentsQuery({
    limit: 200,
    active: "true",
  });
  const students = studentsData?.data ?? [];

  const entries = data?.data ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const handleDelete = (entry: IQuranEntry) => {
    const studentName = getStudentDisplay(entry);
    const dateStr = formatDate(entry.reportDate);
    if (
      window.confirm(
        `Delete this entry for "${studentName}" on ${dateStr}? This cannot be undone.`,
      )
    ) {
      deleteEntry.mutate(entry._id);
    }
  };

  const clearFilters = () => {
    setStudentId("");
    setClassFilter("");
    setSupervisionFilter("all");
    setStartDate("");
    setEndDate("");
    setUstadName("");
    setPage(1);
  };

  return (
    <ProtectedRoute>
      <div className="p-4 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Quran Entries</h1>
          <Link href="/dashboard/admin/quran/entries/add">
            <Button className="w-full md:w-auto">Add Entry</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-lg border p-4 bg-muted/30">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <Input
              type="date"
              placeholder="From"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
            <Input
              type="date"
              placeholder="To"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full"
            />
            <Select
              value={studentId || "all"}
              onValueChange={(v) => {
                setStudentId(v === "all" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All students</SelectItem>
                {students.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.nameEn} ({s.studentId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Input
              placeholder="Ustad name"
              value={ustadName}
              onChange={(e) => {
                setUstadName(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md border">
          {isFetching ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-24 text-center">Tests</TableHead>
                    <TableHead className="w-24 text-center">Tanbih</TableHead>
                    <TableHead className="w-24 text-center">Fath</TableHead>
                    <TableHead className="w-24 text-center">Mistakes</TableHead>
                    <TableHead>Ustad</TableHead>
                    <TableHead className="text-right w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: LIMIT }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Skeleton className="h-8 w-12 inline-block" />
                        <Skeleton className="h-8 w-14 inline-block ml-2" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No entries found.</p>
              <Link href="/dashboard/admin/quran/entries/add" className="mt-2">
                <Button variant="link">Add your first entry</Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="w-24 text-center">Tests</TableHead>
                    <TableHead className="w-24 text-center">Tanbih</TableHead>
                    <TableHead className="w-24 text-center">Fath</TableHead>
                    <TableHead className="w-24 text-center">Mistakes</TableHead>
                    <TableHead>Ustad</TableHead>
                    <TableHead className="text-right w-40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.reportDate)}
                      </TableCell>
                      <TableCell>{getStudentDisplay(entry)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getStudentClass(entry)}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.testsGiven}/3
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.totalTanbih}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.totalFath}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.totalMistakes}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.ustadName || "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link
                          href={`/dashboard/admin/quran/entries/${entry._id}`}
                        >
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteEntry.isPending}
                          onClick={() => handleDelete(entry)}
                        >
                          Delete
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
