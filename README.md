# 14Stars Project

Backend service for the 14 Stars Education Center. It exposes RESTful APIs and static portals that let administrators, teachers, parents, and substitutes manage students, guardians, teaching levels, and term schedules. The codebase follows a classic Express MVC layout (routes → controllers → models) backed by a MySQL database.

## Features
- Session-based authentication flows for admins, teachers, and parents (with optional "remember me" cookies for admins).
- Student lifecycle management: registration, lookups, guardian assignments, level placements, and parent self-service enrollment.
- Subject, level, and term catalogs used to organize instruction and reporting.
- Teacher-class assignments that bind a rostered teacher to a level/subject for a given school year (with duplication safeguards).
- Substitute onboarding plus submission and tracking of substitute requests (including "satisfied by" updates).
- JSON + HTML delivery: `/public_html` hosts the portals, while JSON APIs live under `/admins`, `/teachers`, `/parents`, etc.
- Structured request logging (per-request IDs + daily log files) paired with a persistent MySQL-backed session store.
- Pretty URLs for static portals: navigate without `.html` extensions and the server automatically resolves the right file.

## Tech Stack
- Node.js + Express 4
- MySQL via `mysql2/promise`
- `express-session`, `cookie-parser`, and `bcrypt` for stateful logins
- `dotenv` for configuration, `moment`/utility helpers for date handling

## Project Structure
```
14Stars-project/
├── src/
│   ├── app.js                # Express bootstrapper and route registration
│   ├── config/               # Database pool + schema script
│   ├── middlewares/          # Session guards
│   ├── modules/              # Feature-specific MVC bundles (controller/model/routes)
│   │   ├── admin/
│   │   ├── parent/
│   │   ├── student/
│   │   ├── teacher/
│   │   ├── subject/
│   │   ├── level/
│   │   ├── student-level/
│   │   ├── teacher-class/
│   │   ├── term/
│   │   ├── substitute/
│   │   └── substitute-request/
│   └── utils/                # Shared helpers (validation, date + path utilities)
├── public_html/              # Static portals served via express.static
├── README.md
└── package.json
```

Each domain module keeps its controller, model, and router colocated, which makes the business logic reusable (import the controller/model anywhere) and keeps cross-module contracts explicit.

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create the database**
   - Ensure MySQL is running and you have a database ready (default schema name in `config/schema.sql` is `admin14stars_education_center`).
   - Run the schema script:
     ```bash
     mysql -u <user> -p < database_name> < config/schema.sql
     ```
3. **Configure environment variables** (see below for every key) and save them in `.env`.
4. **Start the server**
   ```bash
   npm start
   ```
   The API listens on `http://localhost:30000` by default and serves the static portals from `/public_html`.

## Environment Variables
| Variable | Description |
| --- | --- |
| `PORT` | Optional. Defaults to `30000`. |
| `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` | MySQL connection settings used by `mysql2`. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Credentials for `/admins/login`. |
| `SESSION_SECRET` | Required. Secret used to sign session cookies. |
| `SESSION_COOKIE_NAME` | Optional. Name of the session cookie (`14stars.sid` by default). |
| `SESSION_TTL_MINUTES` | Optional. Session lifetime; defaults to 240 minutes (4 hours). |
| `LOG_LEVEL` | Optional. One of `error`, `warn`, `info`, or `debug`. Defaults to `info`. |

Teacher accounts are now created directly from the Teacher portal or the admin dashboard; each record stores its own hashed password in MySQL, so no environment variables are required for those logins.

> **Migration note:** run the following SQL on the active schema to add dedicated teacher accounts:
> ```sql
> ALTER TABLE teachers DROP COLUMN IF EXISTS password_hash;
> CREATE TABLE IF NOT EXISTS teacher_accounts (
>   account_id INT AUTO_INCREMENT PRIMARY KEY,
>   first_name VARCHAR(255) NOT NULL,
>   last_name VARCHAR(255) NOT NULL,
>   email VARCHAR(255) NOT NULL UNIQUE,
>   phone VARCHAR(50),
>   password_hash VARCHAR(255) NOT NULL,
>   created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
> ) ENGINE=InnoDB;
> ALTER TABLE teacher_accounts
>   ADD CONSTRAINT fk_teacher_accounts_email
>   FOREIGN KEY (email) REFERENCES teachers(t_email)
>   ON DELETE CASCADE;
> ```
> Existing teacher rows remain unchanged; account records are independent of the legacy `teachers` table.

