# Architecture

## High-Level Design
The system follows a modular MVC pattern:
- **Express bootstrap (`src/app.js`)** wires middleware, static asset serving, and router registration.
- **Modules per domain** (students, parents, teachers, etc.) each expose `*.routes.js`, `*.controller.js`, `*.model.js`.
- **Shared utilities** (logger, helpers) provide cross-cutting functionality (validation, responses, date logic).
- **MySQL** holds relational tables for people, assignments, and session data.
- **Static portals** in `public_html/` interact with JSON APIs using forms or AJAX.

## Request Lifecycle
```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Middleware
    participant Controller
    participant Model
    participant MySQL

    Client->>Express: HTTP Request
    Express->>Middleware: requestLogger()
    Middleware->>Middleware: bodyParser/json/urlencoded
    Middleware->>Middleware: cookieParser + sessionStore
    Middleware->>Middleware: redirectHtmlRequests / static
    Middleware->>Controller: Route handler
    Controller->>Model: Execute business logic
    Model->>MySQL: SQL query via mysql2 pool
    MySQL-->>Model: Result rows
    Model-->>Controller: Domain entities
    Controller-->>Express: JSON / redirect
    Express-->>Client: Response + x-request-id
```

## Folder Structure
| Path | Description |
| --- | --- |
| `src/app.js` | Primary server bootstrap and router composition. |
| `src/config/dbConfig.js` | MySQL pool (`mysql2/promise`) configured from `.env`. |
| `src/config/sessionStore.js` | Custom `express-session` store writing to `sessions`. |
| `src/middlewares` | Logging, error handling, authentication, HTML routing helpers. |
| `src/modules/*` | Feature modules following MVC segmentation. |
| `src/utils/logger.js` | Rolling file logger with stdout/stderr mirroring. |
| `public_html` | Static admin/parent/teacher portals delivered without `.html` suffixes. |
| `logs` | Rotated log files named `YYYY-MM-DD.log`. |

## Patterns
- **MVC per module** – Routes call controllers, controllers orchestrate helper/model operations, models interact with DB.
- **Service Helpers** – `src/utils/helpers.js` centralizes validation, sanitized responses, and date logic.
- **Custom Session Store** – Inherits from `express-session.Store` to persist sessions in MySQL with TTL cleanup.
- **Middleware Chain** – Request logging + metrics, HTML path normalization, centralized error handler.
- **Portal Response Adapter** – `helpers.sendPortalResponse` tailors responses to HTML form submissions vs. XHR.

## Module Interactions
```mermaid
graph LR
    Admin[Admin Module] -->|registers| Student
    Admin -->|links| Guardian
    Parent -->|registers| Student
    Parent -->|queries| StudentLevel
    Teacher -->|authenticates| TeacherAccount
    Teacher -->|requests| SubstituteRequest
    TeacherClass -->|maps| Teacher & Level & Subject
    StudentLevel -->|uses| Term
    SubstituteRequest --> Substitute
```
- Admin + parent flows both hit `StudentModel` but differ in validation + session requirements.
- Teacher-class assignments enrich parent academic views by joining `teacher_class_assignments` when available.
- Substitute requests leverage `helpers.sendPortalResponse` so HTML modals and API clients receive tailored feedback.
