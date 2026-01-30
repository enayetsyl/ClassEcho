# Quran Revision Tracker - Feature Planning Document

## Overview

A new module to track weekly Quran revision tests for students, recording mistake counts (Tanbih/Fath) across three test types (New, Recent, Older), qualitative notes, and generating analytical dashboards.

Based on the Excel template structure: `Quran_Revision_Tracker_Template (1).xlsx`

---

## Data Model Analysis

### From Excel Template

**Students Sheet:**
- Student ID (unique identifier)
- Name EN (English name)
- Name BN (Bengali name)
- Class (1-5 or class name like "Hifz 1st Year Boys")
- Supervision (Yes/No - whether student is under special supervision)
- Active (Yes/No)
- Notes

**Entry Sheet (Weekly Reports):**
- Entry ID (auto-generated)
- Report Date
- Student ID (foreign key)
- Student Name BN (auto-filled from Students)
- Class (auto-filled)
- Supervision (auto-filled)
- **New Test:** Given? (Yes/No), Tanbih count, Fath count, Note
- **Recent Test:** Given? (Yes/No), Tanbih count, Fath count, Note
- **Older Test:** Given? (Yes/No), Tanbih count, Fath count, Note
- **Tajweed Notes:** Harf note, Ghunna note, Madd note, Other note
- General note
- Ustad/Ustadha name (teacher who conducted the test)
- Signature/Initial
- **Computed:** Tests given count, Tests missed count, Total Tanbih, Total Fath, Total mistakes

**Settings/Filters:**
- Date range (Start/End)
- Class filter
- Student filter
- Supervision filter (Yes/No/All)

**Dashboard Metrics:**
- Weekly summary (Reports, Tests Missed, Tanbih by type, Fath by type)
- Class-wise breakdown
- Student-wise breakdown
- Trend analysis over time

---

## Backend Implementation Plan

### 1. Database Models

#### 1.1 QuranStudent Model (`quran-student.model.ts`)

```typescript
// Schema fields
{
  studentId: number,              // Unique student ID (from Excel)
  nameEn: string,                 // English name
  nameBn: string,                 // Bengali name (optional)
  class: string,                  // Class name or number
  supervision: boolean,           // Under supervision?
  active: boolean,                // Is student active?
  notes: string,                  // General notes
  photo: string,                  // Photo URL (optional, for student card)
  createdAt: Date,
  updatedAt: Date
}
```

#### 1.2 QuranEntry Model (`quran-entry.model.ts`)

```typescript
// Schema fields
{
  student: ObjectId,              // ref: 'QuranStudent'
  reportDate: Date,               // Date of the weekly report

  // New Test
  newTest: {
    given: boolean,               // Was the test given?
    tanbih: number,               // Tanbih mistake count (default: 0)
    fath: number,                 // Fath mistake count (default: 0)
    note: string                  // Note for this test
  },

  // Recent Test
  recentTest: {
    given: boolean,
    tanbih: number,
    fath: number,
    note: string
  },

  // Older Test
  olderTest: {
    given: boolean,
    tanbih: number,
    fath: number,
    note: string
  },

  // Tajweed/Pronunciation Notes
  tajweedNotes: {
    harf: string,                 // Letter pronunciation issues
    ghunna: string,               // Nasal sound issues
    madd: string,                 // Elongation issues
    other: string                 // Other issues
  },

  generalNote: string,            // General observation
  ustadName: string,              // Teacher who conducted the test
  signature: string,              // Signature or initials

  // Computed fields (stored for query performance)
  testsGiven: number,             // Count of tests given (0-3)
  testsMissed: number,            // Count of tests missed (0-3)
  totalTanbih: number,            // Sum of all Tanbih
  totalFath: number,              // Sum of all Fath
  totalMistakes: number,          // totalTanbih + totalFath

  createdAt: Date,
  updatedAt: Date
}
```

### 2. Module Structure

