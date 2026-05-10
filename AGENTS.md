# Perion RBAC

## Cursor Cloud specific instructions

### Services overview

| Service | Port | How to run |
|---|---|---|
| PostgreSQL 16 | 5432 | `docker compose up -d postgres` (from repo root) |
| NestJS Backend | 4000 | `cd backend && DATABASE_URL=postgresql://perion:secret@localhost:5432/perion_rbac SESSION_SECRET=dev-session-secret-needs-32-chars-minimum JWT_SECRET=dev-jwt-secret-also-needs-32-chars-minimum CORS_ORIGIN=http://localhost:3000 npm run start:dev` |
| Vue 3 Frontend (Vite) | 3000 | `cd frontend && npm run dev` |

### Startup order

1. Start PostgreSQL first and wait for it to be healthy (`docker compose ps` should show `(healthy)`).
2. Start the backend — it will auto-seed roles, permissions, and test users on first boot.
3. Start the frontend — Vite proxies `/api` requests to `http://localhost:4000`.

### Gotchas

- Docker must be running before starting PostgreSQL. In Cloud Agent VMs, Docker requires `fuse-overlayfs` storage driver and `iptables-legacy`. The daemon socket may need `sudo chmod 666 /var/run/docker.sock` after starting `dockerd`.
- The backend **requires** `DATABASE_URL`, `SESSION_SECRET`, and `JWT_SECRET` env vars. Without them it will crash on startup.
- The demo "pick a user" login flow is only available when `NODE_ENV !== 'production'` (the default in dev is `development`).
- Test credentials are in the README. Key accounts: `admin@test.com` / `Password123!` (Admin), `editor@test.com` / `Password123!` (Editor), `viewer@test.com` / `Password123!` (Viewer).

### Standard commands

See `README.md` for full details. Quick reference:

- **Lint**: `cd backend && npm run lint` / `cd frontend && npm run lint`
- **Test**: `cd backend && npm test` / `cd frontend && npm test`
- **Build**: `cd backend && npm run build` / `cd frontend && npm run build`
- **E2E**: `cd frontend && npm run e2e` (requires full stack running)
- **Storybook**: `cd frontend && npm run storybook` (port 6006)
