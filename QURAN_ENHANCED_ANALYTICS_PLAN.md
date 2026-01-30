# Quran Revision Tracker - Enhanced Analytics Implementation Plan

## Executive Summary

This document outlines the implementation plan for enhancing the Quran Revision Tracking system with structured content selection (Surah/Ayah/Juz dropdowns) and comprehensive analytics/reporting capabilities.

---

## Table of Contents

1. [Current System Analysis](#1-current-system-analysis)
2. [Proposed Schema Changes](#2-proposed-schema-changes)
3. [Static Reference Data](#3-static-reference-data)
4. [New Report Endpoints](#4-new-report-endpoints)
5. [Frontend Components](#5-frontend-components)
6. [Implementation Phases](#6-implementation-phases)
7. [Additional Suggested Metrics](#7-additional-suggested-metrics)

---

## 1. Current System Analysis

### Existing Data Model

The current `QuranEntry` model stores test data with the following structure:

```typescript
{
  student: ObjectId,
  reportDate: Date,
  newTest: { given: boolean, tanbih: number, fath: number, note: string },
  recentTest: { given: boolean, tanbih: number, fath: number, note: string },
  olderTest: { given: boolean, tanbih: number, fath: number, note: string },
  tajweedNotes: { harf, ghunna, madd, other },
  generalNote: string,
  ustadName: string,
  // Computed fields: testsGiven, testsMissed, totalTanbih, totalFath, totalMistakes
}
```

### Current Limitations

1. **Content location stored in notes** - Surah, Ayah ranges, and Juz/Para are entered as free text in the `note` field
2. **No structured content tracking** - Cannot query or aggregate by Surah/Juz
3. **Limited analytics** - Cannot identify strong/weak areas by content
4. **No performance rankings** - Cannot compare students within specific content areas

---

## 2. Proposed Schema Changes

### 2.1 Enhanced Test Schema

Each test (new, recent, older) should capture structured content information:

```typescript
// New test content structure
interface IQuranContent {
  type: 'surah' | 'juz' | 'custom';       // Content type

  // For Surah-based content
  surahNumber?: number;                    // 1-114
  surahName?: string;                      // Auto-populated from reference
  ayahStart?: number;                      // Starting ayah
  ayahEnd?: number;                        // Ending ayah (if range)

  // For Juz-based content
  juzNumber?: number;                      // 1-30

  // For custom/partial content
  customDescription?: string;              // Free text for edge cases
}

// Enhanced test structure
interface IQuranTest {
  given: boolean;
  tanbih: number;
  fath: number;
  note: string;

  // NEW: Structured content fields
  content: IQuranContent;
}
```

### 2.2 Updated QuranEntry Model

**File:** `backend/src/app/modules/quran/entry/quran-entry.model.ts`

```typescript
const quranContentSchema = new Schema({
  type: {
    type: String,
    enum: ['surah', 'juz', 'custom'],
    default: 'surah'
  },
  surahNumber: { type: Number, min: 1, max: 114 },
  surahName: { type: String },
  ayahStart: { type: Number, min: 1 },
  ayahEnd: { type: Number, min: 1 },
  juzNumber: { type: Number, min: 1, max: 30 },
  customDescription: { type: String, maxlength: 200 }
}, { _id: false });

const quranTestSchema = new Schema({
  given: { type: Boolean, default: false },
  tanbih: { type: Number, default: 0, min: 0 },
  fath: { type: Number, default: 0, min: 0 },
  note: { type: String, maxlength: 500 },
  content: quranContentSchema  // NEW FIELD
}, { _id: false });
```

### 2.3 New Indexes for Analytics

```typescript
// Add to quran-entry.model.ts

// For Surah-based queries
QuranEntrySchema.index({ 'newTest.content.surahNumber': 1 });
QuranEntrySchema.index({ 'recentTest.content.surahNumber': 1 });
QuranEntrySchema.index({ 'olderTest.content.surahNumber': 1 });

// For Juz-based queries
QuranEntrySchema.index({ 'newTest.content.juzNumber': 1 });
QuranEntrySchema.index({ 'recentTest.content.juzNumber': 1 });
QuranEntrySchema.index({ 'olderTest.content.juzNumber': 1 });

// Compound indexes for common report queries
QuranEntrySchema.index({ reportDate: -1, 'student': 1 });
QuranEntrySchema.index({ 'newTest.content.surahNumber': 1, reportDate: -1 });
```

---

## 3. Static Reference Data

### 3.1 Surah Reference Table

Create a static reference file with all 114 Surahs:

**File:** `backend/src/app/modules/quran/reference/surah-data.ts`

```typescript
export const SURAH_DATA: ISurahInfo[] = [
  { number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', nameBengali: 'আল-ফাতিহা', totalAyahs: 7, juzStart: 1 },
  { number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', nameBengali: 'আল-বাকারা', totalAyahs: 286, juzStart: 1 },
  { number: 3, nameArabic: 'آل عمران', nameEnglish: 'Aal-E-Imran', nameBengali: 'আলে ইমরান', totalAyahs: 200, juzStart: 3 },
  // ... all 114 surahs
  { number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', nameBengali: 'আন-নাস', totalAyahs: 6, juzStart: 30 },
];

export interface ISurahInfo {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameBengali: string;
  totalAyahs: number;
  juzStart: number;
}
```

### 3.2 Juz Reference Table

**File:** `backend/src/app/modules/quran/reference/juz-data.ts`

```typescript
export const JUZ_DATA: IJuzInfo[] = [
  { number: 1, nameArabic: 'آلم', startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, nameArabic: 'سيقول', startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  // ... all 30 juz
  { number: 30, nameArabic: 'عمّ', startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

export interface IJuzInfo {
  number: number;
  nameArabic: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
}
```

### 3.3 Reference API Endpoints

**File:** `backend/src/app/modules/quran/reference/quran-reference.routes.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quran/reference/surahs` | Get all 114 surahs with details |
| GET | `/api/quran/reference/surahs/:number` | Get single surah details |
| GET | `/api/quran/reference/juz` | Get all 30 juz with boundaries |
| GET | `/api/quran/reference/juz/:number` | Get single juz details |

---

## 4. New Report Endpoints

### 4.1 Summary of New Reports

| Endpoint | Description | Key Metrics |
|----------|-------------|-------------|
| `/quran/reports/test-type-analysis` | Deep analysis by test type | Tanbih/Fath breakdown per new/recent/older |
| `/quran/reports/time-analysis` | Time-based aggregation | Daily, weekly, monthly trends |
| `/quran/reports/student-trend/:id` | Individual student progress | Tanbih/Fath trend over time |
| `/quran/reports/student-content/:id` | Student content analysis | Strong/weak surahs & juz |
| `/quran/reports/surah-analysis` | Surah-wise performance | Top/worst performers per surah |
| `/quran/reports/juz-analysis` | Juz-wise performance | Top/worst performers per juz |
| `/quran/reports/performers` | Top/worst performer rankings | By various criteria |
| `/quran/reports/supervision-detailed` | Detailed supervision comparison | All metrics by supervision status |

---

### 4.2 Test Type Analysis Report

**Endpoint:** `GET /api/quran/reports/test-type-analysis`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `supervision` - Filter by supervision status
- `studentId` - Filter by specific student
- `groupBy` - `day` | `week` | `month` (default: week)

**Response:**
```typescript
interface ITestTypeAnalysisReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    supervision?: boolean;
    studentId?: string;
  };

  summary: {
    totalEntries: number;
    totalStudents: number;
  };

  byTestType: {
    new: {
      givenCount: number;
      missedCount: number;
      totalTanbih: number;
      totalFath: number;
      avgTanbih: number;
      avgFath: number;
      completionRate: number;
    };
    recent: { /* same structure */ };
    older: { /* same structure */ };
  };

  timeline: Array<{
    period: string;  // Date string based on groupBy
    new: { tanbih: number; fath: number; given: number };
    recent: { tanbih: number; fath: number; given: number };
    older: { tanbih: number; fath: number; given: number };
  }>;
}
```

---

### 4.3 Time Analysis Report

**Endpoint:** `GET /api/quran/reports/time-analysis`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `supervision` - Filter by supervision
- `granularity` - `day` | `week` | `month`
- `testType` - `all` | `new` | `recent` | `older`

**Response:**
```typescript
interface ITimeAnalysisReport {
  granularity: 'day' | 'week' | 'month';
  testType: string;

  data: Array<{
    period: string;
    periodStart: string;
    periodEnd: string;

    metrics: {
      entriesCount: number;
      studentsCount: number;
      testsGiven: number;
      testsMissed: number;
      totalTanbih: number;
      totalFath: number;
      totalMistakes: number;
      avgTanbihPerTest: number;
      avgFathPerTest: number;
      avgMistakesPerStudent: number;
    };

    supervised: {
      count: number;
      tanbih: number;
      fath: number;
    };

    unsupervised: {
      count: number;
      tanbih: number;
      fath: number;
    };
  }>;

  comparison: {
    firstHalf: { avgTanbih: number; avgFath: number };
    secondHalf: { avgTanbih: number; avgFath: number };
    trend: 'improving' | 'declining' | 'stable';
    percentageChange: number;
  };
}
```

---

### 4.4 Student Trend Report

**Endpoint:** `GET /api/quran/reports/student-trend/:studentId`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `granularity` - `day` | `week` | `month`

**Response:**
```typescript
interface IStudentTrendReport {
  student: {
    _id: string;
    studentId: number;
    nameEn: string;
    nameBn: string;
    class: string;
    supervision: boolean;
  };

  dateRange: { start: string; end: string };

  overallSummary: {
    totalEntries: number;
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    testCompletionRate: number;
    trend: 'improving' | 'declining' | 'stable';
    improvementRate: number;  // Percentage improvement
  };

  byTestType: {
    new: { avgTanbih: number; avgFath: number; trend: string };
    recent: { avgTanbih: number; avgFath: number; trend: string };
    older: { avgTanbih: number; avgFath: number; trend: string };
  };

  timeline: Array<{
    period: string;
    tanbih: number;
    fath: number;
    total: number;
    testsGiven: number;
    testsMissed: number;
    entries: Array<{
      date: string;
      newTest: { tanbih: number; fath: number };
      recentTest: { tanbih: number; fath: number };
      olderTest: { tanbih: number; fath: number };
    }>;
  }>;

  movingAverage: Array<{
    period: string;
    tanbihMA: number;    // 4-week moving average
    fathMA: number;
    totalMA: number;
  }>;
}
```

---

### 4.5 Student Content Analysis (Strong/Weak Areas)

**Endpoint:** `GET /api/quran/reports/student-content/:studentId`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `minTests` - Minimum tests required for inclusion (default: 2)

**Response:**
```typescript
interface IStudentContentReport {
  student: IQuranStudent;
  dateRange: { start: string; end: string };

  surahAnalysis: {
    strong: Array<{
      surahNumber: number;
      surahName: string;
      testsCount: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
      latestTest: string;
      trend: 'improving' | 'declining' | 'stable';
    }>;
    weak: Array<{
      surahNumber: number;
      surahName: string;
      testsCount: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
      latestTest: string;
      recommendation: string;  // e.g., "Needs more revision"
    }>;
    all: Array</* same structure */>;
  };

  juzAnalysis: {
    strong: Array<{
      juzNumber: number;
      testsCount: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
    }>;
    weak: Array</* same structure */>;
    all: Array</* same structure */>;
  };

  recommendations: Array<{
    type: 'revision_needed' | 'maintain' | 'ready_for_next';
    content: string;  // e.g., "Surah Al-Baqarah needs revision"
    priority: 'high' | 'medium' | 'low';
    basedOn: string;  // Explanation
  }>;
}
```

---

### 4.6 Surah Analysis Report

**Endpoint:** `GET /api/quran/reports/surah-analysis`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `supervision` - Filter by supervision
- `surahNumber` - Filter to specific surah
- `testType` - `all` | `new` | `recent` | `older`
- `limit` - Number of top/worst performers (default: 10)

**Response:**
```typescript
interface ISurahAnalysisReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    surahNumber?: number;
    testType: string;
  };

  // If no specific surah selected, show all surahs overview
  surahOverview?: Array<{
    surahNumber: number;
    surahName: string;
    testsCount: number;
    studentsCount: number;
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    difficulty: 'easy' | 'medium' | 'hard';  // Based on avg mistakes
  }>;

  // For specific surah or all surahs - top/worst performers
  performers: {
    top: Array<{
      student: {
        _id: string;
        studentId: number;
        nameEn: string;
        nameBn: string;
        class: string;
      };
      testsCount: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
      latestScore: { tanbih: number; fath: number };
    }>;
    worst: Array</* same structure */>;
  };

  byClass: Array<{
    class: string;
    studentCount: number;
    testsCount: number;
    avgTanbih: number;
    avgFath: number;
  }>;
}
```

---

### 4.7 Juz Analysis Report

**Endpoint:** `GET /api/quran/reports/juz-analysis`

**Query Parameters:**
- Same as surah analysis but with `juzNumber` instead of `surahNumber`

**Response:**
```typescript
interface IJuzAnalysisReport {
  filters: { /* same as surah */ };

  juzOverview?: Array<{
    juzNumber: number;
    testsCount: number;
    studentsCount: number;
    avgTanbih: number;
    avgFath: number;
    avgMistakes: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;

  performers: {
    top: Array</* same as surah */>;
    worst: Array</* same as surah */>;
  };

  byClass: Array</* same as surah */>;
}
```

---

### 4.8 Overall Performers Report

**Endpoint:** `GET /api/quran/reports/performers`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `supervision` - Filter by supervision
- `testType` - `all` | `new` | `recent` | `older`
- `metric` - `tanbih` | `fath` | `total` | `completion_rate`
- `limit` - Number of performers (default: 10)

**Response:**
```typescript
interface IPerformersReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    supervision?: boolean;
    testType: string;
    metric: string;
  };

  topPerformers: Array<{
    rank: number;
    student: {
      _id: string;
      studentId: number;
      nameEn: string;
      nameBn: string;
      class: string;
      supervision: boolean;
    };
    stats: {
      entriesCount: number;
      testsGiven: number;
      testsMissed: number;
      totalTanbih: number;
      totalFath: number;
      totalMistakes: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
      testCompletionRate: number;
    };
    trend: 'improving' | 'declining' | 'stable';
    lastEntry: string;
  }>;

  worstPerformers: Array</* same structure */>;

  // Comparison by test type
  byTestType: {
    new: {
      top: Array<{ student: IQuranStudent; avgMistakes: number }>;
      worst: Array<{ student: IQuranStudent; avgMistakes: number }>;
    };
    recent: { /* same */ };
    older: { /* same */ };
  };
}
```

---

### 4.9 Detailed Supervision Comparison

**Endpoint:** `GET /api/quran/reports/supervision-detailed`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `groupBy` - `day` | `week` | `month`

**Response:**
```typescript
interface ISupervisionDetailedReport {
  dateRange: { start: string; end: string };

  summary: {
    supervised: {
      studentCount: number;
      entryCount: number;
      avgTanbih: number;
      avgFath: number;
      avgMistakes: number;
      testCompletionRate: number;
      improvementRate: number;
    };
    unsupervised: { /* same structure */ };
    difference: {
      tanbihDiff: number;       // supervised - unsupervised
      fathDiff: number;
      mistakesDiff: number;
      completionRateDiff: number;
      conclusion: string;       // e.g., "Supervised students perform 15% better"
    };
  };

  byTestType: {
    new: {
      supervised: { avgTanbih: number; avgFath: number; count: number };
      unsupervised: { avgTanbih: number; avgFath: number; count: number };
    };
    recent: { /* same */ };
    older: { /* same */ };
  };

  timeline: Array<{
    period: string;
    supervised: {
      entries: number;
      tanbih: number;
      fath: number;
      avgMistakes: number;
    };
    unsupervised: { /* same */ };
  }>;

  byClass: Array<{
    class: string;
    supervised: { count: number; avgMistakes: number };
    unsupervised: { count: number; avgMistakes: number };
    supervisionImpact: number;  // Percentage difference
  }>;
}
```

---

## 5. Frontend Components

### 5.1 Updated Entry Form with Content Selection

**File:** `frontend/src/app/dashboard/admin/quran/entries/add/page.tsx`

#### New Content Selection Component

```tsx
interface ContentSelectorProps {
  value: IQuranContent;
  onChange: (content: IQuranContent) => void;
  testType: 'new' | 'recent' | 'older';
}

const ContentSelector: React.FC<ContentSelectorProps> = ({ value, onChange, testType }) => {
  return (
    <div className="space-y-4 border p-4 rounded-lg">
      {/* Content Type Selection */}
      <div className="flex gap-4">
        <RadioGroup value={value.type} onValueChange={(type) => onChange({ ...value, type })}>
          <RadioGroupItem value="surah" label="Surah-based" />
          <RadioGroupItem value="juz" label="Juz/Para-based" />
          <RadioGroupItem value="custom" label="Custom" />
        </RadioGroup>
      </div>

      {/* Surah Selection */}
      {value.type === 'surah' && (
        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Surah"
            value={value.surahNumber}
            onChange={(num) => onChange({ ...value, surahNumber: num })}
            options={surahOptions}
            searchable
          />
          <Input
            label="From Ayah"
            type="number"
            value={value.ayahStart}
            onChange={(e) => onChange({ ...value, ayahStart: parseInt(e.target.value) })}
            min={1}
            max={getSurahAyahCount(value.surahNumber)}
          />
          <Input
            label="To Ayah (optional)"
            type="number"
            value={value.ayahEnd}
            onChange={(e) => onChange({ ...value, ayahEnd: parseInt(e.target.value) })}
            min={value.ayahStart || 1}
            max={getSurahAyahCount(value.surahNumber)}
          />
        </div>
      )}

      {/* Juz Selection */}
      {value.type === 'juz' && (
        <Select
          label="Juz/Para Number"
          value={value.juzNumber}
          onChange={(num) => onChange({ ...value, juzNumber: num })}
          options={juzOptions}  // 1-30
        />
      )}

      {/* Custom Description */}
      {value.type === 'custom' && (
        <Textarea
          label="Content Description"
          value={value.customDescription}
          onChange={(e) => onChange({ ...value, customDescription: e.target.value })}
          placeholder="e.g., Multiple surahs from Juz Amma"
        />
      )}
    </div>
  );
};
```

#### Updated Form Layout

```
+------------------------------------------------------------------+
|  Quran Weekly Revision Entry                                      |
+------------------------------------------------------------------+
|  Student: [Searchable Dropdown]        Report Date: [Date Picker] |
|  Class: [Auto-filled]                  Supervision: [Auto]        |
+------------------------------------------------------------------+
|  NEW MEMORIZATION TEST (নতুন মুখস্ত)                              |
|  [x] Test Given?                                                  |
|  Content: ( ) Surah  ( ) Juz/Para  ( ) Custom                     |
|  [Surah Dropdown: Al-Baqarah ▼] Ayah: [1] to [20]                 |
|  Tanbih: [___]   Fath: [___]                                      |
|  Note: [_________________________________________________]        |
+------------------------------------------------------------------+
|  RECENT REVISION TEST (সর্বসাম্প্রতিক)                            |
|  [x] Test Given?                                                  |
|  Content: ( ) Surah  ( ) Juz/Para  ( ) Custom                     |
|  [Juz Dropdown: Juz 30 (Amma) ▼]                                  |
|  Tanbih: [___]   Fath: [___]                                      |
|  Note: [_________________________________________________]        |
+------------------------------------------------------------------+
|  OLDER REVISION TEST (পুরনো রিভিশন)                               |
|  [x] Test Given?                                                  |
|  Content: ( ) Surah  ( ) Juz/Para  ( ) Custom                     |
|  [Surah Dropdown ▼] Ayah: [1] to [All]                            |
|  Tanbih: [___]   Fath: [___]                                      |
|  Note: [_________________________________________________]        |
+------------------------------------------------------------------+
|  TAJWEED NOTES (তিলাওয়াতে উচ্চারণে ভুল)                          |
|  Harf: [____________]  Ghunna: [____________]                     |
|  Madd: [____________]  Other:  [____________]                     |
+------------------------------------------------------------------+
|  General Note: [___________________________________________]      |
|  Ustad Name: [______________]                                     |
+------------------------------------------------------------------+
|                    [Cancel]  [Submit Entry]                       |
+------------------------------------------------------------------+
```

### 5.2 New Report Pages & Charts

#### 5.2.1 Test Type Analysis Page

**File:** `frontend/src/app/dashboard/admin/quran/reports/test-type/page.tsx`

**Charts:**
1. **Stacked Bar Chart** - Tanbih/Fath by test type (new, recent, older)
2. **Grouped Bar Chart** - Comparison of test types over time
3. **Radar Chart** - Performance across all test types
4. **Line Chart** - Trend of each test type over time

```tsx
// Components
<TestTypeComparisonChart data={report.byTestType} />
<TestTypeTimelineChart data={report.timeline} />
<TestTypeRadarChart data={report.byTestType} />
```

#### 5.2.2 Time Analysis Page

**File:** `frontend/src/app/dashboard/admin/quran/reports/time/page.tsx`

**Charts:**
1. **Multi-Line Chart** - Tanbih, Fath, Total over time
2. **Area Chart** - Stacked supervised vs unsupervised
3. **Heat Map** - Day of week × Week performance
4. **Bar Chart** - Monthly comparison

```tsx
<TimeSeriesChart
  data={report.data}
  granularity={granularity}
  metrics={['totalTanbih', 'totalFath', 'avgMistakesPerStudent']}
/>
<SupervisionComparisonArea data={report.data} />
<TrendIndicator trend={report.comparison.trend} change={report.comparison.percentageChange} />
```

#### 5.2.3 Student Trend Page

**File:** `frontend/src/app/dashboard/admin/quran/reports/student/[id]/trend/page.tsx`

**Charts:**
1. **Line Chart with Moving Average** - Student progress over time
2. **Small Multiples** - Mini charts for each test type
3. **Progress Indicator** - Improvement percentage
4. **Sparklines** - Quick trend indicators in summary cards

```tsx
<StudentProgressChart
  timeline={report.timeline}
  movingAverage={report.movingAverage}
/>
<TestTypeBreakdownCards byTestType={report.byTestType} />
<ImprovementGauge rate={report.overallSummary.improvementRate} />
```

#### 5.2.4 Student Content Analysis Page

**File:** `frontend/src/app/dashboard/admin/quran/reports/student/[id]/content/page.tsx`

**Charts:**
1. **Horizontal Bar Chart** - Strong vs Weak Surahs
2. **Bubble Chart** - Surah performance (x: tests count, y: avg mistakes, size: recent activity)
3. **Juz Heatmap** - 30-cell grid showing performance by Juz
4. **Recommendation Cards** - Actionable insights

```tsx
<SurahStrengthChart strong={report.surahAnalysis.strong} weak={report.surahAnalysis.weak} />
<JuzHeatmap data={report.juzAnalysis.all} />
<ContentBubbleChart data={report.surahAnalysis.all} />
<RecommendationsList recommendations={report.recommendations} />
```

#### 5.2.5 Surah/Juz Analysis Page

**File:** `frontend/src/app/dashboard/admin/quran/reports/content/page.tsx`

**Charts:**
1. **Scrollable Table** - All surahs/juz with metrics
2. **Performer Cards** - Top 5 and Bottom 5 students
3. **Class Comparison Bar** - Performance by class for selected content
4. **Difficulty Indicator** - Based on average mistakes

```tsx
<ContentOverviewTable
  data={report.surahOverview || report.juzOverview}
  type={contentType}
/>
<TopPerformersCard performers={report.performers.top} title="Top Performers" />
<WorstPerformersCard performers={report.performers.worst} title="Need Improvement" />
<ClassComparisonChart data={report.byClass} />
```

#### 5.2.6 Performers Dashboard

**File:** `frontend/src/app/dashboard/admin/quran/reports/performers/page.tsx`

**Charts:**
1. **Leaderboard Table** - Ranked list with key metrics
2. **Comparison Cards** - Top vs Worst side by side
3. **Filter Tabs** - By test type (new, recent, older)
4. **Trend Badges** - Improving/Declining indicators

```tsx
<LeaderboardTable
  top={report.topPerformers}
  worst={report.worstPerformers}
  metric={selectedMetric}
/>
<PerformersByTestType data={report.byTestType} />
```

#### 5.2.7 Supervision Comparison Dashboard

**File:** `frontend/src/app/dashboard/admin/quran/reports/supervision/page.tsx`

**Charts:**
1. **Side-by-Side KPI Cards** - Supervised vs Unsupervised
2. **Grouped Bar Chart** - Metrics comparison
3. **Line Chart** - Timeline comparison
4. **Impact Analysis** - Statistical significance indicator

```tsx
<SupervisionSummaryCards
  supervised={report.summary.supervised}
  unsupervised={report.summary.unsupervised}
  difference={report.summary.difference}
/>
<SupervisionByTestTypeChart data={report.byTestType} />
<SupervisionTimelineChart data={report.timeline} />
<ClassImpactTable data={report.byClass} />
```

### 5.3 New Chart Components

| Component | Chart Type | Library | Purpose |
|-----------|-----------|---------|---------|
| `TestTypeComparisonChart` | Stacked Bar | Recharts | Compare tanbih/fath across test types |
| `TimeSeriesChart` | Multi-Line | Recharts | Trend over time with multiple metrics |
| `StudentProgressChart` | Line + Moving Avg | Recharts | Individual student progress |
| `SurahStrengthChart` | Horizontal Bar | Recharts | Strong vs weak surahs |
| `JuzHeatmap` | Heatmap Grid | Custom + CSS | Visual 30-cell juz performance |
| `ContentBubbleChart` | Bubble | Recharts | Multi-dimensional content analysis |
| `LeaderboardTable` | Data Table | Tanstack Table | Ranked performer list |
| `SupervisionComparisonArea` | Stacked Area | Recharts | Supervised vs unsupervised over time |
| `TrendIndicator` | Custom | React | Visual improving/declining indicator |
| `ImprovementGauge` | Gauge/Progress | Custom | Percentage improvement display |

---

## 6. Implementation Phases

### Phase 1: Schema Enhancement (Backend)

**Duration:** Priority 1

**Tasks:**
1. Create Surah and Juz reference data files
2. Add `IQuranContent` schema to test structure
3. Update `QuranEntry` model with new fields
4. Create migration script for existing entries (set `content.type = 'custom'` with note as description)
5. Add new indexes for content-based queries
6. Create reference API endpoints
7. Update entry validation schemas
8. Update entry service to handle content fields

**Files to Create:**
- `backend/src/app/modules/quran/reference/surah-data.ts`
- `backend/src/app/modules/quran/reference/juz-data.ts`
- `backend/src/app/modules/quran/reference/quran-reference.routes.ts`
- `backend/src/app/modules/quran/reference/quran-reference.controller.ts`

**Files to Modify:**
- `backend/src/app/modules/quran/entry/quran-entry.model.ts`
- `backend/src/app/modules/quran/entry/quran-entry.type.ts`
- `backend/src/app/modules/quran/entry/quran-entry.validation.ts`
- `backend/src/app/modules/quran/entry/quran-entry.service.ts`

---

### Phase 2: New Report Endpoints (Backend)

**Duration:** Priority 2

**Tasks:**
1. Implement test type analysis aggregation
2. Implement time analysis aggregation with granularity support
3. Implement student trend analysis with moving average
4. Implement student content analysis (strong/weak detection)
5. Implement surah analysis with performer ranking
6. Implement juz analysis with performer ranking
7. Implement overall performers report
8. Enhance supervision comparison with detailed metrics
9. Add new report types to validation and routes

**Files to Create/Modify:**
- `backend/src/app/modules/quran/reports/quran-reports.service.ts` (extend)
- `backend/src/app/modules/quran/reports/quran-reports.controller.ts` (extend)
- `backend/src/app/modules/quran/reports/quran-reports.routes.ts` (extend)
- `backend/src/app/modules/quran/reports/quran-reports.type.ts` (extend)

---

### Phase 3: Frontend Types & Services

**Duration:** Priority 3

**Tasks:**
1. Add new type definitions for content and reports
2. Create reference service for surah/juz data
3. Update entry service for content fields
4. Add new report service methods
5. Create React Query hooks for new reports
6. Add caching for static reference data

**Files to Modify:**
- `frontend/src/types/quran.types.ts`
- `frontend/src/services/quran-entry.service.ts`
- `frontend/src/services/quran-reports.service.ts`
- `frontend/src/hooks/use-quran-entries.ts`
- `frontend/src/hooks/use-quran-reports.ts`

**Files to Create:**
- `frontend/src/services/quran-reference.service.ts`
- `frontend/src/hooks/use-quran-reference.ts`

---

### Phase 4: Entry Form Enhancement (Frontend)

**Duration:** Priority 4

**Tasks:**
1. Create `ContentSelector` component
2. Create `SurahSelect` component with search
3. Create `JuzSelect` component
4. Update entry form with content selection
5. Add form validation for content fields
6. Test form submission with new fields

**Files to Create:**
- `frontend/src/components/quran/forms/ContentSelector.tsx`
- `frontend/src/components/quran/forms/SurahSelect.tsx`
- `frontend/src/components/quran/forms/JuzSelect.tsx`

**Files to Modify:**
- `frontend/src/app/dashboard/admin/quran/entries/add/page.tsx`
- `frontend/src/app/dashboard/admin/quran/entries/[id]/page.tsx`

---

### Phase 5: New Report Pages & Charts (Frontend)

**Duration:** Priority 5

**Tasks:**
1. Create test type analysis page with charts
2. Create time analysis page with charts
3. Create enhanced student trend page
4. Create student content analysis page
5. Create surah/juz analysis page
6. Create performers dashboard
7. Create enhanced supervision comparison page
8. Update reports navigation

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/test-type/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/time/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/student/[id]/trend/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/student/[id]/content/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/content/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/performers/page.tsx`
- `frontend/src/components/quran/charts/TestTypeComparisonChart.tsx`
- `frontend/src/components/quran/charts/TimeSeriesChart.tsx`
- `frontend/src/components/quran/charts/StudentProgressChart.tsx`
- `frontend/src/components/quran/charts/SurahStrengthChart.tsx`
- `frontend/src/components/quran/charts/JuzHeatmap.tsx`
- `frontend/src/components/quran/charts/ContentBubbleChart.tsx`
- `frontend/src/components/quran/charts/LeaderboardTable.tsx`
- `frontend/src/components/quran/charts/SupervisionComparisonArea.tsx`

---

### Phase 6: Polish & Testing

**Duration:** Priority 6

**Tasks:**
1. Add loading states and skeletons
2. Add error handling and empty states
3. Add export functionality (PDF/CSV)
4. Performance optimization (memo, virtualization)
5. Mobile responsiveness
6. Unit tests for aggregation logic
7. E2E tests for report pages

---

## 7. Additional Metrics - Detailed Implementation

This section provides comprehensive implementation details for all additional metrics including schema changes, API endpoints, response types, and frontend components.

---

### 7.1 Consistency Metrics

#### 7.1.1 Schema Additions

Add to `QuranStudent` model for tracking consistency:

```typescript
// Add to quran-student.model.ts
{
  // Computed consistency fields (updated via cron job or on entry save)
  consistencyStats: {
    currentStreak: { type: Number, default: 0 },           // Consecutive weeks with entries
    longestStreak: { type: Number, default: 0 },           // Best streak ever
    lastEntryDate: { type: Date },                          // Most recent entry
    totalExpectedEntries: { type: Number, default: 0 },    // Based on enrollment date
    totalActualEntries: { type: Number, default: 0 },      // Actual entries submitted
    attendanceRate: { type: Number, default: 0 },          // Percentage
    testRegularityScore: { type: Number, default: 0 },     // 0-100 score
  }
}
```

#### 7.1.2 API Endpoint

**Endpoint:** `GET /api/quran/reports/consistency`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `studentId` - Filter by specific student
- `minEntries` - Minimum entries for inclusion (default: 4)

**Response:**
```typescript
interface IConsistencyReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
  };

  // Overall stats
  summary: {
    totalStudents: number;
    avgAttendanceRate: number;
    avgTestRegularityScore: number;
    studentsWithPerfectAttendance: number;
    studentsAtRisk: number;  // Low attendance
  };

  // Per-student breakdown
  students: Array<{
    student: {
      _id: string;
      studentId: number;
      nameEn: string;
      nameBn: string;
      class: string;
    };
    metrics: {
      currentStreak: number;
      longestStreak: number;
      attendanceRate: number;           // Entries submitted / expected * 100
      testRegularityScore: number;      // All 3 tests given / total tests possible * 100
      missedWeeks: number;
      consecutiveMissedWeeks: number;   // Current gap
      lastEntryDate: string;
      daysSinceLastEntry: number;
    };
    weeklyDetail: Array<{
      weekStart: string;
      hasEntry: boolean;
      testsGiven: number;
      testsMissed: number;
    }>;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }>;

  // Gap analysis calendar data
  calendarData: Array<{
    date: string;
    entriesCount: number;
    status: 'full' | 'partial' | 'missing';
  }>;

  // Streaks leaderboard
  streakLeaderboard: Array<{
    rank: number;
    student: IQuranStudent;
    currentStreak: number;
    longestStreak: number;
  }>;
}
```

#### 7.1.3 MongoDB Aggregation

```typescript
// Consistency metrics aggregation
async getConsistencyReport(filters: IReportFilters): Promise<IConsistencyReport> {
  const { startDate, endDate, classFilter } = filters;

  // Calculate expected weeks in range
  const weeksInRange = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  const pipeline = [
    // Get all students
    {
      $lookup: {
        from: 'quranentries',
        let: { studentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$student', '$$studentId'] },
              reportDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
          },
          { $sort: { reportDate: 1 } }
        ],
        as: 'entries'
      }
    },
    // Calculate metrics
    {
      $addFields: {
        totalEntries: { $size: '$entries' },
        attendanceRate: {
          $multiply: [
            { $divide: [{ $size: '$entries' }, weeksInRange] },
            100
          ]
        },
        totalTestsGiven: { $sum: '$entries.testsGiven' },
        totalTestsPossible: { $multiply: [{ $size: '$entries' }, 3] },
        testRegularityScore: {
          $cond: [
            { $gt: [{ $size: '$entries' }, 0] },
            {
              $multiply: [
                { $divide: [
                  { $sum: '$entries.testsGiven' },
                  { $multiply: [{ $size: '$entries' }, 3] }
                ]},
                100
              ]
            },
            0
          ]
        }
      }
    },
    // Calculate streaks (requires custom logic in service)
    {
      $project: {
        student: {
          _id: '$_id',
          studentId: '$studentId',
          nameEn: '$nameEn',
          nameBn: '$nameBn',
          class: '$class'
        },
        entries: 1,
        attendanceRate: 1,
        testRegularityScore: 1,
        totalEntries: 1
      }
    }
  ];

  // Execute and calculate streaks in service layer
}
```

#### 7.1.4 Streak Calculation Logic

```typescript
// Calculate streak from entries
function calculateStreaks(entries: IQuranEntry[], startDate: Date, endDate: Date) {
  const weekMap = new Map<string, boolean>();

  // Mark weeks with entries
  entries.forEach(entry => {
    const weekKey = getISOWeek(entry.reportDate);
    weekMap.set(weekKey, true);
  });

  // Generate all weeks in range
  const allWeeks = getAllWeeksInRange(startDate, endDate);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let consecutiveMissed = 0;

  // Calculate from most recent backwards
  for (let i = allWeeks.length - 1; i >= 0; i--) {
    const week = allWeeks[i];
    if (weekMap.has(week)) {
      tempStreak++;
      consecutiveMissed = 0;
      if (currentStreak === 0) currentStreak = tempStreak;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      if (currentStreak === 0) consecutiveMissed++;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak, consecutiveMissed };
}
```

#### 7.1.5 Frontend Components

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/consistency/page.tsx`
- `frontend/src/components/quran/charts/ConsistencyCalendarHeatmap.tsx`
- `frontend/src/components/quran/charts/StreakLeaderboard.tsx`
- `frontend/src/components/quran/charts/AttendanceProgressRing.tsx`

**Page Layout:**
```
+------------------------------------------------------------------+
|  Consistency & Attendance Report                                  |
+------------------------------------------------------------------+
|  [Date Range Picker]  [Class Filter]  [Export Button]            |
+------------------------------------------------------------------+
|  KPI CARDS                                                        |
|  +------------+  +------------+  +------------+  +------------+  |
|  | Avg        |  | Test       |  | Perfect    |  | At Risk    |  |
|  | Attendance |  | Regularity |  | Attendance |  | Students   |  |
|  | 87%        |  | 92%        |  | 12         |  | 3          |  |
|  +------------+  +------------+  +------------+  +------------+  |
+------------------------------------------------------------------+
|  CALENDAR HEATMAP                                                 |
|  [Jan]  [Feb]  [Mar]  [Apr]  [May]  ...                          |
|  ████████████████████████████████████████                         |
|  Legend: ■ Full  ▒ Partial  □ Missing                            |
+------------------------------------------------------------------+
|  STREAK LEADERBOARD          |  AT-RISK STUDENTS                 |
|  +------------------------+  |  +----------------------------+   |
|  | 1. Ibrahim - 12 weeks  |  |  | ⚠️ Student A - 3 weeks gap |   |
|  | 2. Fatima - 10 weeks   |  |  | ⚠️ Student B - 2 weeks gap |   |
|  | 3. Ahmed - 8 weeks     |  |  | ⚠️ Student C - Low score   |   |
|  +------------------------+  |  +----------------------------+   |
+------------------------------------------------------------------+
|  DETAILED STUDENT TABLE                                           |
|  [Search] [Filter by Status]                                      |
|  +----+--------+------------+---------+--------+--------+        |
|  | ID | Name   | Attendance | Streak  | Last   | Status |        |
|  +----+--------+------------+---------+--------+--------+        |
|  | 1  | Ibrahim| 95%        | 12 wks  | 2 days | ✓      |        |
|  | 2  | Fatima | 87%        | 10 wks  | 5 days | ✓      |        |
|  | 3  | Ahmed  | 62%        | 2 wks   | 14 days| ⚠️      |        |
|  +----+--------+------------+---------+--------+--------+        |
+------------------------------------------------------------------+
```

---

### 7.2 Progress Metrics

#### 7.2.1 Schema Additions

Add computed progress fields:

```typescript
// Add to quran-student.model.ts
{
  progressStats: {
    // Memorization tracking
    totalSurahsCompleted: { type: Number, default: 0 },
    totalJuzCompleted: { type: Number, default: 0 },
    surahsInProgress: [{ type: Number }],  // Array of surah numbers

    // Performance scores
    masteryScore: { type: Number, default: 0 },           // 0-100 weighted score
    improvementVelocity: { type: Number, default: 0 },    // Mistakes reduction rate

    // Milestones
    lastMilestone: {
      type: { type: String },  // 'surah_completed', 'juz_completed', 'streak'
      value: { type: String },
      date: { type: Date }
    }
  }
}

// Add to quran-entry.model.ts - content completion tracking
{
  contentCompletion: {
    surahCompleted: { type: Boolean, default: false },    // Full surah tested
    juzCompleted: { type: Boolean, default: false },      // Full juz tested
    ayahsCovered: { type: Number, default: 0 }            // Number of ayahs in this test
  }
}
```

#### 7.2.2 API Endpoint

**Endpoint:** `GET /api/quran/reports/progress`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `studentId` - Filter by specific student

**Response:**
```typescript
interface IProgressReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
  };

  // Overall progress summary
  summary: {
    totalStudents: number;
    avgMasteryScore: number;
    avgImprovementVelocity: number;
    studentsImproving: number;
    studentsDeclining: number;
    studentsStable: number;
  };

  // Per-student progress
  students: Array<{
    student: IQuranStudent;
    progress: {
      masteryScore: number;                    // 0-100 weighted score
      masteryGrade: 'A' | 'B' | 'C' | 'D' | 'F';
      improvementVelocity: number;             // % change per month
      trend: 'improving' | 'declining' | 'stable';

      // Memorization progress
      memorization: {
        surahsCompleted: number[];             // Array of completed surah numbers
        surahsInProgress: number[];            // Currently being memorized
        juzCompleted: number[];                // Array of completed juz numbers
        estimatedCompletion: string;           // Projected date for current content
        progressPercentage: number;            // Overall Quran progress
      };

      // Historical data for charts
      monthlyScores: Array<{
        month: string;
        masteryScore: number;
        avgMistakes: number;
      }>;

      // Milestones achieved
      milestones: Array<{
        type: 'surah_completed' | 'juz_completed' | 'streak_achieved' | 'mastery_level';
        description: string;
        date: string;
        value: string;
      }>;
    };
  }>;

  // Improvement leaderboard
  improvementLeaderboard: Array<{
    rank: number;
    student: IQuranStudent;
    improvementVelocity: number;
    previousAvgMistakes: number;
    currentAvgMistakes: number;
  }>;

  // Mastery distribution
  masteryDistribution: {
    A: number;  // 90-100
    B: number;  // 80-89
    C: number;  // 70-79
    D: number;  // 60-69
    F: number;  // Below 60
  };
}
```

#### 7.2.3 Mastery Score Calculation

```typescript
// Mastery score formula (0-100)
function calculateMasteryScore(entries: IQuranEntry[]): number {
  if (entries.length === 0) return 0;

  // Weights
  const TANBIH_WEIGHT = 0.4;    // Correction mistakes (less severe)
  const FATH_WEIGHT = 0.6;      // Forgetting mistakes (more severe)
  const COMPLETION_WEIGHT = 0.2; // Test completion bonus

  let totalScore = 0;
  let totalWeight = 0;

  entries.forEach((entry, index) => {
    // More recent entries have higher weight
    const recencyWeight = 1 + (index / entries.length) * 0.5;

    // Calculate test score (inverse of mistakes)
    const maxMistakesPerTest = 20;  // Baseline for scoring
    const testsGiven = entry.testsGiven || 1;

    const tanbihScore = Math.max(0, 100 - (entry.totalTanbih / testsGiven) * (100 / maxMistakesPerTest));
    const fathScore = Math.max(0, 100 - (entry.totalFath / testsGiven) * (100 / maxMistakesPerTest));
    const completionBonus = (entry.testsGiven / 3) * 100;

    const entryScore =
      (tanbihScore * TANBIH_WEIGHT) +
      (fathScore * FATH_WEIGHT) +
      (completionBonus * COMPLETION_WEIGHT);

    totalScore += entryScore * recencyWeight;
    totalWeight += recencyWeight;
  });

  return Math.round(totalScore / totalWeight);
}

// Improvement velocity (% change per month)
function calculateImprovementVelocity(entries: IQuranEntry[]): number {
  if (entries.length < 4) return 0;

  // Sort by date
  const sorted = [...entries].sort((a, b) =>
    new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
  );

  // First half vs second half comparison
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.totalMistakes, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.totalMistakes, 0) / secondHalf.length;

  if (firstHalfAvg === 0) return 0;

  // Negative velocity = improvement (fewer mistakes)
  const velocity = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * -100;
  return Math.round(velocity * 10) / 10;
}
```

#### 7.2.4 Frontend Components

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/progress/page.tsx`
- `frontend/src/components/quran/charts/MasteryGauge.tsx`
- `frontend/src/components/quran/charts/ProgressTimeline.tsx`
- `frontend/src/components/quran/charts/MilestoneTracker.tsx`
- `frontend/src/components/quran/charts/QuranProgressMap.tsx` (visual 114 surah grid)

**Page Layout:**
```
+------------------------------------------------------------------+
|  Progress & Mastery Report                                        |
+------------------------------------------------------------------+
|  [Date Range Picker]  [Class Filter]  [Student Selector]         |
+------------------------------------------------------------------+
|  SUMMARY CARDS                                                    |
|  +------------+  +------------+  +------------+  +------------+  |
|  | Avg Mastery|  | Improving  |  | Declining  |  | Stable     |  |
|  | Score: 78  |  | 45 (60%)   |  | 12 (16%)   |  | 18 (24%)   |  |
|  +------------+  +------------+  +------------+  +------------+  |
+------------------------------------------------------------------+
|  MASTERY DISTRIBUTION         |  IMPROVEMENT LEADERBOARD         |
|  +------------------------+   |  +---------------------------+   |
|  |     Histogram          |   |  | 1. Ibrahim  +25% ↑        |   |
|  |  ▄▄▄▄                  |   |  | 2. Fatima   +18% ↑        |   |
|  |  ████  ▄▄              |   |  | 3. Ahmed    +15% ↑        |   |
|  |  ████  ██  ▄▄          |   |  | ...                       |   |
|  |  A   B   C   D   F     |   |  +---------------------------+   |
|  +------------------------+   |                                  |
+------------------------------------------------------------------+
|  QURAN PROGRESS MAP (for selected student)                       |
|  +------------------------------------------------------------+  |
|  | Juz 1  | Juz 2  | Juz 3  | ... | Juz 30 |                  |  |
|  | ██████ | ██░░░░ | ░░░░░░ |     | ██████ |                  |  |
|  | 100%   | 40%    | 0%     |     | 100%   |                  |  |
|  +------------------------------------------------------------+  |
|  Legend: ██ Completed  ▓▓ In Progress  ░░ Not Started           |
+------------------------------------------------------------------+
|  MILESTONES TIMELINE                                             |
|  ──●────────●────────●────────●────────●──────────>              |
|    Surah    Juz 30   10 Week  Surah    Mastery                  |
|    Al-Mulk  Done     Streak   Yasin    Level B                  |
+------------------------------------------------------------------+
```

---

### 7.3 Comparative Metrics

#### 7.3.1 API Endpoint

**Endpoint:** `GET /api/quran/reports/comparative`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `studentId` - Target student for peer comparison
- `compareBy` - `class` | `supervision` | `all`

**Response:**
```typescript
interface IComparativeReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    studentId?: string;
  };

  // Class rankings
  classRankings: Array<{
    class: string;
    rank: number;
    totalStudents: number;
    avgMistakes: number;
    avgMasteryScore: number;
    topPerformer: IQuranStudent;
    mostImproved: IQuranStudent;
  }>;

  // Student rankings within class
  studentRankings: Array<{
    rank: number;
    student: IQuranStudent;
    avgMistakes: number;
    masteryScore: number;
    percentile: number;           // Position in percentage (top 10%, etc.)
    rankChange: number;           // Change from previous period
  }>;

  // Peer comparison (anonymous) for specific student
  peerComparison?: {
    targetStudent: {
      _id: string;
      metrics: {
        avgTanbih: number;
        avgFath: number;
        masteryScore: number;
        testCompletionRate: number;
      };
    };
    classAverage: {
      avgTanbih: number;
      avgFath: number;
      masteryScore: number;
      testCompletionRate: number;
    };
    topQuartile: {
      avgTanbih: number;
      avgFath: number;
      masteryScore: number;
    };
    comparison: {
      vsTanbihAvg: number;        // Percentage better/worse than class
      vsFathAvg: number;
      vsMasteryAvg: number;
      vsCompletionAvg: number;
      overallPosition: string;    // "Above Average", "Top 25%", etc.
    };
  };

  // Ustad effectiveness
  ustadComparison: Array<{
    ustadName: string;
    studentsCount: number;
    entriesCount: number;
    avgStudentMistakes: number;
    avgStudentImprovement: number;
    testCompletionRate: number;
    effectiveness: 'high' | 'medium' | 'low';
  }>;

  // Distribution histogram data
  distribution: {
    mistakesHistogram: Array<{ range: string; count: number }>;
    masteryHistogram: Array<{ range: string; count: number }>;
  };
}
```

#### 7.3.2 Percentile Calculation

```typescript
// Calculate student percentile
function calculatePercentile(studentScore: number, allScores: number[]): number {
  const sorted = [...allScores].sort((a, b) => a - b);
  const index = sorted.findIndex(score => score >= studentScore);
  return Math.round((index / sorted.length) * 100);
}

// Calculate rank change
async function calculateRankChange(
  studentId: string,
  currentPeriod: { start: Date; end: Date },
  previousPeriod: { start: Date; end: Date }
): Promise<number> {
  const currentRank = await getStudentRank(studentId, currentPeriod);
  const previousRank = await getStudentRank(studentId, previousPeriod);
  return previousRank - currentRank;  // Positive = improved
}
```

#### 7.3.3 Frontend Components

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/comparative/page.tsx`
- `frontend/src/components/quran/charts/ClassRankingChart.tsx`
- `frontend/src/components/quran/charts/PeerComparisonRadar.tsx`
- `frontend/src/components/quran/charts/PercentileGauge.tsx`
- `frontend/src/components/quran/charts/UstadEffectivenessChart.tsx`
- `frontend/src/components/quran/charts/DistributionHistogram.tsx`

**Peer Comparison Radar Chart:**
```
                    Tanbih (Lower is Better)
                           ▲
                          /|\
                         / | \
                        /  |  \
                       /   |   \
         Completion ──/────●────\── Mastery
                     /     |     \
                    /      |      \
                   /       |       \
                  ▼        ▼        ▼
                      Fath (Lower is Better)

        ─── Student    ─── Class Average    ─── Top 25%
```

---

### 7.4 Tajweed Analysis

#### 7.4.1 Schema Enhancement

Enhance tajweed tracking with structured categories:

```typescript
// Enhanced tajweed notes schema
const tajweedNoteSchema = new Schema({
  harf: {
    issues: [{ type: String }],        // Array of specific letter issues
    severity: { type: String, enum: ['minor', 'moderate', 'major'] },
    note: { type: String }
  },
  ghunna: {
    issues: [{ type: String }],
    severity: { type: String, enum: ['minor', 'moderate', 'major'] },
    note: { type: String }
  },
  madd: {
    issues: [{ type: String }],
    severity: { type: String, enum: ['minor', 'moderate', 'major'] },
    note: { type: String }
  },
  other: {
    issues: [{ type: String }],
    severity: { type: String, enum: ['minor', 'moderate', 'major'] },
    note: { type: String }
  }
}, { _id: false });

// Common tajweed issues reference
export const TAJWEED_ISSUES = {
  harf: [
    'ق/ك confusion',
    'ض/ظ confusion',
    'ص/س confusion',
    'ط/ت confusion',
    'ذ/ز confusion',
    'ث/س confusion',
    'ح/ه confusion',
    'ع/ء confusion',
    'Heavy/light letter mixing'
  ],
  ghunna: [
    'Missing ghunna on noon/meem',
    'Incorrect ghunna duration',
    'Ikhfa issues',
    'Idgham issues',
    'Iqlab issues'
  ],
  madd: [
    'Short madd (not elongating)',
    'Over-elongation',
    'Madd lazim issues',
    'Madd arid issues',
    'Madd munfasil/muttasil confusion'
  ],
  other: [
    'Waqf (stopping) issues',
    'Ibtida (starting) issues',
    'Qalqala issues',
    'Tafkheem/tarqeeq issues',
    'Speed/rhythm issues'
  ]
};
```

#### 7.4.2 API Endpoint

**Endpoint:** `GET /api/quran/reports/tajweed`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `class` - Filter by class
- `studentId` - Filter by specific student
- `category` - `harf` | `ghunna` | `madd` | `other` | `all`

**Response:**
```typescript
interface ITajweedReport {
  filters: {
    dateRange: { start: string; end: string };
    class?: string;
    studentId?: string;
  };

  // Overall distribution
  categoryDistribution: {
    harf: { count: number; percentage: number };
    ghunna: { count: number; percentage: number };
    madd: { count: number; percentage: number };
    other: { count: number; percentage: number };
  };

  // Most common issues (word cloud data)
  commonIssues: Array<{
    issue: string;
    category: 'harf' | 'ghunna' | 'madd' | 'other';
    count: number;
    studentsAffected: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;

  // Issue severity breakdown
  severityBreakdown: {
    minor: number;
    moderate: number;
    major: number;
  };

  // Trend over time
  timeline: Array<{
    period: string;
    harf: number;
    ghunna: number;
    madd: number;
    other: number;
    total: number;
  }>;

  // Per-student tajweed profile
  studentProfiles?: Array<{
    student: IQuranStudent;
    topIssues: Array<{ issue: string; count: number }>;
    improvingAreas: string[];
    focusAreas: string[];
    overallSeverity: 'minor' | 'moderate' | 'major';
  }>;

  // Correlation with mistakes
  correlation: {
    harfCorrelation: number;      // Correlation with tanbih/fath
    ghunnaCorrelation: number;
    maddCorrelation: number;
    insight: string;              // e.g., "Harf issues strongly correlate with fath mistakes"
  };

  // Recommendations
  recommendations: Array<{
    issue: string;
    affectedStudents: number;
    suggestedAction: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}
```

#### 7.4.3 Frontend Components

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/tajweed/page.tsx`
- `frontend/src/components/quran/charts/TajweedWordCloud.tsx`
- `frontend/src/components/quran/charts/TajweedCategoryPie.tsx`
- `frontend/src/components/quran/charts/TajweedTrendLine.tsx`
- `frontend/src/components/quran/charts/TajweedSeverityBar.tsx`

**Word Cloud Visualization:**
```
               ق/ك confusion
        Missing ghunna     Short madd
    ض/ظ confusion    Ikhfa issues    Waqf issues
         Qalqala          ص/س confusion
    Over-elongation           ط/ت confusion
              Idgham issues    Speed issues
```

---

### 7.5 Predictive Metrics & Alerts

#### 7.5.1 Risk Score Calculation

```typescript
interface IRiskFactors {
  attendanceDecline: number;      // Weight: 0.25
  mistakesIncrease: number;       // Weight: 0.30
  streakBroken: boolean;          // Weight: 0.15
  recentGaps: number;             // Weight: 0.20
  tajweedSeverity: number;        // Weight: 0.10
}

function calculateRiskScore(factors: IRiskFactors): number {
  const WEIGHTS = {
    attendanceDecline: 0.25,
    mistakesIncrease: 0.30,
    streakBroken: 0.15,
    recentGaps: 0.20,
    tajweedSeverity: 0.10
  };

  let riskScore = 0;

  // Attendance decline (0-100 scale)
  riskScore += Math.min(factors.attendanceDecline * 2, 100) * WEIGHTS.attendanceDecline;

  // Mistakes increase (compare recent vs previous period)
  riskScore += Math.min(factors.mistakesIncrease * 2, 100) * WEIGHTS.mistakesIncrease;

  // Streak broken
  riskScore += (factors.streakBroken ? 100 : 0) * WEIGHTS.streakBroken;

  // Recent gaps (weeks without entry)
  riskScore += Math.min(factors.recentGaps * 25, 100) * WEIGHTS.recentGaps;

  // Tajweed severity
  const severityMap = { minor: 20, moderate: 50, major: 100 };
  riskScore += factors.tajweedSeverity * WEIGHTS.tajweedSeverity;

  return Math.round(riskScore);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}
```

#### 7.5.2 API Endpoint

**Endpoint:** `GET /api/quran/reports/alerts`

**Query Parameters:**
- `class` - Filter by class
- `riskLevel` - `low` | `medium` | `high` | `critical` | `all`
- `limit` - Number of alerts (default: 20)

**Response:**
```typescript
interface IAlertsReport {
  summary: {
    totalStudents: number;
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
  };

  alerts: Array<{
    student: IQuranStudent;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';

    // Risk factors breakdown
    factors: {
      attendanceDecline: {
        value: number;
        description: string;  // e.g., "Attendance dropped 30% in last month"
      };
      mistakesIncrease: {
        value: number;
        description: string;  // e.g., "Mistakes increased by 50%"
      };
      streakBroken: {
        value: boolean;
        description: string;  // e.g., "12-week streak broken"
      };
      recentGaps: {
        value: number;
        description: string;  // e.g., "Missed 2 consecutive weeks"
      };
      tajweedSeverity: {
        value: string;
        description: string;  // e.g., "Major pronunciation issues"
      };
    };

    // Recommended actions
    recommendations: Array<{
      action: string;
      priority: 'immediate' | 'soon' | 'routine';
      assignTo: 'ustad' | 'admin' | 'parent';
    }>;

    // Historical context
    history: {
      previousRiskLevel: string;
      riskTrend: 'increasing' | 'decreasing' | 'stable';
      lastAlertDate: string | null;
    };
  }>;

  // Recommended focus areas (content needing revision)
  focusRecommendations: Array<{
    student: IQuranStudent;
    content: Array<{
      type: 'surah' | 'juz';
      number: number;
      name: string;
      reason: string;  // e.g., "High mistakes in last 3 tests"
      priority: 'high' | 'medium' | 'low';
    }>;
  }>;

  // Intervention history
  interventions: Array<{
    student: IQuranStudent;
    date: string;
    type: string;
    outcome: 'successful' | 'ongoing' | 'unsuccessful';
  }>;
}
```

#### 7.5.3 Frontend Components

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/alerts/page.tsx`
- `frontend/src/components/quran/charts/RiskScoreGauge.tsx`
- `frontend/src/components/quran/alerts/AlertCard.tsx`
- `frontend/src/components/quran/alerts/InterventionTracker.tsx`

**Alert Dashboard Layout:**
```
+------------------------------------------------------------------+
|  Student Risk Alerts & Interventions                              |
+------------------------------------------------------------------+
|  RISK SUMMARY                                                     |
|  +----------+  +----------+  +----------+  +----------+          |
|  | 🟢 Low   |  | 🟡 Medium|  | 🟠 High  |  | 🔴 Critical|         |
|  | 45       |  | 18       |  | 8        |  | 3          |         |
|  +----------+  +----------+  +----------+  +----------+          |
+------------------------------------------------------------------+
|  CRITICAL ALERTS (Requires Immediate Attention)                   |
|  +--------------------------------------------------------------+|
|  | ⚠️ Ahmed Ibrahim (ID: 23)                    Risk: 85/100     ||
|  | ├─ Attendance dropped 40% in last month                      ||
|  | ├─ Mistakes increased by 60%                                 ||
|  | ├─ Missed last 3 consecutive weeks                           ||
|  | └─ Recommended: Contact parent, schedule 1:1 session         ||
|  +--------------------------------------------------------------+|
|  | ⚠️ Fatima Hassan (ID: 45)                    Risk: 78/100     ||
|  | ├─ 15-week streak broken                                     ||
|  | ├─ Major tajweed regression                                  ||
|  | └─ Recommended: Review with senior ustad                     ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
|  FOCUS RECOMMENDATIONS                                            |
|  +--------------------------------------------------------------+|
|  | Student: Ahmed Ibrahim                                        ||
|  | Needs revision: Surah Al-Baqarah (2:142-200) - High priority ||
|  |                 Juz 3 - Medium priority                       ||
|  +--------------------------------------------------------------+|
+------------------------------------------------------------------+
```

---

### 7.6 Class/Batch Analytics

#### 7.6.1 API Endpoint

**Endpoint:** `GET /api/quran/reports/class-analytics`

**Query Parameters:**
- `startDate`, `endDate` - Date range
- `classes` - Array of classes to compare (optional, defaults to all)
- `compareWithPrevious` - Boolean to include YoY comparison

**Response:**
```typescript
interface IClassAnalyticsReport {
  filters: {
    dateRange: { start: string; end: string };
    classes: string[];
  };

  // Class health scores
  classHealth: Array<{
    class: string;
    healthScore: number;          // 0-100 composite score
    healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';

    metrics: {
      studentCount: number;
      activeStudents: number;
      avgAttendance: number;
      avgMasteryScore: number;
      avgMistakes: number;
      testCompletionRate: number;
      improvingStudents: number;
      decliningStudents: number;
    };

    // Comparison with previous period
    comparison?: {
      healthScoreChange: number;
      attendanceChange: number;
      masteryChange: number;
      mistakesChange: number;
    };

    // Top/bottom performers
    topPerformers: Array<{ student: IQuranStudent; score: number }>;
    needsAttention: Array<{ student: IQuranStudent; riskScore: number }>;
  }>;

  // Cross-class comparison
  comparison: {
    bestClass: { class: string; score: number };
    mostImproved: { class: string; improvement: number };
    needsAttention: { class: string; reason: string };
  };

  // Distribution across classes
  distributions: {
    byMastery: Array<{
      class: string;
      A: number; B: number; C: number; D: number; F: number;
    }>;
    byRisk: Array<{
      class: string;
      low: number; medium: number; high: number; critical: number;
    }>;
  };

  // Timeline comparison
  timeline: Array<{
    period: string;
    classes: Array<{
      class: string;
      avgMistakes: number;
      avgMastery: number;
      attendance: number;
    }>;
  }>;

  // Year-over-year (if enabled)
  yearOverYear?: {
    currentYear: {
      avgMastery: number;
      avgMistakes: number;
      completionRate: number;
    };
    previousYear: {
      avgMastery: number;
      avgMistakes: number;
      completionRate: number;
    };
    change: {
      masteryChange: number;
      mistakesChange: number;
      completionChange: number;
      insight: string;
    };
  };
}
```

#### 7.6.2 Class Health Score Calculation

```typescript
function calculateClassHealthScore(metrics: IClassMetrics): number {
  const WEIGHTS = {
    attendance: 0.20,
    mastery: 0.25,
    mistakes: 0.20,
    completion: 0.15,
    improvement: 0.20
  };

  // Normalize each metric to 0-100
  const attendanceScore = metrics.avgAttendance;
  const masteryScore = metrics.avgMasteryScore;
  const mistakesScore = Math.max(0, 100 - (metrics.avgMistakes * 5));  // Lower is better
  const completionScore = metrics.testCompletionRate;
  const improvementScore = 50 + (metrics.improvementRate * 2);  // Center at 50

  return Math.round(
    (attendanceScore * WEIGHTS.attendance) +
    (masteryScore * WEIGHTS.mastery) +
    (mistakesScore * WEIGHTS.mistakes) +
    (completionScore * WEIGHTS.completion) +
    (improvementScore * WEIGHTS.improvement)
  );
}
```

#### 7.6.3 Frontend Components

**Files to Create:**
- `frontend/src/app/dashboard/admin/quran/reports/class-analytics/page.tsx`
- `frontend/src/components/quran/charts/ClassHealthDashboard.tsx`
- `frontend/src/components/quran/charts/ClassComparisonBar.tsx`
- `frontend/src/components/quran/charts/ClassDistributionStacked.tsx`
- `frontend/src/components/quran/charts/YearOverYearComparison.tsx`

---

### 7.7 Updated Implementation Phases

Update Phase 2 and Phase 5 to include additional metrics:

#### Phase 2 (Backend) - Additional Tasks:

```
9.  Implement consistency metrics endpoint
10. Implement progress metrics endpoint with mastery calculation
11. Implement comparative metrics endpoint with percentile calculation
12. Implement enhanced tajweed analysis endpoint
13. Implement risk score calculation and alerts endpoint
14. Implement class analytics endpoint with health scores
15. Add cron job for updating computed stats (consistency, progress)
16. Add indexes for new aggregation queries
```

**Additional Files:**
- `backend/src/app/modules/quran/reports/consistency.service.ts`
- `backend/src/app/modules/quran/reports/progress.service.ts`
- `backend/src/app/modules/quran/reports/comparative.service.ts`
- `backend/src/app/modules/quran/reports/tajweed.service.ts`
- `backend/src/app/modules/quran/reports/alerts.service.ts`
- `backend/src/app/modules/quran/reports/class-analytics.service.ts`
- `backend/src/app/jobs/quran-stats-updater.job.ts`

#### Phase 5 (Frontend) - Additional Tasks:

```
9.  Create consistency report page with calendar heatmap
10. Create progress report page with mastery gauge
11. Create comparative report page with radar charts
12. Create tajweed analysis page with word cloud
13. Create alerts dashboard with risk indicators
14. Create class analytics page with health scores
15. Add notification system for critical alerts
16. Add export functionality for all new reports
```

**Additional Files:**
- `frontend/src/app/dashboard/admin/quran/reports/consistency/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/progress/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/comparative/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/tajweed/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/alerts/page.tsx`
- `frontend/src/app/dashboard/admin/quran/reports/class-analytics/page.tsx`
- All associated chart components (listed above)

---

### 7.8 New Chart Components Summary

| Component | Type | Library | Purpose |
|-----------|------|---------|---------|
| `ConsistencyCalendarHeatmap` | Calendar Grid | react-calendar-heatmap | Show entry gaps visually |
| `StreakLeaderboard` | Ranked List | Custom | Top streaks display |
| `AttendanceProgressRing` | Ring Chart | Recharts | Attendance percentage |
| `MasteryGauge` | Gauge | Custom SVG | 0-100 mastery display |
| `ProgressTimeline` | Timeline | Custom | Milestone visualization |
| `MilestoneTracker` | Cards | Custom | Achievement display |
| `QuranProgressMap` | Grid | Custom | 114 surah visual grid |
| `ClassRankingChart` | Bar | Recharts | Class comparison |
| `PeerComparisonRadar` | Radar | Recharts | Multi-metric comparison |
| `PercentileGauge` | Gauge | Custom | Student percentile |
| `UstadEffectivenessChart` | Grouped Bar | Recharts | Teacher comparison |
| `DistributionHistogram` | Histogram | Recharts | Score distribution |
| `TajweedWordCloud` | Word Cloud | react-wordcloud | Common issues |
| `TajweedCategoryPie` | Pie | Recharts | Category breakdown |
| `TajweedTrendLine` | Line | Recharts | Issues over time |
| `TajweedSeverityBar` | Stacked Bar | Recharts | Severity breakdown |
| `RiskScoreGauge` | Gauge | Custom | Risk level display |
| `AlertCard` | Card | Custom | Individual alert display |
| `InterventionTracker` | Timeline | Custom | Intervention history |
| `ClassHealthDashboard` | Dashboard | Custom | Class overview |
| `ClassComparisonBar` | Grouped Bar | Recharts | Multi-class comparison |
| `ClassDistributionStacked` | Stacked Bar | Recharts | Grade distribution |
| `YearOverYearComparison` | Comparison | Custom | YoY metrics |

---

## 8. Database Aggregation Examples

### 8.1 Student Content Strength Analysis

```typescript
// MongoDB aggregation for finding strong/weak surahs
const pipeline = [
  { $match: { student: new ObjectId(studentId), reportDate: { $gte: startDate, $lte: endDate } } },
  { $unwind: { path: '$tests', preserveNullAndEmptyArrays: false } },
  // Flatten all three test types
  {
    $facet: {
      newTests: [
        { $match: { 'newTest.given': true, 'newTest.content.surahNumber': { $exists: true } } },
        { $project: { surahNumber: '$newTest.content.surahNumber', tanbih: '$newTest.tanbih', fath: '$newTest.fath' } }
      ],
      recentTests: [
        { $match: { 'recentTest.given': true, 'recentTest.content.surahNumber': { $exists: true } } },
        { $project: { surahNumber: '$recentTest.content.surahNumber', tanbih: '$recentTest.tanbih', fath: '$recentTest.fath' } }
      ],
      olderTests: [
        { $match: { 'olderTest.given': true, 'olderTest.content.surahNumber': { $exists: true } } },
        { $project: { surahNumber: '$olderTest.content.surahNumber', tanbih: '$olderTest.tanbih', fath: '$olderTest.fath' } }
      ]
    }
  },
  // Combine and group by surah
  { $project: { allTests: { $concatArrays: ['$newTests', '$recentTests', '$olderTests'] } } },
  { $unwind: '$allTests' },
  {
    $group: {
      _id: '$allTests.surahNumber',
      testsCount: { $sum: 1 },
      avgTanbih: { $avg: '$allTests.tanbih' },
      avgFath: { $avg: '$allTests.fath' },
      totalMistakes: { $sum: { $add: ['$allTests.tanbih', '$allTests.fath'] } }
    }
  },
  { $addFields: { avgMistakes: { $divide: ['$totalMistakes', '$testsCount'] } } },
  { $sort: { avgMistakes: 1 } }  // Sort by performance (lower is better)
];
```

### 8.2 Time-Based Aggregation with Granularity

```typescript
// MongoDB aggregation for time analysis
const getDateGrouping = (granularity: string) => {
  switch (granularity) {
    case 'day':
      return { $dateToString: { format: '%Y-%m-%d', date: '$reportDate' } };
    case 'week':
      return { $dateToString: { format: '%Y-W%V', date: '$reportDate' } };
    case 'month':
      return { $dateToString: { format: '%Y-%m', date: '$reportDate' } };
  }
};

const pipeline = [
  { $match: { reportDate: { $gte: startDate, $lte: endDate } } },
  { $lookup: { from: 'quranstudents', localField: 'student', foreignField: '_id', as: 'studentInfo' } },
  { $unwind: '$studentInfo' },
  {
    $group: {
      _id: {
        period: getDateGrouping(granularity),
        supervision: '$studentInfo.supervision'
      },
      entriesCount: { $sum: 1 },
      studentsCount: { $addToSet: '$student' },
      totalTanbih: { $sum: '$totalTanbih' },
      totalFath: { $sum: '$totalFath' },
      testsGiven: { $sum: '$testsGiven' },
      testsMissed: { $sum: '$testsMissed' }
    }
  },
  {
    $group: {
      _id: '$_id.period',
      supervised: {
        $push: {
          $cond: [
            { $eq: ['$_id.supervision', true] },
            { count: '$entriesCount', tanbih: '$totalTanbih', fath: '$totalFath' },
            '$$REMOVE'
          ]
        }
      },
      unsupervised: {
        $push: {
          $cond: [
            { $eq: ['$_id.supervision', false] },
            { count: '$entriesCount', tanbih: '$totalTanbih', fath: '$totalFath' },
            '$$REMOVE'
          ]
        }
      },
      total: {
        entries: { $sum: '$entriesCount' },
        tanbih: { $sum: '$totalTanbih' },
        fath: { $sum: '$totalFath' }
      }
    }
  },
  { $sort: { _id: 1 } }
];
```

---

## 9. UI/UX Considerations

### 9.1 Bengali Language Support

- All labels should support both English and Bengali
- Surah names in Arabic, English, and Bengali
- Date formatting in Bengali numerals (optional)
- RTL support for Arabic text display

### 9.2 Mobile Responsiveness

- Collapsible filter panels
- Swipeable chart carousels
- Touch-friendly selection inputs
- Responsive tables with horizontal scroll

### 9.3 Performance Optimization

- Virtual scrolling for long surah lists
- Lazy loading for report pages
- Chart data point limiting for mobile
- Skeleton loaders for all data fetches
- React Query stale time configuration

### 9.4 Accessibility

- ARIA labels for all charts
- Keyboard navigation for forms
- Screen reader support for data tables
- High contrast mode for charts
- Focus indicators

---

## 10. Summary

This implementation plan provides:

1. **Structured Content Capture** - Moving from free-text notes to dropdowns for Surah, Ayah ranges, and Juz selection

2. **Comprehensive Analytics** covering:
   - Test type analysis (new/recent/older)
   - Time-based analysis (daily/weekly/monthly)
   - Individual student trends and progress
   - Content strength/weakness identification
   - Surah and Juz performance rankings
   - Top/worst performer identification
   - Supervision effectiveness analysis

3. **Rich Visualizations** including line charts, bar charts, heatmaps, bubble charts, leaderboards, and trend indicators

4. **Additional Metrics** for consistency, progress, comparison, tajweed analysis, and predictive insights

The implementation is divided into 6 phases, starting with backend schema changes and progressing through to frontend charts and testing.