```
backend/src/app/modules/quran/
├── student/
│   ├── quran-student.model.ts
│   ├── quran-student.type.ts
│   ├── quran-student.validation.ts
│   ├── quran-student.service.ts
│   ├── quran-student.controller.ts
│   └── quran-student.routes.ts
├── entry/
│   ├── quran-entry.model.ts
│   ├── quran-entry.type.ts
│   ├── quran-entry.validation.ts
│   ├── quran-entry.service.ts
│   ├── quran-entry.controller.ts
│   └── quran-entry.routes.ts
├── reports/
│   ├── quran-reports.type.ts
│   ├── quran-reports.service.ts
│   ├── quran-reports.controller.ts
│   └── quran-reports.routes.ts
└── index.ts                      # Barrel export
```

### 3. API Endpoints

#### 3.1 Quran Students API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/quran/students` | List all students (with pagination, filters) | Admin, Teacher |
| GET | `/api/v1/quran/students/:id` | Get student by ID | Admin, Teacher |
| POST | `/api/v1/quran/students` | Create new student | Admin |
| PATCH | `/api/v1/quran/students/:id` | Update student | Admin |
| DELETE | `/api/v1/quran/students/:id` | Soft delete student (set active=false) | Admin |
| POST | `/api/v1/quran/students/bulk` | Bulk import students (from Excel) | Admin |

**Query Parameters for List:**
- `page`, `limit` (pagination)
- `class` (filter by class)
- `supervision` (filter by supervision status)
- `active` (filter by active status)
- `search` (search by name)
- `sortBy`, `sortOrder`

#### 3.2 Quran Entries API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/quran/entries` | List all entries (with pagination, filters) | Admin, Teacher |
| GET | `/api/v1/quran/entries/:id` | Get entry by ID | Admin, Teacher |
| POST | `/api/v1/quran/entries` | Create new weekly entry | Admin, Teacher |
| PATCH | `/api/v1/quran/entries/:id` | Update entry | Admin, Teacher |
| DELETE | `/api/v1/quran/entries/:id` | Delete entry | Admin |
| POST | `/api/v1/quran/entries/bulk` | Bulk import entries (from Excel) | Admin |
| GET | `/api/v1/quran/entries/student/:studentId` | Get entries for a specific student | Admin, Teacher |

**Query Parameters for List:**
- `page`, `limit` (pagination)
- `studentId` (filter by student)
- `class` (filter by class)
- `supervision` (filter by supervision)
- `startDate`, `endDate` (date range filter)
- `ustadName` (filter by teacher)
- `sortBy`, `sortOrder`

#### 3.3 Quran Reports API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/quran/reports/overall` | Overall dashboard stats | Admin, Management |
| GET | `/api/v1/quran/reports/weekly-summary` | Weekly summary with trends | Admin, Management |
| GET | `/api/v1/quran/reports/class-breakdown` | Stats breakdown by class | Admin, Management |
| GET | `/api/v1/quran/reports/student/:studentId` | Individual student report | Admin, Teacher, Management |
| GET | `/api/v1/quran/reports/supervision` | Supervised vs non-supervised comparison | Admin, Management |
| GET | `/api/v1/quran/reports/ustad-summary` | Summary by Ustad/Ustadha | Admin, Management |

**Query Parameters for Reports:**
- `startDate`, `endDate` (date range)
- `class` (filter by class)
- `supervision` (filter by supervision status)
- `studentId` (for student-specific reports)

### 4. Report Data Structures

#### 4.1 Overall Dashboard Report
```typescript
interface IQuranOverallReport {
  totalStudents: number;
  activeStudents: number;
  totalEntries: number;
  dateRange: { start: Date; end: Date };

  summary: {
    totalReports: number;
    totalTestsGiven: number;
    totalTestsMissed: number;
    totalTanbih: number;
    totalFath: number;
    totalMistakes: number;
    avgMistakesPerStudent: number;
  };

  byTestType: {
    new: { tanbih: number; fath: number; givenCount: number };
    recent: { tanbih: number; fath: number; givenCount: number };
    older: { tanbih: number; fath: number; givenCount: number };
  };
}
```

