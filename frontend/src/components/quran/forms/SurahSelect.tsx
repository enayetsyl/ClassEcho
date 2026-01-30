"use client";

import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSurahsQuery } from "@/hooks/use-quran-reference";
import { cn } from "@/lib/utils";

export interface SurahSelectProps {
  value?: number;
  onChange: (surahNumber: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function SurahSelect({
  value,
  onChange,
  placeholder = "Select Surah",
  disabled = false,
  className,
  id,
}: SurahSelectProps) {
  const { data: surahs = [], isLoading } = useSurahsQuery();
  const [search, setSearch] = useState("");

  const filteredSurahs = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.toLowerCase();
    return surahs.filter(
      (s) =>
        s.number.toString().includes(q) ||
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        (s.nameBengali && s.nameBengali.includes(q)),
    );
  }, [surahs, search]);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>Surah</Label>
      <Select
        value={value != null ? String(value) : ""}
        onValueChange={(v) => onChange(v ? Number(v) : undefined)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="sticky top-0 z-10 bg-white p-1 border-b">
            <Input
              placeholder="Search by number or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          {filteredSurahs.map((s) => (
            <SelectItem key={s.number} value={String(s.number)}>
              <span className="font-medium">{s.number}.</span>{" "}
              {s.nameEnglish} ({s.nameArabic})
            </SelectItem>
          ))}
          {filteredSurahs.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No surah found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export function getSurahAyahCount(surahs: { number: number; totalAyahs: number }[], surahNumber: number | undefined): number {
  if (surahNumber == null) return 286;
  const s = surahs.find((x) => x.number === surahNumber);
  return s?.totalAyahs ?? 286;
}
