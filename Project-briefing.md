

## SECTION 1: Project Overview and Goals
**Description:** ClassFlow automates timetable creation, attendance tracking, and motivation to reduce absenteeism in Kenya (targeting 15-20% improvement). It's web-first, responsive, secure, and user-friendly with beautiful UI (e.g., animations, dark mode). Users: Guests (view-only), Students (personal tools), Lecturers (group management), Admins (full control).

**Key Goals:**
- Beautiful UI: Clean, themed (dark/light), animated (e.g., confetti on attendance mark).
- Interactivity: Drag-drop, real-time updates (polling initially).
- Responsiveness: Mobile-first (Tailwind breakpoints).
- Security: JWT auth, input validation, RBAC enforcement.
- Code Separation: MVC-like (components for UI, services for logic, API routes for backend).
- Reliability: Error handling, logging, 80% test coverage.

**Non-Functional Specs:** Load times <2s, handle 500 users, accessibility (ARIA), scalability hooks.
**Action Item:** Review this section. If unclear, seek clarification.


## SECTION 2: Features Breakdown
Implement features in priority order: Core first, then enhancements. Each feature includes user flow, edge cases, and RBAC. Use descriptive variable names and comments in code.

**Core Feature 1: User Authentication & RBAC**
- Description: Email/password signup/login + Google OAuth. Roles: Guest, Student, Lecturer, Admin. JWT sessions.
- User Flow: Register → Email verify → Login → Role-based dashboard.
- Edge Cases: Reset password, token expiry, unauthorized access (403 errors).
- RBAC: Middleware in API routes (e.g., only Admins access user management).
- Implementation Notes: Use next-auth; store roles in DB.
- Action Item: Build auth pages and middleware. Test with multiple roles. If RBAC logic is unclear, seek clarification.

**Core Feature 2: Timetable Creation & Management**
- Description: Form entry (day/time/subject/location/lecturer) or PDF upload (pdf.js parsing).
- User Flow: Dashboard → New Timetable → Fill form/drag slots → Save → Detect conflicts.
- Edge Cases: Invalid inputs (Zod validation), multi-week schedules.
- RBAC: Students own; Lecturers group.
- Action Item: Create forms and API CRUD. If parsing logic needs details, seek clarification.

**Core Feature 3: Interactive Calendar View**
- Description: Weekly/monthly view with drag-drop, filters, tooltips.
- User Flow: Select timetable → Render (color-coded) → Edit via drag.
- Edge Cases: Overlaps (alerts), timezones (EAT).
- RBAC: Shared for groups.
- Action Item: Integrate react-big-calendar. Test interactivity.

**Core Feature 4: Attendance Marking**
- Description: one-tap button confirms attendance / QR scan for check-in.
- User Flow: Event → Mark → Confetti.
- Edge Cases: Late marks, camera permission denied.
- RBAC: Self for Students; class for Lecturers.
- Action Item: QR lib integration; browser camera API.

**Core Feature 5: Notifications & Reminders**
- Description: Browser alerts/email/SMS (Twilio later).
- User Flow: Set prefs → Timer triggers.
- Edge Cases: No permission (fallback).
- RBAC: All.
- Action Item: Notification API; cron-like in services.

**Enhancement Feature 6: Gamification & Encouragement**
- Description: Streaks, badges, points for themes.
- User Flow: Mark → Update streak → Unlock.
- Edge Cases: Resets.
- RBAC: Personal.
- Action Item: Logic in services; UI components.

**Enhancement Feature 7: Analytics Dashboard**
- Description: Charts, heatmaps, exports.
- User Flow: Insights → Filter → Export.
- Edge Cases: Empty data.
- RBAC: Own/aggregates.
- Action Item: Chart.js.

**Enhancement Feature 8: Collaboration & Sharing**
- Description: Links, forums.
- User Flow: Share → Import.
- Edge Cases: Expiry.
- RBAC: Moderation.
- Action Item: UUID links.

**Enhancement Feature 9: Homework & Notes**
- Description: Add to events, due reminders.
- User Flow: Event → Note → Save.
- Edge Cases: Overdue.
- RBAC: All.
- Action Item: Rich text.

**Enhancement Feature 10: Admin Tools**
- Description: User CRUD, logs, bulk import.
- User Flow: Admin dash → Edit.
- Edge Cases: Errors.
- RBAC: Admin-only.
- Action Item: Dedicated pages.


## SECTION 3: Tech Stack and Libraries
- Frontend: Next.js 14+, React 18, Tailwind 3, TypeScript 5.
- Backend: Next.js API Routes, Prisma 5 for PostgreSQL.
- Database: Local PostgreSQL 15 (Docker); schema: users, timetables, etc.
- Libraries: (Install as specified) next-auth (auth), react-big-calendar (calendar), qrcode (QR), chart.js (analytics), framer-motion (animations), zod (validation), jest/cypress (testing).
- Folder Structure: app (pages/api), components, services, lib, prisma, tests.
- Action Item: Set up project with npx create-next-app. If any lib purpose is unclear, seek clarification.


## SECTION 4: Development Plan (Phased Implementation)
Follow this phased plan strictly. Complete one phase before next; test at end of each.

- Phase 1: Setup (Days 1-5): Init project, DB setup (Docker Postgres, Prisma schema/migrate), auth with RBAC. Milestone: Login works.
- Phase 2: Core Features (Days 6-10): Timetable, calendar, attendance, notifications. Milestone: Mark event.
- Phase 3: Enhancements (Days 11-15): Gamification, analytics, collaboration, homework, admin. Milestone: Earn badge/share.
- Phase 4: Polish (Days 16-20): UI (themes/animations), responsiveness, interactivity. Milestone: Mobile test passes.
- Phase 5: Security/Testing (Days 21-30): Validation, RBAC, 80% coverage (Jest/Cypress). Milestone: All tests green.
- Phase 6: Docs/Prep (Days 31-35): README, migration script to Supabase. Milestone: Deploy-ready.
- Action Item: Track with comments/checklists in code. If timeline or dependencies unclear, seek clarification.

## SECTION 5: Best Practices and Safeguards

- Security: HTTPS, bcrypt, JWT (1h expiry), error boundaries.
- Testing: Unit (components), integration (API), E2E (flows).
- UI: Mobile-first, ARIA, loading states.
- Code: JSDoc comments, linting (ESLint).
- If any part (e.g., edge case handling) is unclear, seek clarification. Do not proceed with assumptions. Output progress reports per phase.