#### 4.2 Weekly Summary Report
```typescript
interface IQuranWeeklySummary {
  weekStart: Date;
  weekEnd: Date;
  reports: number;
  testsMissed: number;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  byTestType: {
    newTanbih: number;
    newFath: number;
    recentTanbih: number;
    recentFath: number;
    olderTanbih: number;
    olderFath: number;
  };
}

interface IQuranWeeklyTrendReport {
  weeks: IQuranWeeklySummary[];
  trend: 'improving' | 'declining' | 'stable';
  avgMistakesChange: number; // Percentage change
}
```

#### 4.3 Class Breakdown Report
```typescript
interface IQuranClassBreakdown {
  class: string;
  studentCount: number;
  entryCount: number;
  avgTanbih: number;
  avgFath: number;
  avgTotalMistakes: number;
  testCompletionRate: number; // Percentage of tests given vs possible
}
```

#### 4.4 Student Report
```typescript
interface IQuranStudentReport {
  student: IQuranStudent;
  entries: IQuranEntry[];
  summary: {
    totalEntries: number;
    avgTanbih: number;
    avgFath: number;
    avgTotalMistakes: number;
    testCompletionRate: number;
  };
  weeklyTrend: IQuranWeeklySummary[];
  commonIssues: {
    harf: string[];
    ghunna: string[];
    madd: string[];
    other: string[];
  };
}
```

### 5. Validation Schemas (Zod)

```typescript
// quran-student.validation.ts
export const createQuranStudentValidation = z.object({
  body: z.object({
    studentId: z.number().int().positive(),
    nameEn: z.string().min(1).max(100),
    nameBn: z.string().max(100).optional(),
    class: z.string().min(1).max(50),
    supervision: z.boolean().default(false),
    active: z.boolean().default(true),
    notes: z.string().max(500).optional(),
    photo: z.string().url().optional(),
  }),
});

// quran-entry.validation.ts
const testSchema = z.object({
  given: z.boolean(),
  tanbih: z.number().int().min(0).default(0),
  fath: z.number().int().min(0).default(0),
  note: z.string().max(500).optional(),
});

export const createQuranEntryValidation = z.object({
  body: z.object({
    studentId: z.string().min(1), // MongoDB ObjectId
    reportDate: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
    newTest: testSchema.optional(),
    recentTest: testSchema.optional(),
    olderTest: testSchema.optional(),
    tajweedNotes: z.object({
      harf: z.string().max(500).optional(),
      ghunna: z.string().max(500).optional(),
      madd: z.string().max(500).optional(),
      other: z.string().max(500).optional(),
    }).optional(),
    generalNote: z.string().max(1000).optional(),
    ustadName: z.string().max(100).optional(),
    signature: z.string().max(100).optional(),
  }),
});
```

### 6. Service Layer Functions

```typescript
// quran-student.service.ts
- createStudent(data: ICreateQuranStudent): Promise<IQuranStudent>
- listStudents(options: TQuranStudentQueryOptions): Promise<TPaginatedResult<IQuranStudent>>
- getStudentById(id: string): Promise<IQuranStudent>
- updateStudent(id: string, data: Partial<IQuranStudent>): Promise<IQuranStudent>
- deleteStudent(id: string): Promise<void>
- bulkImportStudents(data: ICreateQuranStudent[]): Promise<{ created: number; errors: string[] }>

// quran-entry.service.ts
- createEntry(data: ICreateQuranEntry): Promise<IQuranEntry>
- listEntries(options: TQuranEntryQueryOptions): Promise<TPaginatedResult<IQuranEntry>>
- getEntryById(id: string): Promise<IQuranEntry>
- updateEntry(id: string, data: Partial<IQuranEntry>): Promise<IQuranEntry>
- deleteEntry(id: string): Promise<void>
- getEntriesByStudent(studentId: string, options): Promise<IQuranEntry[]>
- bulkImportEntries(data: ICreateQuranEntry[]): Promise<{ created: number; errors: string[] }>

// quran-reports.service.ts
- getOverallReport(filters: TReportFilters): Promise<IQuranOverallReport>
- getWeeklySummary(filters: TReportFilters): Promise<IQuranWeeklyTrendReport>
- getClassBreakdown(filters: TReportFilters): Promise<IQuranClassBreakdown[]>
- getStudentReport(studentId: string, filters: TReportFilters): Promise<IQuranStudentReport>
- getSupervisionComparison(filters: TReportFilters): Promise<ISupervisionComparison>
- getUstadSummary(filters: TReportFilters): Promise<IUstadSummary[]>
```

