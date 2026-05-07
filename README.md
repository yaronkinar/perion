# Perion

A production-quality permission-based UI management system.

- **Frontend:** Vue 3 + TypeScript + Vite + Pinia + Vue Router + Tailwind + Storybook 8 + Playwright
- **Backend:** NestJS + TypeORM + PostgreSQL + Jest
- **Auth:** Session-based (cookie) "pick a user" demo flow + bonus JWT email/password endpoint
- **Containerization:** Docker Compose for app + tests
- **CI:** GitHub Actions running the same containers used locally

[![ci](https://github.com/yaronkinar/perion/actions/workflows/ci.yml/badge.svg)](https://github.com/yaronkinar/perion/actions/workflows/ci.yml)

Repo: <https://github.com/yaronkinar/perion>

## Quick start

```bash
docker compose up --build
```

Optionally copy `.env.example` to `.env` and tweak values before starting:

```bash
cp .env.example .env
```

If your Docker installation uses the legacy command form, this is equivalent:

```bash
docker-compose up --build
```

### Submission quick verify (2-3 min)

```bash
# boot app
docker compose up --build
# (legacy equivalent)
# docker-compose up --build

# unit tests
cd backend && npm test
cd ../frontend && npm test

# e2e
cd ../frontend && npm run e2e
```

- App: http://localhost:3000
- API: http://localhost:4000/api
- Postgres: localhost:5432 (perion / secret / perion_rbac)

The backend seeds the database on first boot. This stack runs the **production-style build** (Nginx serving the built Vite bundle, Nest from compiled JS) — for the assignment's `docker compose up` deliverable.

By default, this stack also runs the backend with `NODE_ENV=production` (via `BACKEND_NODE_ENV`) while keeping assignment-required simple auth enabled:

- `GET /api/auth/users` is available for the login picker
- `POST /api/auth/select` is available for role selection login

If you specifically want a non-production runtime in this stack, run:

```bash
BACKEND_NODE_ENV=development docker compose up --build
```

### Local development with Docker (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Same URLs (`:3000` / `:4000`), same seeded data. Differences vs. the prod-like stack:

- Backend runs `nest start --watch`. Editing any file under `backend/src` triggers a recompile + restart in ~1–2s.
- Frontend runs the Vite dev server with HMR. Edits in `frontend/src` reflect instantly without a full reload (or a fast page reload for non-component modules).
- `frontend/vite.config.ts` proxies `/api/*` to `http://backend:4000` (via the `VITE_API_TARGET` env var) so the browser only ever talks to `localhost:3000`.
- Source is bind-mounted from the host; `node_modules` lives in an anonymous volume inside the container, so you don't need a local `npm install`.
- Polling-based watching is enabled (`CHOKIDAR_USEPOLLING`, `WATCHPACK_POLLING`, and TypeScript `watchOptions`) so file events are reliable on Windows / WSL / macOS bind mounts.

To stop and clean up:

```bash
docker compose -f docker-compose.dev.yml down
```

Add `-v` to also drop the dev Postgres volume (`perion_postgres_dev_data`) and re-seed on the next boot.

## Test credentials

| Name        | Email             | Role   | Password (for `POST /api/auth/login`) |
| ----------- | ----------------- | ------ | ------------------------------------- |
| Admin User  | admin@test.com    | Admin  | `Password123!`                        |
| Editor User | editor@test.com   | Editor | `Password123!`                        |
| Viewer User | viewer@test.com   | Viewer | `Password123!`                        |

Passwords are stored as bcrypt hashes (see [seed.service.ts](backend/src/seed/seed.service.ts)). The session-based "pick a user" demo flow requires no password and remains available in this assignment implementation (including `NODE_ENV=production`).

The login screen exposes both flows side-by-side via tabs:

- **Demo user** — pick a seeded user from the dropdown (no password).
- **Email & password** — sign in with the seeded credentials above against `POST /api/auth/login`. The login also seeds the session, so existing protected routes work without separate JWT integration. The JWT itself is returned in the response and as an httpOnly cookie (`perion.jwt`) for clients that want a Bearer token.

## Local development (no Docker)

Two terminals.

```bash
# 1. Postgres
docker compose up postgres
```

```bash
# 2. Backend
cd backend
npm install
DATABASE_URL=postgresql://perion:secret@localhost:5432/perion_rbac \
SESSION_SECRET=dev-session-secret-needs-32-chars-minimum \
JWT_SECRET=dev-jwt-secret-also-needs-32-chars-minimum \
CORS_ORIGIN=http://localhost:3000 \
npm run start:dev
```

```bash
# 3. Frontend
cd frontend
npm install
npm run dev
```

Vite dev server is on http://localhost:3000 and proxies `/api` to the backend.

### Storybook

```bash
cd frontend
npm run storybook
```

Storybook runs at http://localhost:6006.

### Required environment variables

| Var               | Description                                          | Required where        |
| ----------------- | ---------------------------------------------------- | --------------------- |
| `DATABASE_URL`    | Postgres connection string                           | always                |
| `SESSION_SECRET`  | Secret for `express-session` cookie signing         | always; ≥32 chars in prod |
| `JWT_SECRET`      | HMAC secret for JWT signing                          | always; ≥32 chars in prod |
| `CORS_ORIGIN`     | Allowed CORS origin (the frontend URL)               | optional (defaults `http://localhost:3000`) |
| `JWT_TTL`         | JWT lifetime, e.g. `1h`, `30m`                       | optional (default `1h`) |
| `AUTH_LOGIN_THROTTLE_LIMIT` | Max login attempts per throttle window      | optional (default `5`) |
| `AUTH_LOGIN_THROTTLE_TTL_SECONDS` | Login throttle window in seconds       | optional (default `60`) |
| `NODE_ENV`        | `production` enables trust-proxy behavior; demo pick-a-user stays on | optional (`development` in local Node) |
| `COOKIE_SECURE`   | `true` / `false` — session/JWT `Secure` flag (default: on when `NODE_ENV=production`) | optional; compose sets `false` for HTTP localhost |
| `PORT`            | Backend port                                         | optional (default 4000) |

In production (`NODE_ENV=production`):
- TypeORM `synchronize` is **off** (use migrations).
- Session and JWT cookies use `Secure: true` by default (**HTTPS only**). Set `COOKIE_SECURE=false` only for deliberate HTTP deployments (see `docker-compose.yml`).
- Assignment-required simple-auth endpoints (`GET /api/auth/users`, `POST /api/auth/select`) remain available for demo/evaluation flows.
- Both secrets are validated for minimum length at boot.

## Permission model

Seven permissions: `view_users`, `create_user`, `edit_user`, `delete_user`, `view_roles`, `edit_roles`, `change_role`.

Roles:

- **Admin** — all 7 permissions
- **Editor** — `view_users`, `edit_user`, `view_roles`, `change_role`
- **Viewer** — `view_users` only (the `role` field is stripped from `/api/users` for Viewer)

UI behavior is driven by `<PermissionGuard action="..." mode="hide|disable">` on top of `usePermission().can(...)`.

Route-level enforcement: routes can declare `meta.requireAny: PermissionAction[]` and the router redirects to `/forbidden` if the session has none of them.

## Architecture decisions

- **Form validation: VeeValidate + Zod (frontend), class-validator (backend).** Frontend forms (`AddUserModal`, `EditUserModal`) use [`useForm` + `toTypedSchema(zodSchema)`](frontend/src/components/users/AddUserModal/useAddUserModal.ts), with schemas declared in [`frontend/src/schemas/user.schema.ts`](frontend/src/schemas/user.schema.ts). Backend keeps `class-validator` because it's NestJS-idiomatic and `HttpExceptionFilter` already surfaces its arrays as `errors[]` over the wire. The frontend's `extractFieldErrors` helper maps that array onto VeeValidate's `setFieldError`, so server-side rules (e.g. `Email already in use`) light up the same red-text UI as client-side rules. If we ever need a single source of truth, the Zod schemas can be lifted into a shared workspace and consumed on the backend via `nestjs-zod` without rewriting the rules.
- **Permission source of truth.** Backend owns canonical permission names (`backend/src/permissions/entities/permission.entity.ts`) and role mappings (`PERMISSIONS_BY_ROLE`). Frontend consumes permission names from API payloads and treats `PermissionAction` as a string type to avoid FE/BE code coupling.
- **Session = snapshot.** On login the user's permissions are snapshotted into the session cookie. `PermissionsGuard` reads from the session, which is fast and avoids a per-request DB hit. If a role's permissions change while a user is logged in, existing requests keep using the old snapshot until the session is refreshed (`GET /api/auth/me`) or the user logs in again.
- **Default-deny guard.** `PermissionsGuard` requires `@RequirePermission(...)` metadata on every guarded handler. A handler with no metadata throws `Forbidden`, so adding a route without thinking about permissions can never silently pass.
- **Unified envelope.** A global `TransformInterceptor` wraps successful responses as `{ data, message, statusCode }`; a global `HttpExceptionFilter` does the same for errors and additionally surfaces `class-validator` arrays as `errors: string[]` for per-field UI mapping. Unknown errors are logged server-side and masked as a generic 500 (no message leak).
- **204 stays 204.** The interceptor short-circuits empty bodies on `DELETE` so we don't violate HTTP semantics.
- **Frontend permission UX.** `<PermissionGuard mode="hide">` removes a slot; `mode="disable"` clones the slot vnode with `disabled: true` (works for leaf components like buttons). Route-level guards send unauthorized users to `/forbidden`; unknown URLs go to a real `/not-found`.

## API surface

### Core (required by the assignment)

| Method | Path                  | Permission     | Notes                                        |
| ------ | --------------------- | -------------- | -------------------------------------------- |
| GET    | `/api/users`          | `view_users`   | Viewer payload omits the `role` field        |
| POST   | `/api/users`          | `create_user`  |                                              |
| PUT    | `/api/users/:id`      | `edit_user`    |                                              |
| DELETE | `/api/users/:id`      | `delete_user`  | 204                                          |
| GET    | `/api/roles`          | `view_roles`   | Returns roles + permissions                  |
| PUT    | `/api/roles/:id`      | `edit_roles`   | Replaces the role's permission set           |
| GET    | `/api/auth/me`        | session        |                                              |
| POST   | `/api/auth/select`    | none           | Body `{ userId }`, sets session cookie       |
| POST   | `/api/auth/logout`    | none           | Clears session + JWT cookie                  |
| GET    | `/api/auth/users`     | none           | Public list used by the login screen         |

Example payloads (wrapped by `{ data, message, statusCode }`):

`GET /api/auth/me`:

```json
{
  "data": {
    "id": "u-123",
    "name": "Admin User",
    "email": "admin@test.com",
    "roleName": "Admin",
    "permissions": ["view_users", "create_user", "edit_user", "delete_user", "view_roles", "edit_roles", "change_role"]
  }
}
```

`GET /api/users` (Viewer session example - reduced payload):

```json
{
  "data": [
    { "id": "u-1", "name": "Admin User", "email": "admin@test.com", "status": "active" },
    { "id": "u-2", "name": "Editor User", "email": "editor@test.com", "status": "active" }
  ]
}
```

`GET /api/roles`:

```json
{
  "data": [
    {
      "id": "r-admin",
      "name": "Admin",
      "permissions": [{ "id": "p-view-users", "name": "view_users" }]
    }
  ]
}
```

### Bonus (JWT)

| Method | Path                | Body                       | Notes                                                   |
| ------ | ------------------- | -------------------------- | ------------------------------------------------------- |
| POST   | `/api/auth/login`   | `{ email, password }`      | Returns `{ token, user }`; sets `perion.jwt` httpOnly cookie |

A successful `POST /api/auth/login` returns the JWT, sets the `perion.jwt` httpOnly cookie, **and** seeds `req.session.user` so the existing session-cookie-based guards (PermissionsGuard, `/auth/me`) recognize the authenticated user. In this assignment implementation, session remains the primary authorization path; JWT is provided as an optional bonus output for Bearer-token clients.

Every response is wrapped as `{ data, message, statusCode }` (with optional `errors[]` on validation failures) by the `TransformInterceptor` and `HttpExceptionFilter`.

## Security notes

- `POST /api/auth/login` is throttled (default: 5 attempts / 60 seconds per client key) via `@nestjs/throttler`.
- Sessions currently use `express-session` MemoryStore, which is fine for local/demo usage but not for internet-exposed production deployments.
- `docker-compose.yml` uses local/dev defaults and placeholder-style secrets for assignment convenience.
- For internet-exposed production systems, use a persistent session store, rotate secrets via env management, and add layered controls (WAF/IP reputation, suspicious activity monitoring, and lockout/backoff policy).

## Tests

| Layer    | Tool       | Files                                                                |
| -------- | ---------- | -------------------------------------------------------------------- |
| Backend  | Jest       | `backend/test/*.spec.ts` — UsersService, RolesService, PermissionsGuard, AuthService.login, HttpExceptionFilter |
| Frontend | Vitest     | `frontend/src/**/*.test.ts` — base UI, PermissionGuard, UsersTable, BaseModal a11y |
| E2E      | Playwright | `frontend/e2e/auth.spec.ts`, `frontend/e2e/permissions.spec.ts`        |

### Run tests in Docker (no host Node required)

```bash
# unit tests (backend Jest + frontend Vitest), parallel
docker compose -f docker-compose.test.yml --profile unit up --build --abort-on-container-exit

# end-to-end (Postgres + backend + frontend + Playwright in containers)
docker compose -f docker-compose.test.yml --profile e2e up --build --abort-on-container-exit --exit-code-from e2e

# everything
docker compose -f docker-compose.test.yml --profile unit --profile e2e up --build --abort-on-container-exit --exit-code-from e2e
```

The same compose file is used by [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Linting/formatting notes

- This repo includes a root `biome.json` with Nest-friendly decorator parsing enabled (`unsafeParameterDecoratorsEnabled`).
- Run checks from repo root:
  - `npm run lint:biome`
  - `npm run format:biome`

### View Playwright HTML report on GitHub

Every CI run uploads a `playwright-report` artifact (even on success).

1. Open [Actions](https://github.com/yaronkinar/perion/actions).
2. Click a `ci` workflow run.
3. Scroll to **Artifacts** and download `playwright-report`.
4. Extract it and open `playwright-report/index.html` in your browser.

On pushes to `main`, CI also deploys the report to GitHub Pages (job: `deploy e2e report (github pages)`).

- Pages URL: <https://yaronkinar.github.io/perion/>
- In the run summary, open the `deploy e2e report (github pages)` job for the exact deployed URL.

### Run tests on the host

```bash
# backend
cd backend && npm test

# frontend
cd frontend && npm test

# Playwright (needs the app + backend running locally)
cd frontend && npm run e2e
```

### Test reports (backend + frontend)

```bash
# backend: JSON test report
cd backend
npm test -- --json --outputFile=./test-report.json

# backend: coverage report (text + HTML)
npm run test:cov
# opens at backend/coverage/lcov-report/index.html

# frontend: JSON test report
cd ../frontend
npm test -- --reporter=json --outputFile=./test-report.json
```

Report artifacts:
- `backend/test-report.json`
- `backend/coverage/lcov-report/index.html`
- `frontend/test-report.json`

## Project layout

```
backend/                 NestJS API: auth, users, roles, permissions, seed
frontend/                Vue 3 SPA: pages, composables, stores, services, router
.github/workflows/ci.yml CI: backend + frontend + e2e via docker-compose.test.yml
docker-compose.yml       Production-style local run (db + backend + frontend)
docker-compose.test.yml  Test profiles: unit + e2e
```
