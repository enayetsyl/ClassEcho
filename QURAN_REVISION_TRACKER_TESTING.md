# Quran Revision Tracker – Testing Guide

This guide walks you through testing the full Quran Revision Tracker feature end-to-end.

---

## 1. Prerequisites

### 1.1 Environment

- **MongoDB** running (backend uses `database_url` from `.env`).
- **Backend** `.env` has at least: `database_url`, `port`, `jwt_secret`, `jwt_expires_in`, `cors_origin`.
- **Frontend** can call the backend (e.g. `NEXT_PUBLIC_API_URL` or same-origin proxy if used).

### 1.2 Start services

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

Backend should listen on the port in `.env` (e.g. `http://localhost:5000`).

**Terminal 2 – Frontend**

```bash
cd frontend
npm run dev
```

Frontend usually runs at `http://localhost:3000`.

### 1.3 Log in

- Open the app (e.g. `http://localhost:3000`).
- Log in with a user that has one of these roles:
  - **Admin / SeniorAdmin** – full access (students, entries, reports, bulk import).
  - **Teacher** – create/edit entries, view students and reports.
  - **Management** – read-only reports and student/entry lists.

For full testing, use **Admin** (or the seeded super-admin from your backend).

---

## 2. Test order (recommended)

Data flow: **Students → Entries → Reports**. Create students first, then entries, then check reports.

1. **Students** – add/list/edit/deactivate, optional bulk import.
2. **Entries** – add/list/edit/delete (each entry needs a student and date).
3. **Reports** – overall, weekly, class breakdown, student report.

---

## 3. Testing Students

### 3.1 List students

- Go to **Quran Students** (nav: "Quran Students" or `/dashboard/admin/quran/students`).
- You should see:
  - Filters: search, class, supervision, active.
  - Table (or skeleton while loading).
  - "Add Student", "Bulk Import".
- If there are no students, you see empty state and "Add your first student".

**Check:** Loading shows table skeleton with placeholder rows, not plain "Loading...".

### 3.2 Add student

- Click **Add Student** (or go to `/dashboard/admin/quran/students/add`).
- Fill:
  - **Student ID** – positive integer (e.g. `1`).
  - **Name (English)** – required.
  - **Name (Bengali)** – optional.
  - **Class** – e.g. `10-1-25`.
  - **Supervision** – toggle.
  - **Active** – toggle (default on).
  - **Notes** / **Photo** – optional.
- Submit **Create Student**.

**Expected:** Success toast, redirect to student list, new row in table.

**Validation:** Submit with empty name or invalid Student ID; you should see form errors.

### 3.3 Edit student

- On the list, click **Edit** for a student.
- Change name, class, or other fields.
- Submit **Save changes**.

**Expected:** Success toast, redirect to list, updated data.

**Loading:** While the single student loads, you should see a form-shaped skeleton, not "Loading...".

### 3.4 Deactivate student

- On the list, click **Deactivate** for a student.
- Confirm.

**Expected:** Success toast, list refreshes; student can show as inactive depending on filters.

### 3.5 Report link from list

- Click **Report** on a student row.
- You should go to that student’s report page (we’ll use it again in Reports).

### 3.6 Invalid / not found

- Open `/dashboard/admin/quran/students/invalid-id-123`.
- You should see an error message (e.g. "Student not found" or API message) and "Back to list".

---

## 4. Testing Entries

### 4.1 List entries

- Go to **Quran Entries** (nav or `/dashboard/admin/quran/entries`).
- You should see:
  - Filters: student, class, supervision, date range, ustad name.
  - Table (or skeleton while loading).
  - "Add entry" (or similar).

**Check:** Loading shows table skeleton.

### 4.2 Add entry

- Click **Add entry** (or `/dashboard/admin/quran/entries/add`).
- **Student dropdown:** If students are still loading, it should show "Loading students..." and be disabled.
- Select a **student**, set **Report date**.
- For **New / Recent / Older** test sections:
  - Toggle "Test given?".
  - If given, set **Tanbih** and **Fath** (numbers ≥ 0).
  - Optional note.
- Optionally fill **Tajweed notes** (Harf, Ghunna, Madd, Other), **General note**, **Ustad name**, **Signature**.
- Submit (e.g. **Save entry**).

**Expected:** Success toast, redirect to entries list; new row with that student and date.

**Validation:** Submit without student or date; you should see form errors.

### 4.3 Edit entry

- On the list, click **Edit** for an entry.
- Student and report date are read-only; change test data, tajweed notes, or ustad/signature.
- Submit **Save changes**.

**Expected:** Success toast, redirect to list, updated data.

**Loading:** Form skeleton while entry loads.

### 4.4 Delete entry

- Click **Delete** on an entry, confirm.

**Expected:** Success toast, entry removed from list.

### 4.5 Not found

- Open `/dashboard/admin/quran/entries/invalid-id-123`.
- You should see an error message and "Back to list".

---

## 5. Testing Reports

### 5.1 Overall report

- Go to **Quran Reports** (nav or `/dashboard/admin/quran/reports`).
- You should see:
  - Filters: start date, end date, class, supervision.
  - KPI cards (total students, active students, entries, avg mistakes, test completion).
  - Charts (e.g. mistake distribution, mistakes by test type).