---

## Frontend Implementation Plan

### 1. Folder Structure

```
frontend/src/
├── app/
│   └── dashboard/
│       └── admin/
│           └── quran/
│               ├── layout.tsx              # Quran section layout (optional)
│               ├── students/
│               │   ├── page.tsx            # Student list
│               │   ├── [id]/
│               │   │   └── page.tsx        # Student detail/edit
│               │   └── add/
│               │       └── page.tsx        # Add new student
│               ├── entries/
│               │   ├── page.tsx            # Entry list
│               │   ├── add/
│               │   │   └── page.tsx        # Add new entry (main data entry form)
│               │   └── [id]/
│               │       └── page.tsx        # Entry detail/edit
│               └── reports/
│                   ├── page.tsx            # Reports dashboard (overall)
│                   ├── weekly/
│                   │   └── page.tsx        # Weekly trend report
│                   ├── class/
│                   │   └── page.tsx        # Class breakdown report
│                   └── student/
│                       └── [id]/
│                           └── page.tsx    # Individual student report
├── services/
│   ├── quran-student.service.ts
│   ├── quran-entry.service.ts
│   └── quran-reports.service.ts
├── hooks/
│   ├── use-quran-students.ts
│   ├── use-quran-entries.ts
│   └── use-quran-reports.ts
└── types/
    └── quran.types.ts
```

### 2. Type Definitions (`quran.types.ts`)

```typescript
// Student types
export interface IQuranStudent {
  _id: string;
  studentId: number;
  nameEn: string;
  nameBn?: string;
  class: string;
  supervision: boolean;
  active: boolean;
  notes?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateQuranStudentPayload {
  studentId: number;
  nameEn: string;
  nameBn?: string;
  class: string;
  supervision?: boolean;
  active?: boolean;
  notes?: string;
  photo?: string;
}

// Test structure
export interface IQuranTest {
  given: boolean;
  tanbih: number;
  fath: number;
  note?: string;
}

// Tajweed notes
export interface ITajweedNotes {
  harf?: string;
  ghunna?: string;
  madd?: string;
  other?: string;
}

// Entry types
export interface IQuranEntry {
  _id: string;
  student: IQuranStudent | string;
  reportDate: string;
  newTest?: IQuranTest;
  recentTest?: IQuranTest;
  olderTest?: IQuranTest;
  tajweedNotes?: ITajweedNotes;
  generalNote?: string;
  ustadName?: string;
  signature?: string;
  testsGiven: number;
  testsMissed: number;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateQuranEntryPayload {
  studentId: string;
  reportDate: string;
  newTest?: IQuranTest;
  recentTest?: IQuranTest;
  olderTest?: IQuranTest;
  tajweedNotes?: ITajweedNotes;
  generalNote?: string;
  ustadName?: string;
  signature?: string;
}

// Report types
export interface IQuranOverallReport {
  totalStudents: number;
  activeStudents: number;
  totalEntries: number;
  dateRange: { start: string; end: string };
  summary: {
    totalReports: number;
    totalTestsGiven: number;
    totalTestsMissed: number;
    totalTanbih: number;
    totalFath: number;
    totalMistakes: number;
    avgMistakesPerStudent: number;
  };
  byTestType: {
    new: { tanbih: number; fath: number; givenCount: number };
    recent: { tanbih: number; fath: number; givenCount: number };
    older: { tanbih: number; fath: number; givenCount: number };
  };
}

export interface IQuranWeeklySummary {
  weekStart: string;
  weekEnd: string;
  reports: number;
  testsMissed: number;
  totalTanbih: number;
  totalFath: number;
  totalMistakes: number;
  byTestType: {
    newTanbih: number;
    newFath: number;
    recentTanbih: number;
    recentFath: number;
    olderTanbih: number;
    olderFath: number;
  };
}

export interface IQuranClassBreakdown {
  class: string;
  studentCount: number;
  entryCount: number;
  avgTanbih: number;
  avgFath: number;
  avgTotalMistakes: number;
  testCompletionRate: number;
}

export interface IQuranStudentReport {
  student: IQuranStudent;
  entries: IQuranEntry[];
  summary: {
    totalEntries: number;
    avgTanbih: number;
    avgFath: number;
    avgTotalMistakes: number;
    testCompletionRate: number;
  };
  weeklyTrend: IQuranWeeklySummary[];
}

// Query/Filter types
export interface IQuranStudentFilters {
  page?: number;
  limit?: number;
  class?: string;
  supervision?: 'yes' | 'no' | 'all';
  active?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IQuranEntryFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  class?: string;
  supervision?: 'yes' | 'no' | 'all';
  startDate?: string;
  endDate?: string;
  ustadName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IQuranReportFilters {
  startDate?: string;
  endDate?: string;
  class?: string;
  supervision?: 'yes' | 'no' | 'all';
  studentId?: string;
}
```

