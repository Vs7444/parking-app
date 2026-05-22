# Parking Management MVP — Project Roadmap

## Overview

Goal: Deliver a Minimum Viable Product (MVP) for a parking-management web app built with Next.js 14, Tailwind CSS, and shadcn/ui. Backend is fully mocked (in-memory or local JSON). Includes simulated authentication, employee and admin dashboards, reservation & waitlist flows.

## Phases & Timeline (suggested)
- Phase 0 — Setup (1 day)
  - Initialize Next.js 14 project with TypeScript
  - Add Tailwind CSS and shadcn/ui
  - Create basic layout and theme
- Phase 1 — Mock API & Auth (2 days)
  - Implement mock API layer (in-memory + JSON fixtures)
  - Add simulated auth endpoints: signup, login, logout, session
  - Session persistence via localStorage
- Phase 2 — Core features (3–4 days)
  - Parking slots model and UI
  - Reservation flows (create, view, cancel)
  - Waitlist flow with notifications (UI-level)
  - Employee dashboard for daily operations
- Phase 3 — Admin features & polish (2 days)
  - Admin dashboard: manage parking layout, view reservations, manage users
  - Reporting views (simple counts / lists)
- Phase 4 — QA & Delivery (1–2 days)
  - Manual testing of flows, cross-browser checks
  - Small accessibility checks, responsive fixes

Total estimated: 9–11 workdays (MVP)

## Milestones
- M1: Project skeleton + UI library integrated
- M2: Mock API + simulated auth working end-to-end
- M3: Reservation & waitlist flows implemented
- M4: Employee dashboard usable
- M5: Admin dashboard and final polish

## Acceptance Criteria (MVP)
- Users can sign up, log in, and maintain a simulated session.
- Employees can view and manage reservations.
- Users can create reservations and enter a waitlist when full.
- Admin can view/manage slots and users via mock endpoints.
- All data persists either in-memory during runtime or via local JSON/localStorage between reloads (explicit behavior documented).

## Non-goals
- No real authentication providers, no real DB, no production-grade security.
- No external payments or integrations.

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui components
- Mock backend: Client-side mock API layer (fetch wrappers) + optional JSON fixtures under `/mock/`
- State: local component state + React Context for auth/session + simple in-memory services

## Testing Strategy
- Manual scenario testing for all flows
- Lightweight unit tests for core utilities (optional)

## Deliverables
- Source files (Next.js app skeleton)
- PROJECT_ROADMAP.md and TASKS.md (this and next)
- README with run instructions (created later at implementation)