**Date validation:** Set **end date** before **start date** and apply. You should see an inline error (e.g. "Start date must be before or equal to end date") and no invalid request sent.

**Loading:** Skeleton layout with stat cards and chart placeholders.

### 5.2 Weekly trend report

- From reports, click **Weekly summary** (or `/dashboard/admin/quran/reports/weekly`).
- Use same filters (date range, class, supervision).
- You should see trend badge (improving/declining/stable), average change %, line chart, and weekly table.

**Loading:** Card-based skeleton (trend area, chart, table).

### 5.3 Class breakdown report

- Click **Class breakdown** (or `/dashboard/admin/quran/reports/class`).
- You should see chart and table by class.

**Loading:** Card-based skeleton.

### 5.4 Student report

**From students list:**

- Go to **Quran Students**, click **Report** on a student.

**From reports:**

- Click **Student report (pick student)** to go to students list, then **Report** on a row.

**On student report page:**

- Optional filters: start date, end date (same date-range rule: start ≤ end).
- You should see:
  - Student info (name, ID, class, supervision).
  - Summary stats (entries, avg Tanbih/Fath/mistakes, test completion %).
  - Weekly trend chart.
  - Entry history table.
  - Common issues (Tajweed notes: Harf, Ghunna, Madd, Other).

**Invalid student ID:** Open `/dashboard/admin/quran/reports/student/not-a-valid-id`. You should see "Invalid student ID" (or similar) and no API call for report.

**Loading:** Skeleton matching student card, stat cards, chart, and table.

---

## 6. Validation and error handling

| Scenario                               | Where                              | Expected                                                                  |
| -------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| Date range: end &lt; start             | All report filters                 | Inline message; no invalid API request (or backend 400 with message).     |
| Invalid MongoDB ID in URL              | Edit student/entry, student report | Friendly message (e.g. invalid ID or not found) and no crash.             |
| 404 (student/entry not found)          | Edit student/entry                 | API error message shown (e.g. "Resource not found") and "Back to list".   |
| Duplicate student ID                   | Add student                        | Backend error message in toast (e.g. "Student with ID X already exists"). |
| Create entry with non-existent student | Add entry (if possible)            | Backend error in toast.                                                   |

---

## 7. Loading states checklist

- **Students list:** Table skeleton (header + rows), not "Loading...".
- **Entries list:** Table skeleton (header + rows).
- **Edit student:** Form skeleton (card, fields, buttons).
- **Edit entry:** Form skeleton (card, student/date block, sections, buttons).
- **Add entry – student dropdown:** "Loading students..." and disabled until students load.
- **Overall report:** Stat cards + chart area skeletons.
- **Weekly / class / student report:** Card-based skeletons matching content.

---

## 8. Optional: API testing with curl

Use after logging in to get a JWT (e.g. from browser DevTools → Application → Cookies or Network).

```bash
# Set your token and base URL
export TOKEN="your-jwt-here"
export BASE="http://localhost:5000/api/v1/quran"   # adjust if your API prefix differs

# List students
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/students?page=1&limit=10"

# Get one student (use real _id from list)
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/students/<studentId>"

# Create student
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"studentId":1,"nameEn":"Test Student","class":"10-1-25","supervision":false,"active":true}' \
  "$BASE/students"

# List entries
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/entries?page=1&limit=10"

# Create entry (use real student _id)
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"studentId":"<studentId>","reportDate":"2025-01-15","newTest":{"given":true,"tanbih":0,"fath":1},"recentTest":{"given":false,"tanbih":0,"fath":0},"olderTest":{"given":false,"tanbih":0,"fath":0}}' \
  "$BASE/entries"

# Reports (optional date range)
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/reports/overall"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/reports/weekly-summary"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/reports/class-breakdown"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/reports/student/<studentId>"
```

Replace `your-jwt-here`, `<studentId>`, and port/prefix to match your setup.

---

## 9. Roles (quick reference)

| Action                          | Admin / SeniorAdmin | Teacher | Management |
| ------------------------------- | ------------------- | ------- | ---------- |
| List students                   | ✓                   | ✓       | ✓          |
| Add / Edit / Deactivate student | ✓                   | —       | —          |
| Bulk import students            | ✓                   | —       | —          |
| List entries                    | ✓                   | ✓       | ✓          |
| Add / Edit entry                | ✓                   | ✓       | —          |
| Delete entry                    | ✓                   | ✓       | —          |
| Bulk import entries             | ✓                   | —       | —          |
| All reports                     | ✓                   | ✓       | ✓          |

Use an Admin user for the full flow above; use Teacher or Management to confirm restricted access where applicable.

---

## 10. Summary flow (minimal path)

1. Start backend + frontend; log in as Admin.
2. **Students:** Add at least one student (e.g. ID `1`, name "Test", class "10-1-25").
3. **Entries:** Add one entry for that student (today’s date, fill at least one test section).
4. **Reports:** Open Overall report → Weekly summary → Class breakdown → Student report (via Report on student row).
5. Confirm filters, date validation, loading skeletons, and error messages as above.

If all steps work and validation/loading/errors behave as in this guide, the full feature is covered for manual testing.
