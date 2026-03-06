# ClassFlow: AI-Powered Academic Management System

ClassFlow is a modern, platform designed to streamline student schedules through AI and encourage consistency through gamification. This project leverages cutting-edge technologies like Google Gemini, OCR.space, and Cloudinary to automate the "administrative overhead" of being a student.

---

## 🌟 Core Features

### 🤖 AI Timetable Extraction
- **Multi-Modal Data Ingestion**: Upload XLSX spreadsheets, native PDFs, or even photos of physical university timetables.
- **Smart Parsing**: Uses OCR.space to read text from images/scanned documents.
- **AI Structuring**: Uses Google Gemini 2.5 Flash to intelligently extract subjects, locations, and timings from unstructured text.

### 🎮 Behavioral Gamification
- **Attendance Streaks**: Encourages regular attendance through daily streaks.
- **Punctuality Rewards**: Earn bonus points for marking attendance within the class start window.
- **Badges & Perfection**: Unlock achievements for consistent weekly perfection and points milestones.

### 📝 Smart Notes Management
- **Subject-Linked Notes**: PDF notes are automatically organized by their respective timetable subjects.
- **Cloud Storage**: Secure, high-speed storage of PDF materials via Cloudinary integration.
- **Social Learning**: Mark notes as "Public" to share them with other students studying the same subject.

### 🛡️ Secure Access Control
- **Role-Based Permissions**: Distinct interfaces for Admins, Lecturers, Students, and Guests.
- **NextAuth Integration**: Secure sessions with JWT and Bcrypt password hashing.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI/ML**: [Google Gemini AI](https://aistudio.google.com/) & [OCR.space](https://ocr.space/)
- **File Storage**: [Cloudinary](https://cloudinary.com/)
- **Styling**: Tailwind CSS 4 & Framer Motion (for animations)

---

## 🚦 Getting Started

### 📋 Prerequisites

Before you begin, ensure you have the following installed. If you don't have them, follow the links to install:

1.  **Git**: For version control.
    *   [Download and Install Git if you don't have it](https://git-scm.com/downloads)
    *   *Check version:* `git --version`

2.  **Node.js (18.x or later)**: The JavaScript runtime that powers the app.
    *   [Download Node.js](https://nodejs.org/)
    *   *Check version:* `node -v`

3.  **Docker & Docker Compose**: Used to run the PostgreSQL database easily.
    *   [Install Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
    *   [Install Docker Engine](https://docs.docker.com/engine/install/) (Linux)
    *   *Check version:* `docker --version`

4.  **PostgreSQL** You do not need to install it in this project if you have Docker installed. If you prefer not to use Docker, you'll need a local PostgreSQL instance.

---

### ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LNjengaTech/timetable-management
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   If you have Docker installed, you can start the database using:
   ```bash
   docker-compose up -d
   ```
   *Note: This will start a PostgreSQL container in the background.*

4. **Environment Variables Setup**
   Create a `.env` file in the root directory and add your variables (refer to `.env.example` or the list below):
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # AI APIs
   GEMINI_API_KEY="your-gemini-api-key"
   OCR_SPACE_API_KEY="your-ocr-space-api-key"

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
   ```

4. **Database Initialization**
   Run the Prisma migration to set up your database schema:
   ```bash
   npx prisma migrate dev --name init
   # or simply
   npx prisma generate
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

- `app/api`: Server-side API routes for AI parsing, attendance, and notes.
- `app/auth`: Login and registration page logic.
- `app/dashboard`: Interactive user dashboards and analytics.
- `components`: Reusable UI components (buttons, cards, grids).
- `lib`: Core utility functions (Cloudinary integration, Auth options, AI logic).
- `prisma`: Database schema definition and migrations.

---

## 📝 License
This project is proprietary. Please check with the project owner for licensing details.
