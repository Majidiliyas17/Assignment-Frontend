# My Project — SecureFiles (Full-Stack File Storage & Sharing App)

## Introduction

I built a full-stack web application called **SecureFiles** — a secure, private file storage and sharing platform. Users can register, log in, upload files, manage them, and share them through revocable public links. It's split into two parts: a **Next.js frontend** (`Frontend` folder) and an **Express + TypeScript backend** (`Backend` folder). The frontend is deployed on **Netlify** at `securefileassignment.netlify.app`, and the backend API runs at `api.aspslai.com/api`.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3.4 (class-based dark mode), TanStack Query 5 for server state, Zustand 5 for UI state, React Hook Form + Zod for forms, Axios, Sonner toasts, Lucide icons.
- **Backend:** Node.js, Express 4, TypeScript strict, TypeORM, PostgreSQL on **Neon**, **Cloudinary** for storage, JWT for auth, bcryptjs (12 rounds), Zod validation, helmet + cors + rate-limit, pino logging, Jest + Supertest (53 tests).

## Backend Architecture

Clean layering: **Route → Controller → Service → Repository → Database**. Controllers are thin; business logic lives in services.

- **Auth:** On register/login, password is bcrypt-hashed and a JWT with only the user id is issued. `AuthMiddleware` verifies the `Bearer` token on every protected route.
- **Database:** `users` (id, name, email, password_hash) and `files` (owner_id, original_name, cloudinary_public_id, mime_type, extension, size, visibility, share_token, status). Files are **private by default**.
- **Upload flow:** The server never buffers large payloads. Client calls `POST /files/upload-signature`, the server signs one-time Cloudinary upload params (API secret never leaves the server), the **browser uploads directly to Cloudinary** with progress events, then `POST /files/complete` verifies the asset (size ±5%) and creates the DB row. Files ≥10MB use chunked uploads, so 100MB+ works smoothly.
- **Sharing:** `POST /files/:id/share` generates a crypto-random 64-char token and makes the file public. Anyone can open `/share/<token>` with **no login** to view and download. Setting it back to private revokes the link instantly.
- **Security:** Ownership checks return `404` (not 403), so other users' files are never revealed. Rate limiting blocks brute force. One response envelope: `{ success, message, data }`.

## Frontend Architecture

The frontend **never talks to the backend directly from the browser**. Two layers:

1. **API route handlers (`src/app/api`)** act as the browser-facing gateway. `/api/auth/login`, `/register`, `/logout` set/clear an **`httpOnly` cookie** `sfs_token`, so the JWT is never accessible to JavaScript.
2. **A catch-all reverse proxy** (`/api/[...path]`) forwards every other request to `BACKEND_URL`, injecting the cookie as a Bearer token server-side, and passes binary responses + `Content-Disposition` through unchanged, so downloads keep their **original file names**.

### Key features

- **Auth pages** with React Hook Form + Zod, and route guarding in `middleware.ts` (unauthenticated → `/login?next=...`).
- **Files page:** pagination (10/page), client-side search, visibility filter, and global stats (total/public files, storage) across **all pages**.
- **Upload dialog:** drag & drop, per-file progress, max 500MB, allowlist of ~16 safe extensions (`jpg png pdf doc xlsx pptx zip mp4`).
- **File actions:** rename, delete with confirmation, detail drawer with image preview, one-click share links.
- **Command palette** via `Ctrl/Cmd + K`, **light/dark theme** with no-flash persistence.
- **Data layer:** TanStack Query with optimistic updates — mutations update cached pages instantly and roll back on error. Client state via Zustand.

## Configuration & Deployment

**Frontend** (`.env.local`): just `BACKEND_URL=https://api.aspslai.com/api` and `NEXT_PUBLIC_APP_NAME=SecureFiles`. `BACKEND_URL` is read only server-side. Scripts: `dev`, `build`, `start`, `lint` (I type-check with `npx tsc --noEmit`).

**Backend** (`.env`): `NODE_ENV`, `PORT=4000`, `DATABASE_URL` (Neon Postgres + SSL), `JWT_SECRET`, `JWT_EXPIRES_IN=1d`, Cloudinary keys, `MAX_FILE_SIZE_MB=500`, `CORS_ORIGIN`, `APP_BASE_URL`. Scripts: `dev` (tsx watch), `build`, `start`, migrations, `test` (Jest).

**Deployment:** Backend on `api.aspslai.com` behind nginx (`trust proxy` set), frontend on **Netlify** (`securefileassignment.netlify.app`), backend via Dockerfile + PM2.

## Lessons

- Never run `next dev` and `next build` at the same time — they share `.next` and corrupt the cache.
- httpOnly cookie + server-side proxy keeps the token out of JavaScript.
- Direct-to-Cloudinary uploads solve the "100MB+ file times out" problem.
- All secrets live in `.env` files that are gitignored.

Overall, this project covered the full cycle: REST API design, ORM database modeling, JWT/bcrypt auth, large uploads via signed cloud storage, a polished UI, and production deployment.