### 3. Service Layer (`quran-*.service.ts`)

```typescript
// quran-student.service.ts
import apiClient from '@/lib/api-client'
import { IQuranStudent, ICreateQuranStudentPayload, IQuranStudentFilters } from '@/types/quran.types'

export const quranStudentService = {
  getAll: async (params?: IQuranStudentFilters) => {
    const res = await apiClient.get<TApiResponse<IQuranStudent[]>>('/quran/students', { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  getById: async (id: string) => {
    const res = await apiClient.get<TApiResponse<IQuranStudent>>(`/quran/students/${id}`)
    return res.data.data
  },

  create: async (payload: ICreateQuranStudentPayload) => {
    const res = await apiClient.post<TApiResponse<IQuranStudent>>('/quran/students', payload)
    return res.data.data
  },

  update: async (id: string, payload: Partial<ICreateQuranStudentPayload>) => {
    const res = await apiClient.patch<TApiResponse<IQuranStudent>>(`/quran/students/${id}`, payload)
    return res.data.data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/quran/students/${id}`)
  },

  bulkImport: async (data: ICreateQuranStudentPayload[]) => {
    const res = await apiClient.post<TApiResponse<{ created: number; errors: string[] }>>('/quran/students/bulk', { students: data })
    return res.data.data
  },
}

// Similar structure for quran-entry.service.ts and quran-reports.service.ts
```

### 4. React Query Hooks (`use-quran-*.ts`)

```typescript
// use-quran-students.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { quranStudentService } from '@/services/quran-student.service'
import { toast } from 'sonner'

export const useQuranStudentsQuery = (params?: IQuranStudentFilters) =>
  useQuery({
    queryKey: ['quran-students', params],
    queryFn: () => quranStudentService.getAll(params),
  })

export const useQuranStudentQuery = (id: string) =>
  useQuery({
    queryKey: ['quran-student', id],
    queryFn: () => quranStudentService.getById(id),
    enabled: !!id,
  })

export const useCreateQuranStudentMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: quranStudentService.create,
    onSuccess: () => {
      toast.success('Student created successfully')
      qc.invalidateQueries({ queryKey: ['quran-students'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create student')
    },
  })
}

// Similar hooks for update, delete, bulk import

// use-quran-entries.ts - similar pattern

