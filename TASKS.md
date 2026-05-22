# Parking Management MVP — Tasks & Technical Plan

## Quick Summary
This document expands the roadmap into concrete tasks, a suggested folder structure, mock JSON database schema, UI architecture, and a component breakdown ready for implementation.

---

## Tasks (high level)
- Project setup: Next.js 14 + TypeScript + Tailwind + shadcn/ui — 0.5 day
- Mock backend: build in-memory services and JSON fixtures — 1 day
- Auth UI + flows: signup, login, session handling — 1 day
- Reservation flows: create, edit, cancel, view — 2 days
- Waitlist system: join/leave, auto-promotion simulation — 1 day
- Employee dashboard: reservations, check-in/out UI — 1 day
- Admin dashboard: manage slots, users, and fixtures — 1 day
- QA & polish: accessibility, responsive fixes — 1 day

## Task Breakdown (detailed)
- Setup
  - Initialize Next.js app with `app/` router and TypeScript
  - Install Tailwind CSS and configure with Next.js
  - Install `shadcn/ui` and generate base components
  - Create global layout and theme tokens
- Mock API
  - Implement a `mock/` folder with JSON fixtures for users, slots, reservations
  - Implement `services/mockApi.ts` exposing endpoints: `/api/auth/*`, `/api/reservations/*`, `/api/slots/*`, `/api/waitlist/*`, `/api/admin/*` (these are client-side wrappers)
  - Provide an in-memory store and optional `mock/seed.json` to rehydrate state
- Auth
  - Pages: `/auth/signup`, `/auth/login`
  - Simulate password hashing via a simple obfuscation (client-only)
  - Store sessions in `localStorage` and AuthContext
- Reservations
  - UI: search available slots, pick date/time, confirm reservation
  - Business rules: slot capacity, overlapping reservations prevented
- Waitlist
  - When no slots available for requested window, allow user to join waitlist
  - Auto-promotion: simulated cron (timer) that promotes first waitlist entry if slot freed
- Employee Dashboard
  - View today's reservations, filter by status, mark check-in/out
  - Quick actions: cancel, reassign slot (simulated)
- Admin Dashboard
  - Manage parking layout: add/remove slots, set slot attributes
  - Manage users: list/mock edit users, disable mock accounts

---

## Suggested Folder Structure

c:\Users\ivan_\OneDrive\Desktop\parking-app\
- app/
  - layout.tsx
  - page.tsx (landing)
  - auth/
    - login/page.tsx
    - signup/page.tsx
  - dashboard/
    - employee/page.tsx
    - admin/page.tsx
  - reservations/
    - page.tsx
    - [id]/page.tsx
- components/
  - auth/
    - LoginForm.tsx
    - SignupForm.tsx
  - reservations/
    - ReservationForm.tsx
    - ReservationList.tsx
  - slots/
    - SlotMap.tsx
    - SlotCard.tsx
  - dashboards/
    - EmployeeDashboard.tsx
    - AdminDashboard.tsx
  - ui/ (shadcn-based design system wrappers)
- lib/
  - auth.ts (Auth context & helpers)
  - date.ts (date helpers for reservations)
  - validators.ts
- services/
  - mockApi.ts (fetch-like wrappers calling in-memory store)
  - store.ts (in-memory data store + persistence helpers)
  - seed.ts (initial JSON fixtures loader)
- mock/
  - seed.json
  - users.json
  - slots.json
  - reservations.json
- styles/
  - globals.css
- public/
  - images/
- package.json
  - tsconfig.json
  - tailwind.config.js

Notes: Keep `services/` and `mock/` clearly separated—`mock/` holds fixtures, `services/` contains runtime store and API wrappers.

---

## Mock JSON Database Schema Proposal

General constraints:
- Use simple numeric `id` or `uuid` strings
- Timestamps in ISO 8601 strings
- Minimal normalized references (store `userId`, `slotId` on related objects)

1) users.json
```
[
  {
    "id": "u_1",
    "name": "Alice Employee",
    "email": "alice@example.com",
    "password": "pwd-obf-...",
    "role": "employee", // "user" | "employee" | "admin"
    "disabled": false
  }
]
```

2) sessions (in-memory / persisted to localStorage)
```
{
  "sessionId": "s_1",
  "userId": "u_1",
  "issuedAt": "2026-05-21T10:00:00.000Z",
  "expiresAt": "2026-05-21T18:00:00.000Z"
}
```

