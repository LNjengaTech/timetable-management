Final Year Project: Timetable & Academic Management System (Technical Brief)
This project is a sophisticated Academic Management Platform designed to streamline student schedules through AI and encourage consistency through gamification.

1. Project Overview & Vision
The platform addresses the manual overhead of managing academic schedules. It leverages AI to automate timetable entry and uses "behavioral design" (gamification) to improve attendance and student engagement.

Tech Stack:

Frontend: 
Next.js
 (App Router), React 19, Tailwind CSS 4, Framer Motion.
Backend: Next.js Server Actions & API Routes.
Database: PostgreSQL with 
Prisma ORM
.
Authentication: 
NextAuth.js
 with JWT and Bcrypt encryption.
Artificial Intelligence: Google Gemini 2.5 Flash & OCR.space API.
Storage: Cloudinary (for PDF academic notes).
2. System Architecture
The application follows a Monolithic Next.js Architecture, where the frontend and API are co-located.

Client-Side: Uses React "Use Client" components for interactive UI (Dashboard, Charts, Timetable Grid).
Server-Side: Handles secure database interactions, AI processing, and file uploads.
Middleware: 
middleware.ts
 acts as a security gatekeeper, ensuring Lecturers, Students, and Admins can only access their respective areas.
3. Core Features: Detailed "Ins and Outs"
🛡️ Authentication & Authorization
Roles: Admin, Lecturer, Student, Guest.
Security: Passwords are never stored in plain text; they are hashed using Bcrypt.
Session Management: Uses JSON Web Tokens (JWT) for stateless, secure session tracking.
Input Sanitization: Emails are normalized (trimmed and lowercased) during login to prevent duplication and spoofing.
🤖 AI Timetable Extraction Pipeline
This is a standout technical feature. It handles three types of files:

Direct Data (XLSX/CSV): Uses xlsx to parse spreadsheets directly into CSV strings.
Native PDF: Extracts text layers using pdf-parse.
Scanned PDF/Images: If no text is found, it uses the OCR.space API (Engine 2) to "read" the image.
AI Structuring: The raw text is sent to Google Gemini 2.5 Flash with a precise prompt to return a structured JSON array of class slots.
🎮 Attendance & Gamification System
Designed to reward positive student behavior:

Punctuality Bonus: +5 points for marking attendance within 5 minutes of class start.
Streak Logic: Tracks consecutive days of attendance. If a day is missed, the streak resets.
Perfect Week: A "Perfect Week" (+50 pts) is achieved if a student attends all scheduled classes by Friday.
Badges: Awarded dynamically (e.g., StreaK 7, 100 Points) and stored in the UserStats table.
📝 Notes & Cloudinary Integration
Storage: Academic notes (PDFs) are uploaded to Cloudinary via a direct stream buffer.
Logic: Notes are tied to specific timetable slots.
Social Learning: Users can mark notes as Public. If another user shares the same subject, they can see and download public notes shared by peers.
4. Database Schema (The "Backbone")
The system uses a relational PostgreSQL database:

User: Core user data and relationship to roles.
Timetable: Stores subject, time, location, day, and lecturer name.
Attendance: A many-to-many junction table between User and Timetable with a date timestamp.
UserStats: Central hub for points, streaks, and badge IDs.
Note: Stores the Cloudinary fileUrl and privacy settings.
5. Potential Exam Questions & Answers for the Presentation
Q: How do you handle conflicts in the timetable? A: The system performs a "Pre-save Check" in the API. If a slot already exists for that user on the same day, time, and location, it returns a 409 Conflict error.

Q: Why use Gemini AI instead of regular code to parse the files? A: University timetables are often messy or inconsistently formatted. LLMs excel at understanding "unstructured data" and extracting the relevant class info regardless of the layout.

Q: How is the "Public Notes" feature handled securely? A: The API only returns notes that are either owned by the user OR marked isPublic: true and match the subject string of a course in the user's own timetable.

Q: How do you ensure the streaks are accurate? A: We use a lastAttendance timestamp. When marking today's attendance, we calculate the difference in days. If it's exactly 1 day, the streak increments; if >1, it resets