// use-quran-reports.ts
export const useQuranOverallReportQuery = (filters?: IQuranReportFilters) =>
  useQuery({
    queryKey: ['quran-report-overall', filters],
    queryFn: () => quranReportsService.getOverallReport(filters),
  })

export const useQuranWeeklySummaryQuery = (filters?: IQuranReportFilters) =>
  useQuery({
    queryKey: ['quran-report-weekly', filters],
    queryFn: () => quranReportsService.getWeeklySummary(filters),
  })

// etc.
```

### 5. Page Components

#### 5.1 Data Entry Form (`/quran/entries/add/page.tsx`)

Primary data entry page matching the Excel Entry sheet structure:

**Features:**
- Select student from dropdown (searchable)
- Auto-populate class and supervision from student
- Date picker for report date
- Three test sections (New, Recent, Older) each with:
  - Checkbox "Test Given?"
  - Tanbih count input (number)
  - Fath count input (number)
  - Note textarea
- Tajweed notes section (Harf, Ghunna, Madd, Other)
- General note textarea
- Ustad name input
- Submit button

**Form Layout:**
```
+--------------------------------------------------+
|  Quran Weekly Revision Entry                     |
+--------------------------------------------------+
|  Student: [Searchable Dropdown]   Date: [Picker] |
|  Class: [Auto-filled]   Supervision: [Auto]      |
+--------------------------------------------------+
|  NEW TEST                                        |
|  [x] Test Given?                                 |
|  Tanbih: [___]   Fath: [___]                     |
|  Note: [_________________________________]       |
+--------------------------------------------------+
|  RECENT TEST                                     |
|  [x] Test Given?                                 |
|  Tanbih: [___]   Fath: [___]                     |
|  Note: [_________________________________]       |
+--------------------------------------------------+
|  OLDER TEST                                      |
|  [x] Test Given?                                 |
|  Tanbih: [___]   Fath: [___]                     |
|  Note: [_________________________________]       |
+--------------------------------------------------+
|  TAJWEED NOTES                                   |
|  Harf: [____________]  Ghunna: [____________]    |
|  Madd: [____________]  Other:  [____________]    |
+--------------------------------------------------+
|  General Note: [_____________________________]   |
|  Ustad Name: [______________]                    |
+--------------------------------------------------+
|              [Cancel]  [Submit Entry]            |
+--------------------------------------------------+
```

#### 5.2 Student List (`/quran/students/page.tsx`)

**Features:**
- Table with columns: ID, Name EN, Name BN, Class, Supervision, Active, Actions
- Search by name
- Filter by class (dropdown)
- Filter by supervision (Yes/No/All)
- Filter by active status
- Pagination
- Add new student button
- Edit/Delete actions per row
- Bulk import button (CSV/Excel upload)

#### 5.3 Entry List (`/quran/entries/page.tsx`)

**Features:**
- Table with columns: Date, Student, Class, Tests Given, Total Tanbih, Total Fath, Total Mistakes, Ustad, Actions
- Filter by date range
- Filter by student (searchable dropdown)
- Filter by class
- Filter by supervision
- Pagination
- Add new entry button
- Edit/View/Delete actions per row

#### 5.4 Reports Dashboard (`/quran/reports/page.tsx`)

**Features:**
- Date range selector
- Class filter
- Supervision filter

**KPI Cards:**
- Total Students
- Total Entries (in period)
- Average Mistakes per Student
- Test Completion Rate

**Charts (using Recharts):**
1. **Mistake Distribution Pie Chart**
   - Tanbih vs Fath breakdown

2. **Mistakes by Test Type Bar Chart**
   - New, Recent, Older tests
   - Stacked: Tanbih + Fath

3. **Weekly Trend Line Chart**
   - X-axis: Weeks
   - Y-axis: Total Mistakes
   - Lines: Tanbih, Fath, Total

4. **Class Comparison Bar Chart**
   - X-axis: Classes
   - Y-axis: Average Mistakes

5. **Supervision Comparison**
   - Supervised vs Non-supervised students
   - Average mistakes comparison

#### 5.5 Student Report (`/quran/reports/student/[id]/page.tsx`)

**Features:**
- Student info card (name, class, supervision status)
- Summary statistics
- Weekly trend chart for this student
- Entry history table
- Common issues analysis (from Tajweed notes)

### 6. Navigation Updates

Add to NavBar.tsx:

```typescript
// New items for Quran Revision module
{
  href: '/dashboard/admin/quran/entries/add',
  label: 'Quran Entry',
  roles: ['Admin', 'Teacher'],
},
{
  href: '/dashboard/admin/quran/entries',
  label: 'Quran Entries',
  roles: ['Admin', 'Teacher'],
},
{
  href: '/dashboard/admin/quran/students',
  label: 'Quran Students',
  roles: ['Admin'],
},
{
  href: '/dashboard/admin/quran/reports',
  label: 'Quran Reports',
  roles: ['Admin', 'Management'],
},
```

### 7. UI Components to Create/Reuse

**New Components:**
- `QuranTestSection` - Reusable component for New/Recent/Older test input
- `TajweedNotesSection` - Reusable component for Tajweed notes input
- `StudentSelect` - Searchable student dropdown with auto-fill
- `QuranReportFilters` - Filter controls for reports
- `QuranKpiCard` - KPI display card
- `QuranWeeklyTrendChart` - Recharts line chart component
- `QuranMistakeDistributionChart` - Recharts pie chart
- `QuranClassComparisonChart` - Recharts bar chart

**Reuse from existing:**
- `Card`, `Button`, `Input`, `Label`, `Select` from shadcn/ui
- `Pagination` from shared components
- `Table` components
- `DatePicker` (Calendar + Popover)
- `Skeleton` for loading states

---

## Data Import from 10-1-25 Folder

The `10-1-25/` folder contains JPEG images of handwritten weekly reports. These are physical forms that need to be manually entered via the data entry form.

**Identified Students from Images:**
1. Ibrahim Hossain (ID: 1)
2. Ismail Hossain (ID: 2)
3. Adib Samir (ID: 21)
4. Fatima Chowdhury (ID: 54)
5. Zuhaira Afnan Anwar (ID: 8)
6. Reham Bint Mustafa (ID: 24)
7. Rehana Bint Mustafa (ID: 25)
8. Muhammad Abdur Rahman (ID: 41)
9. Zulqarnain Chowdhury (ID: 64)
10. Towhid Islam Suhan (ID: 14)
11. Tahmid Abdullah Muntasir (ID: 35)
12. Samia Tasnim Zara (ID: 5)

**Import Strategy:**
1. First import students from Excel Students sheet via bulk import API
2. Then manually enter weekly entries for 10-1-25 data via the entry form
3. OR create a seed script that parses the Excel and imports all data

---

## Implementation Phases

### Phase 1: Backend Foundation
1. Create Quran module folder structure
2. Implement QuranStudent model, types, validation
3. Implement QuranStudent service, controller, routes
4. Implement QuranEntry model, types, validation
5. Implement QuranEntry service, controller, routes
6. Add routes to main router

### Phase 2: Frontend Data Management
1. Create type definitions
2. Create service layer
3. Create React Query hooks
4. Implement Student List page
5. Implement Add/Edit Student pages
6. Implement Entry List page
7. Implement Add/Edit Entry pages (main data entry form)
8. Update navigation

### Phase 3: Reports Backend
1. Implement reports types
2. Implement reports service (aggregation queries)
3. Implement reports controller and routes

### Phase 4: Reports Frontend
1. Implement overall reports dashboard
2. Create chart components
3. Implement weekly trend report page
4. Implement class breakdown report page
5. Implement student report page

### Phase 5: Polish & Data Import
1. Add bulk import functionality (backend + frontend)
2. Import initial data from Excel
3. Add data validation and error handling
4. Add loading states and skeletons
5. Test all functionality

---

## Technical Considerations

### Database Indexes
```javascript
// QuranStudent
{ studentId: 1 } // unique
{ class: 1 }
{ supervision: 1 }
{ active: 1 }
{ nameEn: 'text', nameBn: 'text' } // text search

