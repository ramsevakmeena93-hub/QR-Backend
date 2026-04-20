/**
 * Seed Script — Creates all 82 users in new MongoDB
 * Run: node backend/seed-users.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const URI = 'mongodb+srv://mitsadmin:Mits2026@cluster0.vvn9jz8.mongodb.net/mits-attendance?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true, lowercase: true },
  password: String, role: String, department: String,
  rollNumber: String, employeeId: String, isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const usersData = require('./users-data');

async function seed() {
  await mongoose.connect(URI);
  console.log('✅ Connected to MongoDB');

  const User = mongoose.model('User', userSchema);

  let created = 0, skipped = 0;

  for (const u of usersData) {
    const exists = await User.findOne({ email: u.email.toLowerCase() });
    if (exists) { skipped++; continue; }

    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({
      name: u.name,
      email: u.email.toLowerCase(),
      password: hashed,
      role: u.role,
      department: u.department || 'CST',
      rollNumber: u.rollNumber || null,
      employeeId: u.employeeId || null,
      isApproved: true
    });
    created++;
    console.log(`  ✓ ${u.role.toUpperCase()}: ${u.name} (${u.email})`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Created: ${created} users`);
  console.log(`   Skipped: ${skipped} (already exist)`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
