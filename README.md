# CodeAlpha_ProjectManagementTool

Full-stack collaborative project management tool (like a mini Trello/Asana) — built for **CodeAlpha Full Stack Development Internship, Task 3**.

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

## A note on "no password"

The task brief calls for an **auth system**, so the API still requires a valid JWT on every request — nothing is open to the public internet unauthenticated. What's simplified is the login *form*: there's a real `/login` page and route, but it only has a "Login" button — no email/password fields. Tapping it calls a small routine that logs into (or, on first run, silently registers) one shared **demo account** and stores its token, then routes to `/dashboard`.

This means everyone using this deployment currently shares one identity ("demo"). If you want real per-user accounts back, you have two clean options:
1. Add email/password fields to `LoginComponent` and call the same `/api/auth/login/` and `/api/auth/register/` endpoints (already implemented and tested) — no backend change needed.
2. Or, if you'd rather have a genuinely public, no-auth API instead, remove `IsAuthenticated` from `REST_FRAMEWORK.DEFAULT_PERMISSION_CLASSES` in `backend-django/config/settings.py` and drop the token handling from the Angular services, plus the route guard — ask and I can do this variant instead.

## Project Structure

```
CodeAlpha_ProjectManagementTool/
├── backend-django/
│   ├── config/            # settings, urls, asgi (Channels routing), wsgi
│   ├── accounts/           # register/login/me (JWT)
│   ├── projects/           # Project, Task, Comment models + views + websocket consumer
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
└── frontend-angular/
    ├── src/app/
    │   ├── models/          # TypeScript interfaces
    │   ├── services/        # api.service, auth.service, websocket.service
    │   ├── interceptors/     # JWT auth interceptor
    │   ├── guards/           # authGuard (protects /dashboard)
    │   ├── pipes/            # task-filter pipe (board columns)
    │   ├── components/
    │   │   ├── login/        # /login — single button, no fields
    │   │   ├── dashboard/     # /dashboard — sidebar + board + modals
    │   │   ├── sidebar/, board/, task-card/, toast/
    │   │   └── modals/ (new-project, add-member, new-task, task-detail)
    │   ├── app.routes.ts     # route table
    │   └── app.component.ts  # root shell — just a <router-outlet>
    ├── src/environments/environment.ts
    └── package.json
```

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

Make sure the backend is running first. The app opens on `/login`; tapping **Login** establishes the (silent, demo) session and routes you to `/dashboard`. If your backend runs somewhere other than `http://localhost:8000`, edit `frontend-angular/src/environments/environment.ts`.

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

## Submission Checklist (per CodeAlpha instructions)

- [ ] Push this folder to GitHub as a repo named `CodeAlpha_ProjectManagementTool`
- [ ] Record a short video walkthrough and post it on LinkedIn tagging @CodeAlpha, with the GitHub link
- [ ] Submit via the official Submission Form shared in your WhatsApp group