> **Migration note (student grades):** run this SQL to add grade tracking to assignments:
> ```sql
> ALTER TABLE student_level
>   ADD COLUMN midterm_grade DECIMAL(5,2) NULL AFTER school_year,
>   ADD COLUMN final_grade DECIMAL(5,2) NULL AFTER midterm_grade,
>   ADD COLUMN average_grade DECIMAL(5,2) NULL AFTER final_grade;
> ```
> The admin portal now reads/writes these columns, and the teacher portal displays them.

> **Migration note (terms linked to student assignments):** run this SQL before deploying the term-aware portals:
> ```sql
> ALTER TABLE student_level
>   ADD COLUMN term_id INT NULL AFTER level_id,
>   ADD INDEX student_level_ibfk_3 (term_id),
>   ADD CONSTRAINT student_level_ibfk_3
>     FOREIGN KEY (term_id) REFERENCES term(term_id);
> ```
> Existing records will have `term_id = NULL`. Revisit `/admin/student_level.html` to assign the correct term so parents and teachers see accurate histories.

> **Migration note (teacher-class assignments):** apply this SQL to add the new bridge table that powers the Teacher Classes admin screen and `/teacher-classes` API.
> ```sql
> CREATE TABLE IF NOT EXISTS teacher_class_assignments (
>   assignment_id INT AUTO_INCREMENT PRIMARY KEY,
>   teacher_id INT NOT NULL,
>   level_id INT NOT NULL,
>   subject_id INT NOT NULL,
>   school_year VARCHAR(15) NOT NULL,
>   created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
>   UNIQUE KEY uq_teacher_class_year (teacher_id, level_id, subject_id, school_year),
>   CONSTRAINT fk_teacher_class_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (t_id) ON DELETE CASCADE,
>   CONSTRAINT fk_teacher_class_level FOREIGN KEY (level_id) REFERENCES level (level_id) ON DELETE CASCADE,
>   CONSTRAINT fk_teacher_class_subject FOREIGN KEY (subject_id) REFERENCES subject (subject_id) ON DELETE CASCADE
> ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
> ```
> Once the table exists, the admin portal's **Teacher Classes** page can create/edit the assignments without throwing `ER_NO_SUCH_TABLE`.

### Sample `.env`
```
PORT=30000
DB_HOST=127.0.0.1
DB_USER=admin14stars
DB_PASS=supersecret
DB_NAME=admin14stars_education_center
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
SESSION_SECRET=replace-me
SESSION_COOKIE_NAME=14stars.sid
SESSION_TTL_MINUTES=240
LOG_LEVEL=info
```

## Database Entities
`config/schema.sql` builds the following core tables:
- `student`, `guardian`, and the bridge table `student_guardian` (plus `parent_account` for parent logins).
- Teaching metadata: `subject`, `level`, `student_level` (with `midterm_grade`, `final_grade`, and `average_grade`), and `term`.
- Teacher coverage metadata: `teacher_class_assignments` links a teacher, level, subject, and school year (used by the admin Teacher Classes board and `/teacher-classes` API).
- `teacher_accounts` for login credentials plus the legacy `teachers` directory used by admins.
- Substitute operations: `substitute` and `substitute_requests`.
- Auth state persistence: the `sessions` table stores Express sessions in MySQL.

## API Overview
The Express routers are mounted in `app.js`. All endpoints accept/return JSON unless noted.

### Admin (`/admins`)
| Method & Path | Description |
| --- | --- |
| `POST /login` | Session-based admin login. Supports `remember` to persist a username cookie. |
| `POST /register` | Register a student (admin-initiated). |
| `GET /all` | Fetch every student record. |
| `GET /studByName?fname=&lname=` | Query students by name fragment. |
| `POST /register-parent` | Register a guardian independently of a student. |
| `GET /all-guardians` | List the guardian directory. |
| `POST /assignGuardian` | Link an existing guardian to a student with a relationship type. |
| `GET /getStudentGuardianData` | Combined student/guardian view. |
| `GET /logout` | Clear the admin session. |

### Teacher (`/teachers`)
| Method & Path | Description |
| --- | --- |
| `POST /teacher-login` + `GET /teacher-logout` | Session login/logout backed by the `teachers` table (email + password). |
| `POST /register` | Creates a login for an existing teacher, enforcing email + name matches against the admin-maintained roster. |
| `POST /profiles` | Admin-only route that creates/updates the roster entry in `teachers` (no password). |
| `GET /me` | Returns the logged-in teacher's account metadata (used by portal autofill). |
| `GET /all` | Fetches every teacher (adds a `full_name` field). |
| `GET /teacher_portal.html` | Protected static portal (served after login). |

> Teachers must already appear in the admin-managed `teachers` roster (matching first name, last name, and email) before they can self-create a portal login. Admins can seed both the roster and account via the dashboard; teachers registering themselves will be blocked until their profile exists.

