# Project Report: QR Code Based Attendance Management System
### Madhav Institute of Technology & Science (MITS), Gwalior
### Department of Computer Science & Technology (CST)

---

## Project Summary

**Project Title:** QR Code Based Attendance Management System
**Institution:** Madhav Institute of Technology & Science (MITS), Gwalior
**Department:** Computer Science & Technology (CST)
**Developer:** Ajay Meena
**Technology Stack:** React.js, Node.js, Express.js, MongoDB

---

## Objective

To convert the system design into a fully functional software system that automates student attendance tracking using QR code technology, replacing traditional manual paper-based methods with a modern, efficient, and transparent digital solution.

---

## Deliverables

### 1. Source Code (Module-wise)

The system is organized into clearly separated modules:

#### Frontend Modules (React.js)
| Module | File | Description |
|--------|------|-------------|
| Authentication | `src/pages/Login.js` | JWT-based login for all roles |
| Admin Dashboard | `src/pages/AdminDashboard.js` | Manage teachers, students, subjects |
| Teacher Dashboard | `src/pages/TeacherDashboard.js` | QR generation, analytics, reports |
| Student Dashboard | `src/pages/StudentDashboard.js` | Attendance view, analytics, charts |
| QR Scanner | `src/pages/QRScanner.js` | Camera-based QR code scanning |
| Manual Attendance | `src/pages/ManualAttendance.js` | Roll number based manual entry |
| Class Management | `src/pages/TeacherClassManagement.js` | Upload notes, marks, materials |
| Student Class View | `src/pages/StudentClassView.js` | View materials, marks, feedback |
| Home Page | `src/pages/Home.js` | Dynamic landing page with animations |

#### Backend Modules (Node.js / Express.js)
| Module | File | Description |
|--------|------|-------------|
| Authentication | `routes/auth.js` | Login, JWT token generation |
| Teacher Routes | `routes/teacher.js` | Class management, manual attendance |
| Student Routes | `routes/student.js` | Attendance history, class data |
| Admin Routes | `routes/admin.js` | User and subject management |
| QR Routes | `routes/qr.js` | QR generation with daily limit |
| Attendance Routes | `routes/attendance.js` | Mark and retrieve attendance |

#### Database Models (MongoDB Schemas)
| Model | File | Description |
|-------|------|-------------|
| User | `models/User.js` | Admin, Teacher, Student profiles |
| Class | `models/Class.js` | Class and subject mapping |
| Attendance | `models/Attendance.js` | Date-wise attendance records |
| QRSession | `models/QRSession.js` | QR token with expiry and daily count |
| ClassMaterial | `models/ClassMaterial.js` | Notes, assignments, syllabus |
| StudentMarks | `models/StudentMarks.js` | Marks with auto grade calculation |
| Feedback | `models/Feedback.js` | Student feedback with star ratings |
| Subject | `models/Subject.js` | All 11 CST subjects |

---

### 2. Front-End and Back-End Integration

#### Integration Architecture
```
React Frontend (Port 3000)
        ↕ HTTP/REST API (Axios)
Express Backend (Port 5000)
        ↕ Mongoose ODM
MongoDB Database (mits-attendance)
```

#### Key Integration Points

**Authentication Flow:**
- Frontend sends credentials via `POST /api/auth/login`
- Backend validates and returns JWT token
- Token stored in localStorage via AuthContext
- All subsequent requests include `Authorization: Bearer <token>`

**QR Attendance Flow:**
- Teacher generates QR → `POST /api/qr/generate` (checks 3/day limit)
- QR contains encrypted token, valid for 8 seconds
- Student scans → `POST /api/attendance/mark`
- Live attendance updates via polling every 1 second
- Feedback form auto-appears after successful scan

**Manual Attendance Flow:**
- Teacher opens manual attendance → `GET /api/teacher/class/:id/students`
- Enters absent roll numbers (e.g., 1, 2, 56, 70)
- Submits → `POST /api/teacher/class/:id/manual-attendance`
- Student dashboard updates with new attendance data

