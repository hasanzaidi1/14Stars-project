# API Reference

_All endpoints are relative to the Express base URL. JSON responses default to `{ success, message }` or resource payloads; errors return `{ error: string }`._

## Authentication & Sessions
- Cookies: `SESSION_COOKIE_NAME` (default `14stars.sid`).
- Headers: every response includes `x-request-id`.
- Admin uses `.env` credentials; teachers and parents use hashed passwords stored in DB.

## Endpoint Catalog

### Admin (`/admins`)
| Method & Path | Auth | Description |
| --- | --- | --- |
| `POST /admins/login` | none | Authenticate admin using `ADMIN_USERNAME/PASSWORD`. |
| `POST /admins/register` | Admin session required | Register student with demographic info. |
| `GET /admins/all` | Admin | Return complete student list. |
| `GET /admins/studByName?fname=&lname=` | Admin | Search students by partial first/last name. |
| `POST /admins/register-parent` | Admin | Add guardian into `guardian` table. |
| `GET /admins/all-guardians` | Admin | Fetch guardians. |
| `POST /admins/assignGuardian` | Admin | Link guardian to student. |
| `GET /admins/getStudentGuardianData` | Admin | Student ↔ guardian join view. |
| `PUT /admins/student-guardian` | Admin | Update guardian relationship. |
| `DELETE /admins/student-guardian` | Admin | Remove guardian relationship. |
| `GET /admins/logout` | Admin | Destroy session and redirect to login page. |

**Request example** (register student):
```http
POST /admins/register
Content-Type: application/json

{
  "fname": "Nora",
  "MI": "A",
  "lname": "Lopez",
  "DOB": "2014-05-12",
  "st_address": "120 Main",
  "city": "Boston",
  "state": "MA",
  "zip": "02108",
  "st_email": "nora@example.com",
  "st_cell": "6175550100",
  "student_location": "on-site",
  "gender": "Female"
}
```
**Success**
```json
{
  "success": true,
  "message": "Student registered successfully!",
  "student_id": 42
}
```
**Conflict**
```json
{ "success": false, "message": "Student already exists" }
```

### Parent (`/parents`)
| Method & Path | Auth | Description |
| --- | --- | --- |
| `POST /parents/register` | none | Create parent account (hashed password). |
| `POST /parents/login` | none | Login parent; sets `isParent` session flags. |
| `GET /parents/logout` | Parent | Destroy session. |
| `POST /parents/register-from-parent` | Parent | Register student + guardian relationship tied to logged-in parent. |
| `GET /parents/students` | Parent | Fetch children for guardian ID/email. |
| `GET /parents/student-academics` | Parent | List assigned levels, terms, grades, teacher info. |
| `GET /parents/guardianNames` | Admin/Parent | Return guardian display list. |
| `PUT /parents/:id` | Admin | Update guardian details. |
| `DELETE /parents/:id` | Admin | Delete guardian record. |

**Example response (`/parents/student-academics`):**
```json
[
  {
    "studentId": 32,
    "studentName": "Nora Lopez",
    "className": "Math",
    "levelId": 4,
    "termId": 9,
    "termName": "Fall",
    "schoolYear": "2024-2025",
    "midtermGrade": 89,
    "finalGrade": 93,
    "averageGrade": 91,
    "teacherName": "Jordan Phelps",
    "isCurrentYear": true
  }
]
```

### Teacher (`/teachers`)
| Method & Path | Auth |
| --- | --- |
| `POST /teachers/teacher-login` | none |
| `GET /teachers/teacher-logout` | Teacher |
| `POST /teachers/register` | none (self-service) |
| `POST /teachers/profiles` | Admin |
| `GET /teachers/all` | Admin |
| `GET /teachers/me` | Teacher |
| `PUT /teachers/:id` | Admin |
| `DELETE /teachers/:id` | Admin |
| `GET /teachers/teacher_portal` | Teacher (serves HTML) |

Teacher registration body fields: `t_f_name`, `t_l_name`, `t_email`, address, phone, `password`, `confirm_password`. Controller validates profile exists and password length > 8.

### Students (`/students`)
| Endpoint | Description |
| --- | --- |
| `POST /students/register` | Register new student (admin usage). |
| `POST /students/find` | Lookup by first/last name. |
| `GET /students/all` | List. |
| `GET /students/fullName` | Return `St_ID` + full name string. |
| `PUT /students/:id` | Update demographic data. |
| `DELETE /students/:id` | Remove student. |

### Subjects (`/subjects`)
- `POST /subjects/add` – create subject.
- `GET /subjects/fetch` – list subjects.
- `PUT /subjects/:id` – rename.
- `DELETE /subjects/:id` – remove.

### Levels (`/levels`)
- `GET /levels/` – list grade levels.
- `POST /levels/` – add level number.
- `PUT /levels/:id` – update.
- `DELETE /levels/:id` – delete.

### Terms (`/terms`)
- `POST /terms/` – create term (`term_name`, `school_year`).
- `GET /terms/` – list.
- `PUT /terms/:id` – update.
- `DELETE /terms/:id` – delete.

### Student Levels (`/student-levels`)
| Endpoint | Purpose |
| --- | --- |
| `POST /student-levels/assign` | Assign student to level/subject/term with optional grades. |
| `GET /student-levels/assigned` | Fetch all assignments with term metadata. |
| `PUT /student-levels/assigned` | Update assignment (requires `studentId`, `originalLevelId`, `originalSubject`). |
| `DELETE /student-levels/assigned` | Remove assignment. |

### Teacher-Class Assignments (`/teacher-classes`)
| Endpoint | Description |
| --- | --- |
| `POST /teacher-classes/assign` | Map teacher, level, subject to school year. |
| `GET /teacher-classes/assigned` | Retrieve assignments (includes teacher names, level numbers, subjects). |
| `PUT /teacher-classes/assigned/:assignmentId` | Update mapping. |
| `DELETE /teacher-classes/assigned/:assignmentId` | Delete mapping. |

### Substitutes (`/substitute`)
- `POST /substitute/register` – Add substitute (deduplicated by email).
- `GET /substitute/fetch` – List substitutes.
- `PUT /substitute/:id` – Update contact info.
- `DELETE /substitute/:id` – Remove.

### Substitute Requests (`/substitute-requests`)
- `POST /substitute-requests/submit` – Submit teacher absence request.
- `GET /substitute-requests/fetch` – Admin view of pending requests.
- `POST /substitute-requests/update` – Mark `satisfied_by` substitute/teacher.

**Success Example**
```json
{
  "success": true,
  "message": "Substitute request submitted successfully."
}
```

**Error Example (duplicate date/email)**
```json
{
  "success": false,
  "message": "A substitute request for this date already exists."
}
```

## Error Handling
- 4xx responses for validation/auth issues.
- 5xx responses collapse to `Internal server error`; logged via `logger.error`.
- HTML portal postings are redirected to `/success.html?type=<success|error>` by `helpers.sendPortalResponse`.