#### Teacher onboarding & portal workflow
1. **Admin adds the roster profile** – Via `/admin/teacher_table.html`, the admin submits first name, last name, and email (plus optional contact info). The form POSTs to `POST /teachers/profiles`, which stores the record in the legacy `teachers` table. Admins never touch passwords.
2. **Teacher creates the portal account** – From `/teachers/teachers`, the teacher enters the exact first name, last name, and email that the admin used, plus their chosen password. `POST /teachers/register` validates the match, hashes the password, and inserts the account into `teacher_accounts`.
3. **Teacher logs in & requests substitutes** – After logging in, `GET /teachers/me` is called by the portal JS to auto-populate the substitute request form with the authenticated email (read-only) and display name. Every substitute form submission now carries the verified email, eliminating typos.

### Parent (`/parents`)
| Method & Path | Description |
| --- | --- |
| `POST /register` | Parent portal account creation (stores hashed password). |
| `POST /login` / `GET /logout` | Parent authentication flow. |
| `POST /register-from-parent` | Parent self-service student enrollment (creates or reuses guardian + student + relationship). |
| `POST /students` | List students that belong to a guardian email. |
| `GET /guardianNames` | Fetch guardian IDs + display names (used by admin UI dropdowns). |

### Students (`/students`)
| Method & Path | Description |
| --- | --- |
| `POST /register` | Register a student (standalone API). |
| `POST /find` | Exact match lookup by first/last name. |
| `GET /all` | Fetch every student. |
| `GET /fullName` | Return `St_ID` plus concatenated name. |

### Subjects, Levels, and Assignments
- `POST /subjects/add` / `GET /subjects/fetch` – mutate/read the `subject` catalog.
- `POST /levels` / `GET /levels` – create or list levels.
- `POST /student-levels/assign` – assign a student + subject combination to a level (grades are entered later, once the assignment exists).
- `GET /student-levels/assigned` – list all placements, including grade fields for midterm/final/average.
- `PUT /student-levels/assigned` – update an assignment’s level/subject/school year and/or any of the grade fields (grades are edited from the Student Levels admin table after the record is created).

### Teacher-Class Assignments (`/teacher-classes`)
- `POST /teacher-classes/assign` – create a teacher/level/subject pairing for a school year (duplicates are blocked server-side).
- `GET /teacher-classes/assigned` – list every pairing, including teacher names, level numbers, and subjects (used by `/admin/teacher_classes.html`).
- `PUT /teacher-classes/assigned/:assignmentId` – modify the teacher, level, subject, and/or school year for an existing pairing.
- `DELETE /teacher-classes/assigned/:assignmentId` – remove a pairing when a teacher leaves a class.

> Admin UI tip: open **Admin → Teacher Classes** in the portal to use a form-driven version of these endpoints. The page pulls live teacher/level/subject dropdowns, shows validation errors (e.g., duplicates), and lets you edit or delete assignments inline.

### Terms (`/terms`)
- `POST /terms` – create a term (`term_name`, `school_year`).
- `GET /terms` – list all terms.

### Substitutes
- `POST /substitute/register` / `GET /substitute/fetch` – manage substitute roster.
- `POST /substitute-requests/submit` – teachers submit a request for a particular date.
- `GET /substitute-requests/fetch` – list outstanding requests.
- `POST /substitute-requests/update` – mark which substitute satisfied the request.

## Development Notes
- Static HTML resides in `public_html`; Express is configured with `app.use(express.static('public_html'))`.
- All portal links can omit `.html` extensions. Direct `.html` requests are permanently redirected to their extensionless versions.
- Feature modules live in `src/modules/<domain>` and bundle their controller/model/routes together so you can reuse those pieces in tests, CLIs, or future services without digging through unrelated folders.
- `utils/helpers.js` centralizes validation helpers, school-year computation, and DB utilities reused by multiple controllers.
- Sessions are stored server-side inside the MySQL `sessions` table and automatically cleaned up.
- Structured request/exception logs are appended to `logs/<YYYY-MM-DD>.log`; adjust verbosity with `LOG_LEVEL`.
- No automated tests exist yet (`npm test` is a placeholder). Add Jest or another runner before extending mission-critical code.
- When modifying database tables, update both the schema file _and_ any dependent model/controller validation logic to keep the API stable.

## Troubleshooting
- **401/403 responses** – confirm the relevant session flag (`isAdmin`, `isTeacher`, `isParent`) is being set during login; cookies may need to be cleared when switching roles.
- **Database connection errors** – validate the `.env` credentials and ensure the MySQL user has permission to connect from the host where Node is running.
- **Duplicate record errors** – models throw MySQL `ER_DUP_ENTRY`; surface user-friendly messages by catching `error.code` in controllers (see teacher registration for an example).

Happy coding!