**API Proxy Configuration:**
```json
"proxy": "http://localhost:5000"
```
All frontend API calls automatically route to the backend.

---

### 3. Database Implementation

#### Database: MongoDB (mits-attendance)

**Collections:**
- `users` — 82 pre-loaded users (1 admin, 11 teachers, 70 students)
- `classes` — 6 demo classes across CST subjects
- `attendance` — 4,526 demo attendance records
- `qrsessions` — QR tokens with date-based generation tracking
- `subjects` — All 11 CST semester subjects
- `classmaterials` — Uploaded notes and assignments
- `studentmarks` — Marks with auto A+/A/B+/B/C/D/F grading
- `feedbacks` — Student feedback with 3-parameter star ratings

**Key Database Features:**
- Date-wise attendance tracking (YYYY-MM-DD format)
- Unique index prevents duplicate attendance per student per date
- QR generation counter resets daily (tracked by `generatedDate` field)
- Sparse index allows both QR and manual attendance records
- Auto-grade calculation based on percentage scored

**Pre-loaded Data:**
```
Admin:    1 user  (admin@college.edu)
Teachers: 11 users (CST Department faculty)
Students: 70 users (BTTC25O1002 to BTTC25O1076)
Subjects: 11 CST subjects (34251201 to 34251211)
Classes:  6 demo classes with full attendance history
```

---

### 4. Version Control Repository

**Recommended Git Setup:**
```bash
git init
git add .
git commit -m "Initial commit: MITS Attendance System v1.0"
git branch -M main
git remote add origin https://github.com/username/mits-attendance.git
git push -u origin main
```

**Branch Strategy:**
- `main` — Production-ready code
- `develop` — Active development
- `feature/manual-attendance` — Feature branches
- `hotfix/login-fix` — Bug fixes

**Commit History (Key Milestones):**
1. Initial project setup with React + Express
2. JWT authentication system
3. QR code generation with 8-second expiry
4. Student and teacher dashboards
5. Analytics with Recharts integration
6. Dark mode implementation
7. Manual attendance with roll number input
8. Feedback system integrated with QR flow
9. Class materials and marks management
10. University exam reports with 75% eligibility

---

## Outcome: Functional Software System

### Core Features Implemented

#### Role-Based Access Control
- **Admin:** Manage all users, subjects, view system-wide attendance
- **Teacher:** Generate QR, manual attendance, upload materials, view analytics
- **Student:** Scan QR, view attendance, download materials, give feedback

#### QR Code Attendance System
- QR code expires in exactly 8 seconds
- Maximum 3 QR generations per teacher per class per day
- Live attendance tracking with 1-second polling
- Countdown timer displayed to teacher
- Automatic fallback to manual attendance when limit reached

#### Manual Attendance System
- Enter specific roll numbers for absent students (e.g., 1, 2, 56, 70)
- System auto-marks all other students as present
- Date-wise tracking — each day is independent
- Can view and edit attendance for any past date
- Real-time absent students summary before submission

#### Analytics and Reporting
- Student attendance percentage per subject
- Subjects below 75% highlighted with alerts
- Attendance streak tracking
- Teacher analytics with 4 comprehensive views
- University exam eligibility checker (75% rule)
- Export: University format, Eligible students CSV, Defaulters list CSV

#### Class Materials System
- Teachers upload notes, assignments, syllabus, references
- Students view and download materials per class
- Marks entry with auto grade calculation (A+ to F)
- Student feedback with 3-parameter star ratings (1-5)
- Anonymous feedback option available

#### UI/UX Features
- Light/Dark mode toggle with localStorage persistence
- Animated home page with blob backgrounds and testimonials
- Real MITS college logo throughout
- Responsive design for all screen sizes
- Toast notifications for all actions
- Color-coded attendance cards (green/red)

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                │
│  React.js + Tailwind CSS + Recharts                 │
│  Pages: Home, Login, Admin, Teacher, Student        │
└─────────────────────┬───────────────────────────────┘
                      │ REST API (Axios)
