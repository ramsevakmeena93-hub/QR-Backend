# ER Diagram & Database Schema
## MITS QR Code Attendance Management System

---

## Entity Relationship Diagram (Text Format)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                        MITS ATTENDANCE SYSTEM - ER DIAGRAM                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────────┐         ┌──────────────────┐
│      USER        │         │        CLASS         │         │     SUBJECT      │
├──────────────────┤         ├──────────────────────┤         ├──────────────────┤
│ PK _id           │         │ PK _id               │         │ PK _id           │
│    name          │         │    name              │         │    name          │
│    email (UQ)    │         │    code (UQ)         │         │    code (UQ)     │
│    password      │    ┌───►│ FK subject ──────────┼────────►│    department    │
│    role          │    │    │ FK teacher ──────────┼──┐      │    credits       │
│    department    │    │    │ FK[] students ───────┼──┼──┐   │    description   │
│    rollNumber    │    │    │    department        │  │  │   │    createdAt     │
│    employeeId    │    │    │    semester          │  │  │   └──────────────────┘
│ FK[] classes     │────┘    │    academicYear      │  │  │
│    createdAt     │         │    schedule[]        │  │  │   (1 Subject → Many Classes)
└──────────────────┘         │    createdAt         │  │  │
        │                    └──────────────────────┘  │  │
        │                              │               │  │
        │ (1 User can be              │               │  │
        │  Admin/Teacher/Student)     │               │  │
        │                             │               │  │
        │         ┌───────────────────┘               │  │
        │         │ (1 Class → Many QRSessions)        │  │
        │         ▼                                    │  │
        │  ┌──────────────────┐                        │  │
        │  │    QRSESSION     │                        │  │
        │  ├──────────────────┤                        │  │
        │  │ PK _id           │                        │  │
        │  │ FK class ────────┼────────────────────────┘  │
        │  │ FK teacher ──────┼───────────────────────────┘
        │  │    token (UQ)    │
        │  │    expiresAt     │◄── Auto-expires (TTL Index)
        │  │    isActive      │
        │  │    attendanceCount│
        │  │    generatedDate │◄── Tracks 3/day limit
        │  │    createdAt     │
        │  └──────────────────┘
        │         │
        │         │ (1 QRSession → Many Attendance)
        │         ▼
        │  ┌──────────────────────┐
        └─►│      ATTENDANCE      │
           ├──────────────────────┤
           │ PK _id               │
           │ FK student ──────────┼──► USER (student)
           │ FK class ────────────┼──► CLASS
           │ FK qrSession ────────┼──► QRSESSION (optional)
           │    status            │    (present/absent/late)
           │    attendanceDate    │◄── YYYY-MM-DD format
           │    markedAt          │
           │    markedBy          │    (qr / manual)
           │    location{}        │
           │    deviceInfo{}      │
           └──────────────────────┘
                  UQ Index: (student + class + attendanceDate)


┌──────────────────────┐         ┌──────────────────────┐
│    CLASSMATERIAL     │         │    STUDENTMARKS      │
├──────────────────────┤         ├──────────────────────┤
│ PK _id               │         │ PK _id               │
│ FK class ────────────┼──► CLASS│ FK class ────────────┼──► CLASS
│ FK teacher ──────────┼──► USER │ FK student ──────────┼──► USER (student)
│    title             │         │ FK teacher ──────────┼──► USER (teacher)
│    description       │         │    examType          │
│    type              │         │    examName          │
│    (notes/assignment │         │    marksObtained     │
│     syllabus/        │         │    totalMarks        │
│     reference/other) │         │    percentage        │◄── Auto-calculated
│    fileUrl           │         │    grade             │◄── Auto-calculated
│    fileName          │         │    (A+/A/B+/B/C/D/F) │
│    fileSize          │         │    remarks           │
│    uploadDate        │         │    examDate          │
│    createdAt         │         │    uploadDate        │
│    updatedAt         │         │    createdAt         │
└──────────────────────┘         └──────────────────────┘