3) slots.json
```
[
  {
    "id": "slot_1",
    "label": "A1",
    "zone": "A",
    "type": "regular", // regular|compact|ev
    "status": "active" // active|disabled
  }
]
```

4) reservations.json
```
[
  {
    "id": "r_1",
    "userId": "u_2",
    "slotId": "slot_1",
    "startsAt": "2026-06-01T08:00:00.000Z",
    "endsAt": "2026-06-01T12:00:00.000Z",
    "status": "confirmed", // confirmed|cancelled|completed
    "createdAt": "2026-05-21T12:00:00.000Z"
  }
]
```

5) waitlist.json
```
[
  {
    "id": "w_1",
    "userId": "u_3",
    "requestedStartsAt": "2026-06-01T08:00:00.000Z",
    "requestedEndsAt": "2026-06-01T12:00:00.000Z",
    "slotType": "regular",
    "createdAt": "2026-05-21T12:05:00.000Z"
  }
]
```

6) admin-notes.json (optional)
```
[
  { "id": "n_1", "authorId": "u_1", "text": "Adjusted slot A1 capacity", "createdAt": "..." }
]
```

Persistence model:
- On startup, `seed.json` loads into `store.ts`.
- During runtime, `store.ts` keeps an in-memory snapshot.
- For minimal persistence across reloads, `store.ts` can serialize runtime state to `localStorage` under a single key (e.g., `parking_app_store_v1`).

---

## UI Architecture (pages & flows)

- Public
  - Landing: app root, feature overview
  - Auth: `/auth/login`, `/auth/signup`
- App (authenticated)
  - Reservations: search/create/manage
  - Employee Dashboard: `/dashboard/employee` (shift view, today list)
  - Admin Dashboard: `/dashboard/admin` (slot management, user mock data)

Routing & Guarding
- Use an `AuthProvider` + React Context to expose `user` and `session`.
- Route guard wrapper component `ProtectedRoute` to redirect to `/auth/login` if not authenticated.

Visual system
- Base design via `shadcn/ui` primitives and tokens.
- Tailwind utility classes with a small design token file for colors/spacing.

UX Notes
- Keep flows linear and minimal: booking should be 3 steps or fewer.
- Show clear messaging when user joins waitlist and when auto-promotion occurs.

---

## Component Breakdown (recommended)

- Layout
  - `Header` (app title, user menu, logout)
  - `Footer`
  - `Sidebar` (dashboard nav)
- Auth
  - `LoginForm` (email/password)
  - `SignupForm` (name, email, password, role opt)
  - `AuthProvider` (context, session helpers)
- Reservations
  - `ReservationForm` (select slot/date/time)
  - `AvailabilityCalendar` (visualize availability)
  - `ReservationList` (user reservations)
  - `ReservationCard` (details + actions)
- Slots
  - `SlotCard` (slot summary)
  - `SlotMap` (optional grid view)
- Waitlist
  - `WaitlistForm` (join/leave)
  - `WaitlistList` (position display)
- Dashboards
  - `EmployeeDashboard` (today's list + actions)
  - `AdminDashboard` (manage slots/users + fixture import)
- Common
  - `Modal` (confirmation)
  - `Toast` (notifications)
  - `Table` / `List` components

Each component should be composed of shadcn/ui primitives where practical, and receive typed props. Keep state minimal inside components and push shared state into Context or services.

---

## Mock API Architecture (pattern)

- Expose a single client-side `services/mockApi.ts` with functions mirroring real endpoints, e.g.:
  - `auth.signup(payload)`
  - `auth.login(payload)`
  - `reservations.list(filters)`
  - `reservations.create(payload)`
  - `waitlist.join(payload)`
  - `admin.updateSlot(slotId, patch)`
- Internally `mockApi` uses `store.ts` to mutate in-memory data and returns Promise-wrapped responses to simulate network latency.
- Add an optional `mockLatency(ms)` to simulate delays.

---

## Next Steps (when coding starts)
1. Bootstrap Next.js project and commit initial repo skeleton.
2. Implement `services/store.ts` with seed loading and persistence.
3. Implement `AuthProvider` + mock auth endpoints.
4. Build reservation/create flows and proof UI with mock data.

---

If you want, I can now scaffold the repository files and implement `services/mockApi.ts` and `store.ts` next — or we can refine any part of this plan first.