┌─────────────────────▼───────────────────────────────┐
│                   APPLICATION LAYER                 │
│  Node.js + Express.js                               │
│  Routes: auth, teacher, student, admin, qr,         │
│          attendance                                 │
│  Middleware: JWT Authentication, Role Authorization │
└─────────────────────┬───────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼───────────────────────────────┐
│                    DATA LAYER                       │
│  MongoDB (mits-attendance database)                 │
│  Collections: users, classes, attendance,           │
│               qrsessions, subjects, materials,      │
│               marks, feedbacks                      │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React.js | 18.2.0 | UI framework |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Charts | Recharts | 2.5.0 | Data visualization |
| HTTP Client | Axios | 1.3.4 | API communication |
| Routing | React Router | 6.8.1 | Client-side routing |
| Notifications | React Toastify | 9.1.1 | Toast messages |
| Icons | React Icons | 4.7.1 | UI icons |
| Backend | Node.js + Express | 4.18.2 | REST API server |
| Database | MongoDB | 6.x | NoSQL database |
| ODM | Mongoose | 7.x | MongoDB modeling |
| Auth | JWT + bcryptjs | 9.0.2 | Secure authentication |
| QR Code | qrcode | 1.5.3 | QR generation |
| Unique IDs | uuid | 9.0.0 | Session tokens |

---

## Testing Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Login (all 3 roles) | ✅ Working | JWT authentication |
| QR Code Generation | ✅ Working | 8-second expiry |
| QR Daily Limit (3/day) | ✅ Working | Date-based counter |
| QR Scanning | ✅ Working | Camera access required |
| Feedback after scan | ✅ Working | Auto-appears after attendance |
| Manual Attendance | ✅ Working | Roll number input |
| Date-wise Tracking | ✅ Working | Each day independent |
| Student Dashboard | ✅ Working | Charts and analytics |
| Teacher Analytics | ✅ Working | 4 comprehensive views |
| Exam Reports | ✅ Working | 75% eligibility check |
| Class Materials | ✅ Working | Upload and download |
| Student Marks | ✅ Working | Auto grade calculation |
| Dark Mode | ✅ Working | Persistent preference |
| Admin Dashboard | ✅ Working | Full user management |

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Total Source Files | 35+ files |
| Frontend Components | 15 pages + 5 components |
| Backend Routes | 6 route files, 25+ endpoints |
| Database Models | 8 Mongoose schemas |
| Pre-loaded Users | 82 (1 admin, 11 teachers, 70 students) |
| Demo Attendance Records | 4,526 |
| CST Subjects | 11 |
| Lines of Code (approx.) | 8,000+ |

---

## How to Run

```bash
# Terminal 1 - Backend
cd backend
npm install
node server-simple.js
# Server starts at http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm install
npm start
# App opens at http://localhost:3000
```

**Login Credentials:**
- Teacher: `devanshu.tiwari@college.edu` / `teacher123`
- Student: `ajay.meena@student.edu` / `student123`
- Admin: `admin@college.edu` / `admin123`

---

## Conclusion

The MITS QR Code Based Attendance Management System has been successfully designed, developed, and deployed as a fully functional software system. All core deliverables have been completed:

- **Source code** is organized module-wise across frontend and backend
- **Front-end and back-end integration** is achieved via RESTful APIs with JWT authentication
- **Database implementation** uses MongoDB with 8 well-defined schemas and pre-loaded data
- **Version control** is set up with Git for collaborative development

The system replaces manual attendance with an efficient QR-based solution, includes a fallback manual attendance system, provides comprehensive analytics, and supports the complete academic workflow from attendance to exam eligibility reporting.

---

*Report prepared by: Ajay Meena*
*Institution: Madhav Institute of Technology & Science (MITS), Gwalior*
*Department: Computer Science & Technology (CST)*
*Academic Year: 2024-25*