┌──────────────────────────────────────┐
│              FEEDBACK                │
├──────────────────────────────────────┤
│ PK _id                               │
│ FK class ────────────────────────────┼──► CLASS
│ FK student ──────────────────────────┼──► USER (student)
│ FK teacher ──────────────────────────┼──► USER (teacher)
│ FK attendance ───────────────────────┼──► ATTENDANCE (optional)
│    teachingQuality    (1-5 stars)    │
│    contentClarity     (1-5 stars)    │
│    classroomEnvironment (1-5 stars)  │
│    overallRating      (auto-calc)    │
│    comments                          │
│    suggestions                       │
│    isAnonymous                       │
│    submittedAt                       │
│    createdAt                         │
└──────────────────────────────────────┘
```

---

## Relationships Summary

```
USER ──────────────────────────────────────────────────────────────────
  │  1 Admin    → manages all users and subjects
  │  1 Teacher  → teaches many Classes
  │  1 Student  → enrolled in many Classes
  │
  ├──(Teacher) 1 ──────────────── N  CLASS
  ├──(Student) M ──────────────── N  CLASS  (many-to-many via students[])
  ├──(Teacher) 1 ──────────────── N  QRSESSION
  ├──(Teacher) 1 ──────────────── N  CLASSMATERIAL
  ├──(Teacher) 1 ──────────────── N  STUDENTMARKS
  ├──(Student) 1 ──────────────── N  ATTENDANCE
  ├──(Student) 1 ──────────────── N  STUDENTMARKS
  └──(Student) 1 ──────────────── N  FEEDBACK

SUBJECT ──────────────────────────────────────────────────────────────
  └── 1 Subject ──────────────── N  CLASS

CLASS ────────────────────────────────────────────────────────────────
  ├── 1 Class ────────────────── N  QRSESSION
  ├── 1 Class ────────────────── N  ATTENDANCE
  ├── 1 Class ────────────────── N  CLASSMATERIAL
  ├── 1 Class ────────────────── N  STUDENTMARKS
  └── 1 Class ────────────────── N  FEEDBACK

QRSESSION ────────────────────────────────────────────────────────────
  └── 1 QRSession ──────────────── N  ATTENDANCE

ATTENDANCE ───────────────────────────────────────────────────────────
  └── 1 Attendance ──────────────── 1  FEEDBACK (optional)
```

---

## Complete Database Schema

### 1. USER Collection
```
Collection: users
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ name            │ String           │ Required     │ Full name                   │
│ email           │ String           │ Required, UQ │ Login email                 │
│ password        │ String           │ Required     │ bcrypt hashed               │
│ role            │ Enum             │ Required     │ admin / teacher / student   │
│ department      │ String           │ Conditional  │ Required if not admin       │
│ rollNumber      │ String           │ UQ, Sparse   │ Students only (BTTC25O1XXX) │
│ employeeId      │ String           │ UQ, Sparse   │ Teachers only               │
│ classes         │ ObjectId[]       │ Ref: Class   │ Enrolled/teaching classes   │
│ createdAt       │ Date             │ Default: now │ Account creation date       │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
Indexes: email (unique), rollNumber (unique sparse), employeeId (unique sparse)
```

### 2. SUBJECT Collection
```
Collection: subjects
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ name            │ String           │ Required     │ Subject full name           │
│ code            │ String           │ Required, UQ │ e.g., 34251201              │
│ department      │ String           │ Required     │ e.g., CST                   │
│ credits         │ Number           │ Required     │ Credit hours                │
│ description     │ String           │ Optional     │ Subject description         │
│ createdAt       │ Date             │ Default: now │ Creation date               │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
Indexes: code (unique)
Sample Data: 11 CST subjects (34251201 to 34251211)
```

### 3. CLASS Collection
```
Collection: classes
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ name            │ String           │ Required     │ Class display name          │
│ code            │ String           │ Required, UQ │ e.g., DS101                 │
│ subject         │ ObjectId         │ FK: Subject  │ Subject reference           │
│ teacher         │ ObjectId         │ FK: User     │ Assigned teacher            │
│ students        │ ObjectId[]       │ FK: User[]   │ Enrolled students           │
│ department      │ String           │ Required     │ e.g., CST                   │
│ semester        │ Number           │ Required     │ Semester number             │
│ academicYear    │ String           │ Required     │ e.g., 2024-25               │
│ schedule        │ Array{}          │ Optional     │ Day, startTime, endTime     │
│ createdAt       │ Date             │ Default: now │ Creation date               │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
Indexes: code (unique)
```

### 4. QRSESSION Collection
```
Collection: qrsessions
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ class           │ ObjectId         │ FK: Class    │ Class reference             │
│ teacher         │ ObjectId         │ FK: User     │ Teacher who generated       │
│ token           │ String           │ Required, UQ │ UUID token in QR code       │
│ expiresAt       │ Date             │ Required     │ Expiry time (8 seconds)     │
│ isActive        │ Boolean          │ Default: true│ Whether QR is still valid   │
│ attendanceCount │ Number           │ Default: 0   │ Students who scanned        │
│ generatedDate   │ String           │ Required     │ YYYY-MM-DD (for 3/day limit)│
│ createdAt       │ Date             │ Default: now │ Generation timestamp        │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
Indexes: token (unique), expiresAt (TTL - auto delete after expiry)
Business Rule: Max 3 QR sessions per teacher per class per day
```

### 5. ATTENDANCE Collection
```
Collection: attendances
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ student         │ ObjectId         │ FK: User     │ Student reference           │
│ class           │ ObjectId         │ FK: Class    │ Class reference             │
│ qrSession       │ ObjectId         │ FK: QRSession│ Optional (null if manual)   │
│ status          │ Enum             │ Required     │ present / absent / late     │
│ attendanceDate  │ String           │ Required     │ YYYY-MM-DD format           │
│ markedAt        │ Date             │ Default: now │ Exact timestamp             │
│ markedBy        │ Enum             │ Default: qr  │ qr / manual                 │
│ location        │ Object           │ Optional     │ latitude, longitude         │
│ deviceInfo      │ Object           │ Optional     │ userAgent, ip               │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
Indexes:
  - (student, qrSession) unique sparse  → No duplicate QR attendance
  - (student, class, attendanceDate) unique → No duplicate per day
