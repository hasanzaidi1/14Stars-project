# 14Stars Project

Backend service for the 14 Stars Education Center. It exposes RESTful APIs and static portals that let administrators, teachers, parents, and substitutes manage students, guardians, teaching levels, and term schedules. The codebase follows a classic Express MVC layout (routes → controllers → models) backed by a MySQL database.

## Features
- Session-based authentication flows for admins, teachers, and parents (with optional "remember me" cookies for admins).
- Student lifecycle management: registration, lookups, guardian assignments, level placements, and parent self-service enrollment.
- Subject, level, and term catalogs used to organize instruction and reporting.
- Substitute onboarding plus submission and tracking of substitute requests (including "satisfied by" updates).
- JSON + HTML delivery: `/public_html` hosts the portals, while JSON APIs live under `/admins`, `/teachers`, `/parents`, etc.

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
| `TEACHER_USERNAME`, `TEACHER_PASSWORD` | Credentials for `/teachers/teacher-login`. |

> Tip: the session secret in `src/app.js` is currently hard-coded; update it or move it into the `.env` file when deploying.

### Sample `.env`
```
PORT=30000
DB_HOST=127.0.0.1
DB_USER=admin14stars
DB_PASS=supersecret
DB_NAME=admin14stars_education_center
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me
TEACHER_USERNAME=teacher
TEACHER_PASSWORD=change-me
```

## Database Entities
`config/schema.sql` builds the following core tables:
- `student`, `guardian`, and the bridge table `student_guardian` (plus `parent_account` for parent logins).
- Teaching metadata: `subject`, `level`, `student_level`, and `term`.
- Substitute operations: `substitute` and `substitute_requests`.

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
| `POST /teacher-login` + `GET /teacher-logout` | Session login/logout with env-configured credentials. |
| `POST /register` | Adds a teacher; prevents duplicate emails. |
| `GET /all` | Fetches every teacher (adds a `full_name` field). |
| `GET /teacher_portal.html` | Protected static portal (served after login). |

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
- `POST /student-levels/assign` – assign a student + subject combination to a level. Uses helpers to generate the `school_year`.
- `GET /student-levels/assigned` – list all placements.

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
- Feature modules live in `src/modules/<domain>` and bundle their controller/model/routes together so you can reuse those pieces in tests, CLIs, or future services without digging through unrelated folders.
- `utils/helpers.js` centralizes validation helpers, school-year computation, and DB utilities reused by multiple controllers.
- No automated tests exist yet (`npm test` is a placeholder). Add Jest or another runner before extending mission-critical code.
- When modifying database tables, update both the schema file _and_ any dependent model/controller validation logic to keep the API stable.

## Troubleshooting
- **401/403 responses** – confirm the relevant session flag (`isAdmin`, `isTeacher`, `isParent`) is being set during login; cookies may need to be cleared when switching roles.
- **Database connection errors** – validate the `.env` credentials and ensure the MySQL user has permission to connect from the host where Node is running.
- **Duplicate record errors** – models throw MySQL `ER_DUP_ENTRY`; surface user-friendly messages by catching `error.code` in controllers (see teacher registration for an example).

Happy coding!
