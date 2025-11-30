# Authentication Flow Guide

This guide explains how the new NestJS auth service and the React demo client work together, plus a few ready-to-run Thunder Client / cURL snippets for manual verification.

## Overview

- Passwords and refresh tokens use Argon2 hashing before persisting to the `users` table (`hashedRefreshToken` column).
- Access + refresh tokens are issued as JWTs. Access tokens default to 15 minutes, refresh tokens to 7 days.
- Both tokens are written to the browser as HTTP-only cookies (`access_token`, `refresh_token`) making them inaccessible to JavaScript.
- Refresh-token rotation happens every login/register/refresh so that stolen tokens cannot be replayed indefinitely.
- Role metadata (e.g., `ADMIN`, `MANAGER`, `COORDINATOR`) is embedded into the JWT payload and consumed by `RolesGuard` for firm/store-scoped APIs.

## Environment Quick Reference

```
PORT=3000
FRONTEND_URL="http://localhost:5173"
COOKIE_DOMAIN=localhost
JWT_ACCESS_SECRET="local_access_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="local_refresh_secret"
JWT_REFRESH_EXPIRES_IN="7d"
```

Adjust `FRONTEND_URL` (comma-separated) if you are testing from a different origin. Cookies respect `SameSite=Lax` locally; set `NODE_ENV=production` + `COOKIE_DOMAIN` in production to switch them to `SameSite=None; Secure`.

## Manual Testing (Thunder Client or cURL)

### Register

```
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Growth Lead","email":"growth@example.com","password":"ChangeMe123!"}' \
  -c cookies.txt
```

The response body contains `{ message, user }` while cookies land in `cookies.txt` (or the Thunder Client cookie jar).

### Login

```
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"growth@example.com","password":"ChangeMe123!"}' \
  -c cookies.txt -b cookies.txt
```

### Refresh

```
curl -X POST http://localhost:3000/auth/refresh \
  -c cookies.txt -b cookies.txt
```

### Authenticated profile

```
curl http://localhost:3000/auth/me -b cookies.txt
```

### Logout

```
curl -X POST http://localhost:3000/auth/logout -b cookies.txt
```

## React Demo Client

- `pnpm --filter @influencer-crm/frontend dev` serves the UI on port 5173.
- React Query mutations call the backend with `withCredentials: true`, so cookies flow automatically.
- The `AuthProvider` hydrates user state via `/auth/me`, exposes `logout`, and guards `/dashboard` with `<ProtectedRoute />`.
- Form validation is handled via React Hook Form + Zod; any API errors are shown inline with Tailwind-styled alerts.

## Troubleshooting Tips

| Symptom | How to fix |
| ------- | ---------- |
| `401 Unauthorized` on `/auth/me` | Ensure `access_token` cookie exists. Re-login to mint a new pair. |
| Refresh endpoint returns 401 | Confirm the `refresh_token` cookie is sent (`curl -b cookies.txt ...`). Tokens rotate each request, so stale cookies are invalidated. |
| CORS or cookie not set | Verify `FRONTEND_URL` includes the origin you are calling from and that you are using HTTPS + `NODE_ENV=production` if testing on a secure origin. |
| Prisma errors on register | Make sure the referenced `firmId` exists or omit it. The service assigns the default `COORDINATOR` role automatically. |

This flow is covered by Jest unit tests (`AuthService` + `RolesGuard`), so you can extend it confidently when wiring the rest of the CRM endpoints.
