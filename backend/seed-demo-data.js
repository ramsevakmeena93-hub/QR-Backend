/**
 * Demo Data Seed Script for Examiner
 * Creates: Students, Classes, Attendance Records, QR Sessions
 * Run: node backend/seed-demo-data.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const URI = 'mongodb+srv://mitsadmin:Mits2026@cluster0.vvn9jz8.mongodb.net/mits-attendance?retryWrites=true&w=majority&appName=Cluster0';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  password: String, role: String, department: String,
  rollNumber: String, employeeId: String, isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const classSchema = new mongoose.Schema({
  name: String, code: String, subject: String,
  teacher: mongoose.Schema.Types.ObjectId,
  students: [mongoose.Schema.Types.ObjectId],
  department: String, semester: Number, academicYear: String,
  createdAt: { type: Date, default: Date.now }
});

const qrSessionSchema = new mongoose.Schema({
  class: mongoose.Schema.Types.ObjectId,
  teacher: mongoose.Schema.Types.ObjectId,
  token: String, expiresAt: Date, isActive: Boolean,
  attendanceCount: Number, generatedDate: String,
  createdAt: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  class: mongoose.Schema.Types.ObjectId,
  qrSession: mongoose.Schema.Types.ObjectId,
  status: String, markedAt: { type: Date, default: Date.now }
});

// ─── All 76 Students from the image ──────────────────────────────────────────
const studentsData = [
  { roll: 'BTTC25O1001', name: 'AAROHI JAIN' },
  { roll: 'BTTC25O1002', name: 'AAYUSH DEHARIYA' },
  { roll: 'BTTC25O1003', name: 'ABHAY SINGH CHAUHAN' },
  { roll: 'BTTC25O1004', name: 'ADITYA KUMAR PATEL' },
  { roll: 'BTTC25O1005', name: 'AGAM SHARMA' },
  { roll: 'BTTC25O1006', name: 'AJAY KUMAR BAIS' },
  { roll: 'BTTC25O1007', name: 'AJAY MEENA' },
  { roll: 'BTTC25O1008', name: 'AJAY YADAV' },
  { roll: 'BTTC25O1009', name: 'AKSHI GALAV' },
  { roll: 'BTTC25O1010', name: 'AMOGH AMEYE' },
  { roll: 'BTTC25O1011', name: 'AMRITA BIGHANE' },
  { roll: 'BTTC25O1012', name: 'ANGEL LAL' },
  { roll: 'BTTC25O1013', name: 'ANSHIKA BANSAL' },
  { roll: 'BTTC25O1014', name: 'ANTRIKSH YADAV' },
  { roll: 'BTTC25O1015', name: 'ANVESH KUMAR' },
  { roll: 'BTTC25O1016', name: 'ARPIT CHAKRAVARTY' },
  { roll: 'BTTC25O1017', name: 'ARPIT PATEL' },
  { roll: 'BTTC25O1018', name: 'ARUNIM RICHHARIYA' },
  { roll: 'BTTC25O1019', name: 'ARYAN DINESH BHADOREEYA' },
  { roll: 'BTTC25O1020', name: 'ARYAN RANA' },
  { roll: 'BTTC25O1021', name: 'ARYAN SITOLE' },
  { roll: 'BTTC25O1022', name: 'ASTHA JAIN' },
  { roll: 'BTTC25O1023', name: 'ATIKSH PATEL' },
  { roll: 'BTTC25O1024', name: 'CHARCHIT THAKUR' },
  { roll: 'BTTC25O1025', name: 'DAKSHYA MANGROLIA' },
  { roll: 'BTTC25O1026', name: 'DEVANSH NARWARIA' },
  { roll: 'BTTC25O1027', name: 'DHRUV KUMAR CHAUDHARY' },
  { roll: 'BTTC25O1028', name: 'DHRUV RAJ DODIA' },
  { roll: 'BTTC25O1029', name: 'DIVY JAIN' },
  { roll: 'BTTC25O1030', name: 'HARSH MAHASHABDE' },
  { roll: 'BTTC25O1031', name: 'HARSHITA CHAUDHARY' },
  { roll: 'BTTC25O1032', name: 'HEMA SINGH' },
  { roll: 'BTTC25O1033', name: 'HIMANSHU SHAKYA' },
  { roll: 'BTTC25O1034', name: 'JANVI PATIDAR' },
  { roll: 'BTTC25O1035', name: 'KRATIK PATIL' },
  { roll: 'BTTC25O1037', name: 'KSHITIZ JAYASWAL' },
  { roll: 'BTTC25O1038', name: 'MAHI GUPTA' },
  { roll: 'BTTC25O1039', name: 'MAHI JAIN' },
  { roll: 'BTTC25O1040', name: 'MOHD SHAFA AT KHAN' },
  { roll: 'BTTC25O1041', name: 'MOHINI RATHORE' },
  { roll: 'BTTC25O1042', name: 'MOULIK GUPTA' },
  { roll: 'BTTC25O1043', name: 'NIHARIKA NIRANJAN' },
  { roll: 'BTTC25O1044', name: 'NIKHIL DWIVEDI' },
  { roll: 'BTTC25O1045', name: 'PIYUSH CHAKRAWARTI' },
  { roll: 'BTTC25O1046', name: 'PIYUSH KUMAR' },
  { roll: 'BTTC25O1047', name: 'PRAKHAR SHRIVASTAVA' },
  { roll: 'BTTC25O1048', name: 'PRANSHU JOUHARI' },
  { roll: 'BTTC25O1049', name: 'PRATHAM SEN' },
  { roll: 'BTTC25O1050', name: 'PRATHAM SEN' },
  { roll: 'BTTC25O1051', name: 'PRERNA MISHRA' },
  { roll: 'BTTC25O1052', name: 'PRITHVI RAJ SHINDE' },
  { roll: 'BTTC25O1053', name: 'PRIYAL CHOUDHARY' },
  { roll: 'BTTC25O1054', name: 'PRIYANSHU GURDEKAR' },
  { roll: 'BTTC25O1056', name: 'PRIYANSHU YADAV' },
  { roll: 'BTTC25O1057', name: 'PURTI GUPTA' },
  { roll: 'BTTC25O1058', name: 'PUSHKAR CHAURASIYA' },
  { roll: 'BTTC25O1059', name: 'RADHIKA SIKARWAR' },
  { roll: 'BTTC25O1060', name: 'RAJPAL GURJAR' },
  { roll: 'BTTC25O1061', name: 'RISHIRAJ SINGH YADAV' },
  { roll: 'BTTC25O1062', name: 'ROHIT PATEL' },
  { roll: 'BTTC25O1063', name: 'SAKSHI DUBEY' },
  { roll: 'BTTC25O1064', name: 'SAMPANN SHARMA' },
  { roll: 'BTTC25O1065', name: 'SANDEEP NARWARIYA' },
  { roll: 'BTTC25O1066', name: 'SHUBH VERMA' },
  { roll: 'BTTC25O1067', name: 'SIDDHARTH NORKEY' },
  { roll: 'BTTC25O1068', name: 'SMITA SANODIYA' },
  { roll: 'BTTC25O1069', name: 'SUMIT GARG' },
  { roll: 'BTTC25O1070', name: 'SWEETY BHADAURIYA' },
  { roll: 'BTTC25O1071', name: 'UNNATI GUPTA' },
  { roll: 'BTTC25O1072', name: 'UNNATI SHARMA' },
  { roll: 'BTTC25O1073', name: 'VED CHAUDHARY' },
  { roll: 'BTTC25O1074', name: 'VEDANT YADAV' },
  { roll: 'BTTC25O1075', name: 'YASHRAJ SINGH BUNDELA' },
  { roll: 'BTTC25O1076', name: 'ADITYA SINGH RATHORE' },
  { roll: 'BTTC25O1037B', name: 'KRISHNAV SHIVHARE' },
];

// ─── 11 Courses ───────────────────────────────────────────────────────────────
const coursesData = [
  { code: '34251201', name: 'Data Structures', classCode: 'DS-2025' },
  { code: '34251202', name: 'Object Oriented Programming', classCode: 'OOP-2025' },
  { code: '34251203', name: 'Discrete Structures', classCode: 'DISC-2025' },
  { code: '34251204', name: 'Probability and Random Processes', classCode: 'PROB-2025' },
  { code: '34251205', name: 'Basic Electrical & Electronics Engineering', classCode: 'BEE-2025' },
  { code: '34251206', name: 'Data Structures Lab', classCode: 'DSL-2025' },
  { code: '34251207', name: 'Object Oriented Programmings Lab', classCode: 'OOPL-2025' },
  { code: '34251208', name: 'Electrical & Electronics Engineering Lab', classCode: 'BEEL-2025' },
  { code: '34251209', name: 'Semester Proficiency', classCode: 'SP-2025' },
  { code: '34251210', name: 'Micro Project-II', classCode: 'MP-2025' },
  { code: '34251211', name: 'Sustainability & Environmental Science', classCode: 'SES-2025' },
];

async function seed() {
  await mongoose.connect(URI);
  console.log('✅ Connected to MongoDB');

  const User = mongoose.model('User', userSchema);
  const Class = mongoose.model('Class', classSchema);
  const QRSession = mongoose.model('QRSession', qrSessionSchema);
  const Attendance = mongoose.model('Attendance', attendanceSchema);

  // ─── Get or create teacher ────────────────────────────────────────────────
  let teacher = await User.findOne({ email: 'ramsevakmeena93@gmail.com' });
  if (!teacher) {
    teacher = await User.create({
      name: 'Ajay Meena', email: 'ramsevakmeena93@gmail.com',
      password: await bcrypt.hash('google_faculty', 10),
      role: 'teacher', department: 'CST'
    });
  }
  console.log(`✅ Teacher: ${teacher.name}`);

  // ─── Create/update all students ───────────────────────────────────────────
  const studentIds = [];
  for (const s of studentsData) {
    const email = `${s.roll.toLowerCase()}@student.mits.ac.in`;
    let student = await User.findOne({ email });
    if (!student) {
      student = await User.create({
        name: s.name, email,
        password: await bcrypt.hash('student123', 10),
        role: 'student', department: 'CST', rollNumber: s.roll
      });
    }
    studentIds.push(student._id);
  }
  console.log(`✅ Students: ${studentIds.length} created/found`);

  // ─── Create classes with realistic attendance ─────────────────────────────
  // Attendance rates per course (realistic variation)
  const attendanceRates = [0.82, 0.78, 0.85, 0.71, 0.88, 0.90, 0.76, 0.83, 0.95, 0.68, 0.79];
  const totalSessionsPerCourse = [18, 16, 20, 15, 17, 12, 12, 10, 8, 6, 14];

  for (let i = 0; i < coursesData.length; i++) {
    const course = coursesData[i];

    // Check if class already exists
    let cls = await Class.findOne({ code: course.classCode });
    if (!cls) {
      cls = await Class.create({
        name: `${course.name} - Sem 2`,
        code: course.classCode,
        subject: `${course.name} (${course.code})`,
        teacher: teacher._id,
        students: studentIds,
        department: 'CST',
        semester: 2,
        academicYear: '2025-26'
      });
      console.log(`  ✓ Class: ${cls.name}`);
    }

    const totalSessions = totalSessionsPerCourse[i];
    const rate = attendanceRates[i];

    // Create QR sessions (past dates)
    const sessionIds = [];
    for (let day = 0; day < totalSessions; day++) {
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - (totalSessions - day) * 2);
      const dateStr = sessionDate.toISOString().split('T')[0];

      // Check if session exists
      const existingSession = await QRSession.findOne({ class: cls._id, generatedDate: dateStr });
      if (!existingSession) {
        const session = await QRSession.create({
          class: cls._id, teacher: teacher._id,
          token: `DEMO-${cls.code}-${day}`,
          expiresAt: new Date(sessionDate.getTime() + 8000),
          isActive: false,
          attendanceCount: Math.floor(studentIds.length * rate),
          generatedDate: dateStr
        });
        sessionIds.push({ id: session._id, date: sessionDate });
      }
    }

    // Create attendance records using bulk insert
    const attendanceDocs = [];
    for (const studentId of studentIds) {
      const studentRate = Math.min(1, Math.max(0.5, rate + (Math.random() - 0.5) * 0.1));
      const sessionsToAttend = Math.floor(totalSessions * studentRate);
      for (let s = 0; s < sessionsToAttend; s++) {
        const sessionDate = new Date();
        sessionDate.setDate(sessionDate.getDate() - (totalSessions - s) * 2);
        attendanceDocs.push({
          student: studentId, class: cls._id,
          qrSession: null, status: 'present', markedAt: sessionDate
        });
      }
    }
    // Bulk insert (ignore duplicates)
    if (attendanceDocs.length > 0) {
      await Attendance.insertMany(attendanceDocs, { ordered: false }).catch(() => {});
    }
    console.log(`  ✓ ${course.name}: ${totalSessions} sessions, ${attendanceDocs.length} attendance records`);
  }

  console.log('\n🎉 Demo data seeded successfully!');
  console.log(`   Students: ${studentIds.length}`);
  console.log(`   Classes: ${coursesData.length}`);
  console.log('\n📊 Faculty Dashboard will show:');
  console.log('   - 11 classes with student lists');
  console.log('   - Attendance counts per class');
  console.log('\n📊 Student Dashboard will show:');
  console.log('   - 11 enrolled courses');
  console.log('   - Attendance percentage per course');
  console.log('   - Overall attendance stats');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
