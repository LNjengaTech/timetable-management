# ClassFlow Project Implementation Phases Report

This document outlines the detailed development phases of the **ClassFlow** Timetable and Attendance Management System. It serves as a comprehensive log of the features implemented, the dependencies added, and the key files created or modified during each phase.

---

## Phase 1: Foundation & Infrastructure Setup

**Objective**: Establish the core Next.js project structure, configure the PostgreSQL database with Prisma ORM, and set up the foundation for Role-Based Access Control (RBAC) authentication using NextAuth.js.

### Installed Dependencies
- `next`, `react`, `react-dom` (Core Framework)
- `tailwindcss`, `postcss`, `autoprefixer` (Styling)
- `lucide-react` (Icons)
- `framer-motion` (Animations)
- `clsx`, `tailwind-merge` (Utility classes for Tailwind)
- `@prisma/client`, `prisma` (ORM and Database schema management)
- `next-auth`, `bcryptjs` (Authentication and Password Hashing)
- `@auth/prisma-adapter` (NextAuth Prisma Integration)

### Features Implemented
1. **Next.js Project Initialization**: Configured a modern Next.js 14 App Router project with TypeScript and a dark-mode-first Tailwind CSS design system.
2. **Database Containerization**: Set up a local Docker container for PostgreSQL.
3. **Prisma ORM Modeling**: Created the initial `User`, `Account`, `Session`, and `Timetable` models.
4. **Authentication & RBAC**: Implemented login and registration systems with Credentials and Google OAuth. Extended JWT tokens to include a custom `Role` enum (`ADMIN`, `LECTURER`, `STUDENT`, `GUEST`).
5. **Dashboard Layout**: Built a protected dashboard layout with dynamic sidebar navigation based on the user's role.

### Key Files Created/Modified
- `docker-compose.yml`: Local PostgreSQL container configuration.
- `prisma/schema.prisma`: Database schema definitions.
- `lib/prisma.ts`: Singleton Prisma client instantiation.
- `lib/auth.ts`: NextAuth configuration, credential validation, and JWT callbacks.
- `middleware.ts`: Next.js middleware protecting `/dashboard` and role-specific routes.
- `app/api/auth/register/route.ts`: API endpoint for hashing passwords and creating new users.
- `app/auth/login/page.tsx` & `app/auth/register/page.tsx`: Animated authentication UI forms.
- `app/dashboard/layout.tsx`: The main authenticated layout containing the navigation sidebar.


### Database Setup with docker:

Since I am using Docker for the PostgreSQL database, running the application locally is a two-part process: booting up the database container, and starting the Next.js development server.

**Step 1:** Start the PostgreSQL Database

```bash
cd /home/lonnex/Desktop/projectsDir/Timetable/project

sudo docker compose up -d
```
*This command reads our docker-compose.yml file, downloads the PostgreSQL image if you don't have it, and starts it up running on port 5432.*

Verify it's running by typing `sudo docker ps`. You should see postgres:15-alpine listed.

**Step 2:** Push the Database Schema
To actually create the tables (Users, Timetables, etc.) inside the created Database, instruct Prisma to push our schema.

```bash
npx prisma db push
```
*This command connects to the running Docker database via the DATABASE_URL in your .env file and creates all our tables.*

(Optional) can also run npx prisma studio to open a visual database browser on http://localhost:5555.

**Step 3:** Start the Next.js Application
Now that the database is running and the tables exist, we can start the web app.

```bash
npm run dev
```
---


## Phase 2: Core Features (Timetables, Calendar & Attendance)

**Objective**: Develop the primary business logic for managing timetable slots, providing an interactive calendar view, and enabling automated QR-code based attendance tracking.

### Installed Dependencies
- `react-hook-form`, `@hookform/resolvers`, `zod` (Form validation and state management)
- `react-big-calendar`, `date-fns` (Interactive Calendar rendering and date parsing)
- `qrcode` (QR Code generation for attendance)
- `react-confetti`, `react-use` (UI feedback animations)

