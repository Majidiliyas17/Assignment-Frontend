# SecureFiles — Frontend

A secure, private file storage and sharing web application. This is the **frontend** (Next.js) part of the SecureFiles project. It pairs with the Express/PostgreSQL/Cloudinary backend in `../Backend`.

Users can register, log in, upload files (client-side upload straight to Cloudinary using signed parameters from the backend), browse/search/filter their files, share them via revocable public links, and download them under their original names — all inside a polished, responsive, light/dark themed UI.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [How it works (architecture)](#how-it-works-architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Routing](#routing)
- [Data & API flow](#data--api-flow)
- [Upload & download flow](#upload--download-flow)
- [Theming](#theming)
- [State management](#state-management)
- [Operational notes](#operational-notes)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, React Server Components + Client Components) |
| UI library | [React 19](https://react.dev) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) (class-based dark mode), custom design tokens |
| Server state | [TanStack Query 5](https://tanstack.com/query) (queries, mutations, optimistic updates) |
| Client state | [Zustand 5](https://github.com/pmndrs/zustand) |
| Forms | [React Hook Form 7](https://react-hook-form.com) + [Zod 3](https://zod.dev) (`@hookform/resolvers`) |
| HTTP | [Axios 1](https://axios-http.com) (browser client) |
| Toasts | [Sonner](https://sonner.emilkowal.ski) |
| Icons | [Lucide React](https://lucide.dev) |
| Fonts | Inter (via `next/font/google`) |

---

## Features

**Authentication**
- Register / login / logout with a JWT stored in an **`httpOnly` cookie** (`sfs_token`) — never exposed to JavaScript.
- Middleware-level route guarding; unauthenticated visitors are redirected to `/login?next=…`.
- Automatic session expiry handling on 401 responses (redirects to login).

**File management**
- Upload multiple files with drag & drop, per-file progress bars, queueing, and rejection of unsupported/dangerous file types.
- Files are **private by default**.
- List files with **pagination** (10 per page), client-side **search** (name, extension, type) and **visibility filter** (All / Private / Public).
- Global stats cards: total files, public files, and total storage used — computed across **all pages**, not just the current one.
- Rename, delete (with confirmation), and view details in a slide-in drawer (image preview included).
- Download files as an attachment using the **original file name** (streamed through the backend — see [Upload & download flow](#upload--download-flow)).

**Sharing**
- One click makes a file public and creates a revocable share link (`/s/<token>`).
- Public share page (no login required) with metadata and a direct download button.
- Making a file private revokes its share link.

**UX**
- Responsive layout (mobile sidebar drawer, collapsible desktop sidebar).
- **Light/dark theme** toggle with localStorage persistence, system-preference fallback, and a no-flash inline init script.
- Command palette (keyboard-first quick actions) — open with `Ctrl/Cmd + K`.
- Skeletons, empty states, error states, toast notifications, reduced-motion support.
- Accessible components (labels, `aria` attributes, focus-visible rings).

---

## How it works (architecture)

The frontend never talks to the backend directly from the browser. There are two indirection layers:

1. **Next.js API canvas (`src/app/api`)** — acts as the browser-facing gateway.
   - `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` set/clear the `sfs_token` cookie.
   - `/api/[...path]` is a catch-all **reverse proxy**: every other request (`/api/files/*`, `/api/share/*`, …) is forwarded to the backend at `BACKEND_URL`, injecting the cookie value as a `Bearer` token. Non-JSON (binary) responses, including the `Content-Disposition` header, are passed through untouched so downloads work.
2. **Backend API** (`https://api.aspslai.com/api`) — owns auth, file metadata, storage, and sharing. See the Backend README.

```
Browser ──► /api/** (Next.js route handlers / proxy) ──► BACKEND_URL ──► Express + Postgres + Cloudinary
```

Because the `sfs_token` cookie is `httpOnly` and the proxy attaches credentials on the server side, the client-side JWT is never accessible to JavaScript.

---

## Project structure

```
src/
├── middleware.ts                 # Route guard (redirects to /login when unauthenticated)
├── app/
│   ├── layout.tsx                # Root layout: font, theme bootstrap script, Providers
│   ├── globals.css               # Design tokens (:root + .dark), base styles, animations
│   ├── providers.tsx             # TanStack QueryClientProvider + Sonner Toaster (theme-aware)
│   ├── page.tsx                  # Landing page
│   ├── loading.tsx               # Suspense fallback
│   ├── not-found.tsx             # 404 page
│   ├── icon.svg
│   ├── (auth)/
│   │   ├── layout.tsx            # Auth split-screen layout (marketing panel + form + theme toggle)
│   │   └── login/page.tsx, register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # AppShell + UploadDialog + CommandPalette
│   │   ├── files/page.tsx        # Main files manager page
│   │   └── settings/page.tsx     # Account settings (name / password / logout)
│   ├── s/[shareToken]/page.tsx   # Public share page (server component, no auth)
│   └── api/                      # Auth route handlers + catch-all proxy
│       ├── auth/{login,logout,register}/route.ts
│       └── [...path]/route.ts
├── components/
│   ├── ui/                        # Design-system primitives (Button, Card, Modal, Input,
│   │                              #   DropdownMenu, ConfirmDialog, Badge, Skeleton, Spinner,
│   │                              #   EmptyState, FileTypeIcon, index.ts re-exports)
│   ├── auth/                      # LoginForm, RegisterForm (RHF + Zod)
│   ├── files/                     # FilesTable, FilesToolbar, PaginationBar, UploadDialog,
│   │                              #   RenameDialog, ShareDialog, FileDetailDrawer
│   ├── layout/                    # AppShell, Sidebar, Topbar, UserMenu, ThemeToggle, CommandPalette
│   └── share/                     # PublicFileView, ShareNotFound
├── hooks/
│   ├── useAuth.ts                 # useLogin / useRegister / useMe / useLogout
│   ├── useFiles.ts                # useFiles, useFileStats + mutations (rename/remove/visibility/share)
│   └── useUpload.ts               # Upload mutation (signature → Cloudinary → complete)
├── lib/
│   ├── http.ts                    # Axios instance + 401 interceptor + error extraction
│   ├── files-api.ts               # Typed client for /files endpoints
│   ├── backend.ts                 # Server-only API helper (for public share metadata)
│   ├── upload.ts                  # Direct-to-Cloudinary XHR upload with progress
│   ├── download.ts                # Blob-download fallback helper
│   ├── format.ts                  # formatBytes, dates, upload validation rules & limits
│   └── utils.ts                   # cn() classname helper
├── stores/
│   ├── ui.ts                      # Global UI state (upload dialog, command palette)
│   └── theme.ts                   # Theme store (light/dark, non-flash)
└── types/
    └── api.ts                     # Shared API type definitions
```

---

## Getting started

### Prerequisites

- Node.js **18+** (developed on 22)
- The live **backend** at `https://api.aspslai.com/api`
- (Backend requires a PostgreSQL/Neon database and Cloudinary config)

### Install & run

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see "Environment variables")
#    Create/edit .env.local

# 3. Start the dev server
npm run dev
# open http://localhost:3000
```

Production build + start:

```bash
npm run build
npm start
```

> **Important:** do **not** run `npm run build` while a dev server (`npm run dev`) is active on the same project — both write to `.next` and the shared cache gets corrupted (you'll see errors like `Cannot find module './…js'` or a bare 500). Always stop the dev server before building.

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `https://api.aspslai.com/api` | Base URL of the backend API (used by API routes, the catch-all proxy, and server-side helpers). |
| `NEXT_PUBLIC_APP_NAME` | `SecureFiles` | Public-facing app/brand name. |

`BACKEND_URL` is read **only on the server** — client bundles never contain it, and the browser only ever talks to `/api/*` on this origin.

---

## Available scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Start the dev server with hot reload. |
| `build` | `next build` | Create an optimized production build. |
| `start` | `next start` | Serve the production build. |
| `lint` | `next lint` | Lint the project. (`next lint` is deprecated in Next 15 — prefer `npx tsc --noEmit` for type-checking.) |

---

## Routing

| Route | Access | Description |
|---|---|---|
| `/` | public | Landing page. |
| `/login` | public | Sign in. |
| `/register` | public | Create an account. |
| `/files` | protected | File manager (list, search, filter, actions). |
| `/settings` | protected | Account overview (profile info), backend health status, logout. |
| `/s/[shareToken]` | public | Public share page for a shared file. |
| `/api/auth/login` | public | Logs in and sets the `sfs_token` cookie. |
| `/api/auth/register` | public | Registers and sets the cookie. |
| `/api/auth/logout` | public | Clears the cookie. |
| `/api/[...path]` | proxy | Forwards everything else to the backend. |

Route protection is enforced in `src/middleware.ts` via the `sfs_token` cookie (public prefixes: `/login`, `/register`, `/s/`, `/api/`).

---

## Data & API flow

**TanStack Query** is the data layer. Defaults configured in `providers.tsx`: `staleTime: 30s`, `refetchOnWindowFocus: false`, `retry: 1`.

- `useFiles(page, limit)` — fetches `{ files, pagination }` for a page. Query key: `['files', page, limit]` with `placeholderData: keepPreviousData` for smooth pagination.
- `useFileStats()` — fetches **all** files (batch of 100 per request, capped at 100 pages) and derives total count, public count, and total size across every page. Query key: `['file-stats']`, `staleTime: 60s`.
- Mutations (`useRemoveFile`, `useSetVisibility`, `useRenameFile`, `useCreateShare`, `useRevokeShare`) all use **optimistic updates** across every cached page (`patchAllPages`) with snapshot/rollback on error. Count-affecting mutations invalidate both `['files']` and `['file-stats']`.
- Uploads (`useUpload`) invalidate `['files']` and `['file-stats']` on success.

Client requests go through the Axios instance in `lib/http.ts` (`baseURL: '/api'`, `withCredentials: true`). A response interceptor detects `401` and redirects to `/login`.

---

## Upload & download flow

**Upload** (`hooks/useUpload.ts` + `lib/upload.ts`):
1. `POST /files/upload-signature` → backend returns a one-time signed Cloudinary upload signature.
2. The **browser uploads directly to Cloudinary** over XHR with progress events (no file bytes touch the backend).
3. `POST /files/complete` → backend verifies the asset on Cloudinary and records the file.
4. Queries are invalidated so the list + stats refresh.

**Download** (backend streams bytes — no CORS / URL-opening issues):
1. The UI triggers a hidden anchor: `href="/api/files/<id>/download"` (+ `download=file.originalName`).
2. The proxy forwards to the backend, which fetches the asset from Cloudinary and streams it back with `Content-Disposition: attachment` and the **original file name**.
3. The proxy passes the binary body and headers through unchanged, so the browser saves the file under its original name.

The public share button downloads via `GET /api/share/<token>/download` (no auth) through the same mechanism.

---

## Theming

- **Tokens:** `src/app/globals.css` defines light (`:root`) and dark (`.dark`) CSS custom properties — semantic tokens (`--primary`, `--card`, `--text`, `--border`, `--sidebar-*`, …) plus raw `-rgb` triplets for the Tailwind zinc/indigo/violet/emerald/amber/red/sky/blue scales.
- **Tailwind:** `darkMode: 'class'`; color scales are mapped to `rgb(var(--x-rgb) / <alpha-value>)` so opacity modifiers keep working.
- **Store:** `stores/theme.ts` (Zustand) persists the choice to `localStorage['securefiles-theme']` and falls back to `prefers-color-scheme`.
- **No flash:** `layout.tsx` injects a tiny inline `THEME_INIT` script that applies the saved/system theme to `<html>` before paint; the root also carries `suppressHydrationWarning`.
- The sidebar/topbar chrome stays dark in both themes by design; surfaces/cards/content swap.

---

## State management

- **Server state:** TanStack Query (see [Data & API flow](#data--api-flow)).
- **Client/UI state:** `stores/ui.ts` (upload dialog open state, command palette open state), `stores/theme.ts`.

---

## Operational notes

- The dev server and production build **share `.next`** — don't run them at the same time (see [Getting started](#getting-started)).
- `next lint` is deprecated in this Next version; use `npm run build` or `npx tsc --noEmit` to validate.
- Upload rules live in `lib/format.ts`: max **500 MB** per file, allowlist of ~16 extensions (`jpg jpeg png webp pdf doc docx xls xlsx ppt pptx txt csv zip mp4`), and a deny-list of dangerous executable/script types.
- The `.gitignore` excludes `.next`, `node_modules`, and local env files. Secrets are never committed.
- Backend must be reachable at `BACKEND_URL` for auth, files, sharing, uploads, and downloads to function.
```