```

### 6. CLASSMATERIAL Collection
```
Collection: classmaterials
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ class           │ ObjectId         │ FK: Class    │ Class reference             │
│ teacher         │ ObjectId         │ FK: User     │ Uploader reference          │
│ title           │ String           │ Required     │ Material title              │
│ description     │ String           │ Optional     │ Material description        │
│ type            │ Enum             │ Default: notes│ notes/assignment/syllabus  │
│                 │                  │              │ /reference/other            │
│ fileUrl         │ String           │ Optional     │ File download URL           │
│ fileName        │ String           │ Optional     │ Original file name          │
│ fileSize        │ Number           │ Optional     │ File size in bytes          │
│ uploadDate      │ Date             │ Default: now │ Upload timestamp            │
│ createdAt       │ Date             │ Auto         │ Mongoose timestamp          │
│ updatedAt       │ Date             │ Auto         │ Mongoose timestamp          │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
```

### 7. STUDENTMARKS Collection
```
Collection: studentmarks
┌─────────────────┬──────────────────┬──────────────┬─────────────────────────────┐
│ Field           │ Type             │ Constraints  │ Description                 │
├─────────────────┼──────────────────┼──────────────┼─────────────────────────────┤
│ _id             │ ObjectId         │ PK           │ Auto-generated primary key  │
│ class           │ ObjectId         │ FK: Class    │ Class reference             │
│ student         │ ObjectId         │ FK: User     │ Student reference           │
│ teacher         │ ObjectId         │ FK: User     │ Teacher who entered marks   │
│ examType        │ Enum             │ Required     │ quiz/midterm/assignment/     │
│                 │                  │              │ final/practical/other       │
│ examName        │ String           │ Optional     │ e.g., "Mid Sem Exam"        │
│ marksObtained   │ Number           │ Required     │ Marks scored                │
│ totalMarks      │ Number           │ Required     │ Maximum marks               │
│ percentage      │ Number           │ Auto-calc    │ (obtained/total) × 100      │
│ grade           │ String           │ Auto-calc    │ A+/A/B+/B/C/D/F             │
│ remarks         │ String           │ Optional     │ Teacher remarks             │
│ examDate        │ Date             │ Optional     │ Date of exam                │
│ uploadDate      │ Date             │ Default: now │ Entry timestamp             │
│ createdAt       │ Date             │ Auto         │ Mongoose timestamp          │
│ updatedAt       │ Date             │ Auto         │ Mongoose timestamp          │
└─────────────────┴──────────────────┴──────────────┴─────────────────────────────┘
Auto-Grade Logic:
  ≥90% → A+  |  ≥80% → A  |  ≥70% → B+  |  ≥60% → B  |  ≥50% → C  |  ≥40% → D  |  <40% → F
```

### 8. FEEDBACK Collection
```
Collection: feedbacks
┌─────────────────────┬──────────────────┬──────────────┬──────────────────────────┐
│ Field               │ Type             │ Constraints  │ Description              │
├─────────────────────┼──────────────────┼──────────────┼──────────────────────────┤
│ _id                 │ ObjectId         │ PK           │ Auto-generated PK        │
│ class               │ ObjectId         │ FK: Class    │ Class reference          │
│ student             │ ObjectId         │ FK: User     │ Student reference        │
│ teacher             │ ObjectId         │ FK: User     │ Teacher reference        │
│ attendance          │ ObjectId         │ FK: Attend.  │ Optional link            │
│ teachingQuality     │ Number (1-5)     │ Required     │ Star rating              │
│ contentClarity      │ Number (1-5)     │ Required     │ Star rating              │
│ classroomEnvironment│ Number (1-5)     │ Required     │ Star rating              │
│ overallRating       │ Number (1-5)     │ Auto-calc    │ Average of 3 ratings     │
│ comments            │ String           │ Optional     │ Text feedback            │
│ suggestions         │ String           │ Optional     │ Improvement suggestions  │
│ isAnonymous         │ Boolean          │ Default: false│ Hide student identity   │
│ submittedAt         │ Date             │ Default: now │ Submission timestamp     │
│ createdAt           │ Date             │ Auto         │ Mongoose timestamp       │
└─────────────────────┴──────────────────┴──────────────┴──────────────────────────┘
Auto-Calc: overallRating = (teachingQuality + contentClarity + classroomEnvironment) / 3
```

---

## Visual ER Diagram (Crow's Foot Notation)

```
SUBJECT ──────────────────────────────────────────────────────────
  │ _id (PK)                                                      │
  │ name                                                          │
  │ code (UQ)                                                     │
  │ department                                                    │
  │ credits                                                       │
  └──────────────────────────────────────────────────────────────┘
       │ 1
       │
       │ has many
       │
       ▼ N