### Features Implemented
1. **Timetable Management API**: Developed secure API routes (`POST`, `GET`) with Zod validation to allow Admins and Lecturers to create and fetch timetable slots, including basic conflict detection logic.
2. **Interactive Calendar**: Integrated `react-big-calendar` to visually render the fetched timetable slots bridging Server Components and Client Components.
3. **QR Code Attendance System**: 
   - Created a dynamic view for each timetable slot where Lecturers generate a unique QR code.
   - Built a `/check-in` route that students scan to securely mark their attendance.
4. **Notification Polling Service**: Built a background polling mechanism in the browser that checks for classes starting within the next 30 minutes and triggers native OS browser notifications.

### Key Files Created/Modified
- `prisma/schema.prisma`: Added the `Attendance` model linking `User` and `Timetable`.
- `app/api/timetables/route.ts`: API handling slot creation and retrieval.
- `app/dashboard/timetables/new/page.tsx`: Form UI for creating a new slot using `react-hook-form`.
- `app/dashboard/calendar/page.tsx` & `components/CalendarClient.tsx`: Wrapper and interactive rendering logic for the Big Calendar.
- `app/dashboard/timetables/[id]/page.tsx` & `.../TimetableViewClient.tsx`: Dynamic page generating QR codes for lecturers and showing a "Mark Attendance" button for students.
- `app/api/attendance/mark/route.ts`: API endpoint validating and recording student attendance check-ins.
- `components/NotificationService.tsx` & `app/api/notifications/route.ts`: Headless client component and API endpoint responsible for polling upcoming classes and firing notifications.

---

## Phase 3: Enhancements (Gamification, Analytics & Admin Tools)

**Objective**: Elevate the user experience by adding student engagement tracking (streaks/points), comprehensive data visualization, resource sharing, and full user metadata management tools.

### Installed Dependencies
- `chart.js`, `react-chartjs-2` (Data Visualization)

### Features Implemented
1. **Student Gamification**: Introduced a `UserStats` model. Modifying the attendance API to automatically calculate streaks and award points using a Prisma transactional query. Added a visual progress widget to the student dashboard.
2. **Chart.js Analytics**: Built an Admin/Lecturer reporting dashboard displaying total system metrics and a bar chart analyzing attendance rates segmented by subjects.
3. **Homework & Notes**: Allowed Lecturers to attach text-based homework assignments directly to a specific Timetable slot.
4. **Public UUID Sharing**: Created a generic, unprotected route (`/shared/[uuid]`) allowing users to copy a link to their clipboard and share read-only views of the timetable schedule and homework notes with unregistered guests.
5. **Admin Portal**: Developed an exclusive portal for `ADMIN` users to review the entire user base, elevate or demote roles via dropdowns, and permanently delete accounts.

### Key Files Created/Modified
- `prisma/schema.prisma`: Added `UserStats` and `Homework` models.
- `app/api/attendance/mark/route.ts`: Wrapped the creation logic in a `$transaction` to safely update streaks and points simultaneously.
- `components/GamificationWidget.tsx`: The UI component displaying levels, streaks (with Flame icons), and partial progress bars.
- `app/api/analytics/route.ts` & `app/dashboard/analytics/AnalyticsDashboardClient.tsx`: Endpoint aggregating attendance by subject and the React component plotting the data via Chart.js.
- `app/api/homework/route.ts`: Endpoint for lecturers to append tasks to a slot.
- `app/shared/[uuid]/page.tsx`: The public, read-only landing page for shared timetable views.
- `app/api/admin/users/route.ts` & `app/dashboard/admin/AdminUsersClient.tsx`: Full CRUD API and frontend table interface for Admin user management.

---

## Next Steps: Phase 4 (Polish & Security)
The core infrastructure, features, and enhancements are complete. The upcoming final phase will focus on:
- Wrapping the application in strict Route protection ensuring unauthorized roles are bounced appropriately.
- Adding comprehensive loading skeletons via Next.js `loading.tsx` conventions.
- Finalizing responsive design tweaks and Framer Motion micro-interactions across the board.
- Writing Jest or Playwright tests for critical user flows (e.g., student check-in).