// QuranEntry
{ student: 1, reportDate: -1 }
{ reportDate: -1 }
{ student: 1 }
{ 'student.class': 1 } // for aggregation
```

### Aggregation Pipelines

For reports, use MongoDB aggregation pipelines:
- `$match` for date range and filters
- `$lookup` for student population
- `$group` for weekly summaries
- `$sort` for ordering
- `$project` for shaping output

### Performance Considerations
- Store computed fields (testsGiven, totalMistakes, etc.) on save to avoid runtime computation
- Use pagination for all list endpoints
- Index frequently queried fields
- Use lean() queries for read-only operations

---

## Security Considerations

- All endpoints require authentication (JWT)
- Role-based access control:
  - Admin: Full CRUD on students and entries, access to all reports
  - Teacher: Create/update entries, view own entries, view student reports
  - Management: Read-only access to reports
- Input validation with Zod
- Sanitize user inputs for notes fields
- Rate limiting on bulk import endpoints

---

## Files to Create/Modify

### Backend (New Files)
```
backend/src/app/modules/quran/
├── student/
│   ├── quran-student.model.ts
│   ├── quran-student.type.ts
│   ├── quran-student.validation.ts
│   ├── quran-student.service.ts
│   ├── quran-student.controller.ts
│   └── quran-student.routes.ts
├── entry/
│   ├── quran-entry.model.ts
│   ├── quran-entry.type.ts
│   ├── quran-entry.validation.ts
│   ├── quran-entry.service.ts
│   ├── quran-entry.controller.ts
│   └── quran-entry.routes.ts
├── reports/
│   ├── quran-reports.type.ts
│   ├── quran-reports.service.ts
│   ├── quran-reports.controller.ts
│   └── quran-reports.routes.ts
└── index.ts
```

### Backend (Modify)
```
backend/src/app/routes/index.ts  # Add quran routes
```

### Frontend (New Files)
```
frontend/src/types/quran.types.ts
frontend/src/services/quran-student.service.ts
frontend/src/services/quran-entry.service.ts
frontend/src/services/quran-reports.service.ts
frontend/src/hooks/use-quran-students.ts
frontend/src/hooks/use-quran-entries.ts
frontend/src/hooks/use-quran-reports.ts
frontend/src/app/dashboard/admin/quran/students/page.tsx
frontend/src/app/dashboard/admin/quran/students/add/page.tsx
frontend/src/app/dashboard/admin/quran/students/[id]/page.tsx
frontend/src/app/dashboard/admin/quran/entries/page.tsx
frontend/src/app/dashboard/admin/quran/entries/add/page.tsx
frontend/src/app/dashboard/admin/quran/entries/[id]/page.tsx
frontend/src/app/dashboard/admin/quran/reports/page.tsx
frontend/src/app/dashboard/admin/quran/reports/weekly/page.tsx
frontend/src/app/dashboard/admin/quran/reports/class/page.tsx
frontend/src/app/dashboard/admin/quran/reports/student/[id]/page.tsx
```

### Frontend (Modify)
```
frontend/src/components/ui/shared/NavBar.tsx  # Add navigation items
```

---

## Summary

This plan provides a comprehensive implementation strategy for the Quran Revision Tracker feature that:

1. **Matches the Excel template structure** - Faithful reproduction of Students, Entry, and Dashboard sheets
2. **Follows existing code patterns** - Consistent with backend module structure and frontend patterns
3. **Provides complete CRUD operations** - For both students and weekly entries
4. **Includes rich reporting** - Overall, weekly trends, class breakdown, and individual student reports
5. **Supports the physical form workflow** - Data entry form matches the handwritten forms in 10-1-25/
6. **Uses modern tech stack** - TypeScript, React Query, Recharts, shadcn/ui
7. **Considers security and performance** - Role-based access, proper indexing, pagination
