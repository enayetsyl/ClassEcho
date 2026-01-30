"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useJuzListQuery } from "@/hooks/use-quran-reference";
import { cn } from "@/lib/utils";

export interface JuzSelectProps {
  value?: number;
  onChange: (juzNumber: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const JUZ_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);

export function JuzSelect({
  value,
  onChange,
  placeholder = "Select Juz/Para",
  disabled = false,
  className,
  id,
}: JuzSelectProps) {
  const { data: juzList = [], isLoading } = useJuzListQuery();

  const getJuzLabel = (num: number) => {
    const juz = juzList.find((j) => j.number === num);
    if (juz) return `Juz ${num} (${juz.nameArabic})`;
    return `Juz ${num}`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>Juz / Para</Label>
      <Select
        value={value != null ? String(value) : ""}
        onValueChange={(v) => onChange(v ? Number(v) : undefined)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {JUZ_OPTIONS.map((num) => (
            <SelectItem key={num} value={String(num)}>
              {getJuzLabel(num)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
