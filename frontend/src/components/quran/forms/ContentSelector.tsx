"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { IQuranContent } from "@/types/quran.types";
import { SurahSelect, getSurahAyahCount } from "./SurahSelect";
import { JuzSelect } from "./JuzSelect";
import { useSurahsQuery } from "@/hooks/use-quran-reference";
import { cn } from "@/lib/utils";

export interface ContentSelectorProps {
  value: IQuranContent;
  onChange: (content: IQuranContent) => void;
  testType: "new" | "recent" | "older";
  disabled?: boolean;
  className?: string;
}

const CONTENT_TYPES = [
  { value: "surah", label: "Surah-based" },
  { value: "juz", label: "Juz/Para-based" },
  { value: "custom", label: "Custom" },
] as const;

export function ContentSelector({
  value,
  onChange,
  testType,
  disabled = false,
  className,
}: ContentSelectorProps) {
  const { data: surahs = [] } = useSurahsQuery();
  const type = value?.type ?? "surah";
  const maxAyah = getSurahAyahCount(surahs, value?.surahNumber);

  const update = (partial: Partial<IQuranContent>) => {
    onChange({ ...value, type: type, ...partial });
  };

  const setType = (newType: "surah" | "juz" | "custom") => {
    onChange({
      type: newType,
      surahNumber: undefined,
      surahName: undefined,
      ayahStart: undefined,
      ayahEnd: undefined,
      juzNumber: undefined,
      customDescription: undefined,
    });
  };

  return (
    <div className={cn("space-y-4 rounded-lg border p-4", className)}>
      <div className="space-y-2">
        <Label>Content type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as "surah" | "juz" | "custom")}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {type === "surah" && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          <SurahSelect
            value={value.surahNumber}
            onChange={(surahNumber) => {
              const surah = surahs.find((s) => s.number === surahNumber);
              update({
                surahNumber,
                surahName: surah?.nameEnglish,
                ayahStart: undefined,
                ayahEnd: undefined,
              });
            }}
            disabled={disabled}
          />
          <div className="space-y-2">
            <Label htmlFor={`content-ayah-start-${testType}`}>From Ayah</Label>
            <Input
              id={`content-ayah-start-${testType}`}
              type="number"
              min={1}
              max={maxAyah}
              placeholder="1"
              value={value.ayahStart ?? ""}
              onChange={(e) => {
                const n = e.target.value ? parseInt(e.target.value, 10) : undefined;
                update({ ayahStart: n });
                if (value.ayahEnd != null && n != null && value.ayahEnd < n) {
                  update({ ayahEnd: n });
                }
              }}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`content-ayah-end-${testType}`}>To Ayah (optional)</Label>
            <Input
              id={`content-ayah-end-${testType}`}
              type="number"
              min={value.ayahStart ?? 1}
              max={maxAyah}
              placeholder={`${maxAyah} or leave blank`}
              value={value.ayahEnd ?? ""}
              onChange={(e) => {
                const n = e.target.value ? parseInt(e.target.value, 10) : undefined;
                update({ ayahEnd: n });
              }}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {type === "juz" && (
        <JuzSelect
          value={value.juzNumber}
          onChange={(juzNumber) => update({ juzNumber })}
          disabled={disabled}
        />
      )}

      {type === "custom" && (
        <div className="space-y-2">
          <Label htmlFor={`content-custom-${testType}`}>Content description</Label>
          <Textarea
            id={`content-custom-${testType}`}
            placeholder="e.g., Multiple surahs from Juz Amma"
            value={value.customDescription ?? ""}
            onChange={(e) => update({ customDescription: e.target.value })}
            rows={2}
            disabled={disabled}
            maxLength={200}
          />
        </div>
      )}
    </div>
  );
}