┌──────────────────────────────────────────────────────────────────┐
│ CLASS                                                            │
│  _id (PK)                                                        │
│  name                                                            │
│  code (UQ)                                                       │
│  subject_id (FK → SUBJECT)                                       │
│  teacher_id (FK → USER)                                          │
│  students[] (FK → USER[])                                        │
│  department, semester, academicYear                              │
└──────────────────────────────────────────────────────────────────┘
       │ 1                    │ 1                    │ 1
       │                      │                      │
  has many              has many              has many
       │                      │                      │
       ▼ N                    ▼ N                    ▼ N
┌────────────┐      ┌──────────────┐      ┌──────────────────┐
│ QRSESSION  │      │  ATTENDANCE  │      │  CLASSMATERIAL   │
│ _id (PK)   │      │  _id (PK)    │      │  _id (PK)        │
│ class_id   │      │  student_id  │      │  class_id        │
│ teacher_id │      │  class_id    │      │  teacher_id      │
│ token (UQ) │      │  qrsession_id│      │  title, type     │
│ expiresAt  │      │  status      │      │  fileUrl         │
│ isActive   │      │  date        │      └──────────────────┘
│ genDate    │      │  markedBy    │
└────────────┘      └──────────────┘
       │ 1                 │ 1
       │                   │
  generates           triggers
       │                   │
       ▼ N                 ▼ 1
  ATTENDANCE           FEEDBACK
                    ┌──────────────────┐
                    │ FEEDBACK         │
                    │ _id (PK)         │
                    │ class_id         │
                    │ student_id       │
                    │ teacher_id       │
                    │ attendance_id    │
                    │ teachingQuality  │
                    │ contentClarity   │
                    │ classroomEnv     │
                    │ overallRating    │
                    │ isAnonymous      │
                    └──────────────────┘

USER ─────────────────────────────────────────────────────────────
  │ _id (PK)
  │ name, email (UQ), password
  │ role: admin | teacher | student
  │ rollNumber (UQ, sparse) ← students only
  │ employeeId (UQ, sparse) ← teachers only
  │ classes[] (FK → CLASS[])
  │
  ├── as TEACHER → creates CLASS, QRSESSION, CLASSMATERIAL, STUDENTMARKS
  └── as STUDENT → has ATTENDANCE, STUDENTMARKS, FEEDBACK
```

---

## Database Statistics

| Collection     | Records (Demo) | Key Indexes                              |
|----------------|---------------|------------------------------------------|
| users          | 82            | email (UQ), rollNumber (UQ), employeeId (UQ) |
| subjects       | 11            | code (UQ)                                |
| classes        | 6             | code (UQ)                                |
| qrsessions     | ~18           | token (UQ), expiresAt (TTL)              |
| attendances    | 4,526         | (student+qrSession) UQ, (student+class+date) UQ |
| classmaterials | 0 (dynamic)   | none                                     |
| studentmarks   | 0 (dynamic)   | none                                     |
| feedbacks      | 0 (dynamic)   | none                                     |

---

## Key Business Rules in Schema

| Rule | Implementation |
|------|---------------|
| Max 3 QR per day | `generatedDate` field + count query before generation |
| No duplicate attendance | Unique index on (student, class, attendanceDate) |
| QR auto-expires | TTL index on `expiresAt` field |
| Password security | bcrypt hash with salt rounds = 10 |
| Auto grade calculation | Pre-save hook in StudentMarks model |
| Auto overall rating | Pre-save hook in Feedback model |
| Role-based fields | Conditional `required` in User schema |
| Anonymous feedback | `isAnonymous` boolean flag |
| Manual vs QR attendance | `markedBy` enum field |

---

*Database: MongoDB (mits-attendance)*
*ODM: Mongoose 7.x*
*Developer: Ajay Meena — MITS Gwalior*
