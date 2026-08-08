# ProjectManagementTool

Full-stack collaborative project management tool.

## Features

- 📁 Create projects and add team members by email
- 🗂 Task board with three columns: To Do, In Progress, Done
- 👤 Assign tasks to project members, set due dates
- 💬 Comment on tasks for team communication
- ⚡ **Bonus:** Real-time updates via **Django Channels (WebSockets)** — task creates/updates/deletes, new comments, and new members all sync live across everyone viewing the same project, no page refresh
- 🔓 **One-tap login** — a login page with a single "Login" button (no email/password fields); tapping it silently signs into a shared demo account and takes you to the dashboard

## Tech Stack

- **Frontend:** Angular 18 (standalone components), RxJS, native WebSocket API
- **Backend:** Django + Django REST Framework
- **Database:** SQLite by default (swap to Postgres/MySQL trivially via `DATABASES` in `settings.py`)
- **Auth:** JWT (djangorestframework-simplejwt) — still required by the API, just not exposed as a UI
- **Real-time:** Django Channels + Daphne (ASGI)

## Routing

The Angular app uses `@angular/router` with two routes:

| Path | Component | Guard |
|---|---|---|
| `/login` | `LoginComponent` — one button, no fields | — |
| `/dashboard` | `DashboardComponent` — sidebar + board + modals | `authGuard` (redirects to `/login` if no session token) |
| `/`, `**` | redirect to `/login` | — |

Tapping **Login** silently establishes the (demo) session via `AuthService`, then navigates to `/dashboard`. The guard just checks that a token exists in `localStorage` before allowing entry — it doesn't re-authenticate, so refreshing on `/dashboard` after logging in works without bouncing back to `/login`.

## Setup & Run

### 1. Backend (Django)

```bash
cd backend-django
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

The API runs on `http://127.0.0.1:8000` (health check: `GET /api/health/`). WebSockets are served from the same process at `ws://127.0.0.1:8000/ws/projects/<id>/` via Daphne/Channels — no separate process needed for development.

Optional: copy `.env.example` to `.env` and export those variables (or wire up `django-environ`/`python-dotenv`) to change the secret key, allowed hosts, or CORS origin for production.

### 2. Frontend (Angular)

Scaffolded and generated entirely with the **Angular CLI** (`ng new`, `ng generate component/service/pipe/interceptor`) — standard `angular.json` project layout, each component with its own `.ts`/`.html`/`.css` files.

```bash
cd frontend-angular
npm install
ng serve            # http://localhost:4200
```

Other useful CLI commands:
```bash
ng build             # production build -> dist/frontend-angular
ng generate component components/my-thing   # scaffold a new component the same way the rest were made
```

## How to Use

1. Open the app — you land on `/login`. Click **Login** (no fields to fill in) and you're taken to the dashboard.
2. Click **+** in the sidebar to create a project.
3. Click **Add Member** and enter a teammate's email to invite them (they'd need their own account — see the note above about adding real login fields if you want multiple real users).
4. Click **+ New Task** to add tasks, optionally assigning them and setting a due date.
5. Click any task card to open its detail view — change status/assignee, or leave comments.
6. Open the same project in two browser tabs to see real-time sync via WebSockets in action.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register/ | Create account |
| POST | /api/auth/login/ | Log in, get JWT |
| GET | /api/auth/me/ | Get current user |
| GET | /api/projects/ | List my projects |
| POST | /api/projects/ | Create project |
| GET | /api/projects/:id/ | Get project + its tasks |
| POST | /api/projects/:id/members/ | Add member by email |
| DELETE | /api/projects/:id/ | Delete project (owner only) |
| POST | /api/tasks/project/:projectId/ | Create task |
| PUT | /api/tasks/:id/ | Update task |
| DELETE | /api/tasks/:id/ | Delete task |
| GET | /api/comments/task/:taskId/ | List comments |
| POST | /api/comments/task/:taskId/ | Add comment |
| WS | /ws/projects/:id/?token=... | Real-time project events |

All REST endpoints except register/login require an `Authorization: Bearer <token>` header.

# FrontendAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.21.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

