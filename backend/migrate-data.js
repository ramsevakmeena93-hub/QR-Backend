/**
 * Data Migration Script
 * Copies users from old MongoDB cluster to new one
 * Run: node backend/migrate-data.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const OLD_URI = 'mongodb+srv://qruser:qrpass123@cluster0.5xzqm.mongodb.net/qr-attendance?retryWrites=true&w=majority';
const NEW_URI = 'mongodb+srv://mitsadmin:Mits2026Secure@cluster0.vvn9jz8.mongodb.net/mits-attendance?retryWrites=true&w=majority&appName=Cluster0';

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String,
  role: String, department: String, rollNumber: String, employeeId: String
});

async function migrate() {
  console.log('🔄 Starting data migration...');

  // Connect to old DB
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  console.log('✅ Connected to OLD database');

  // Connect to new DB
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log('✅ Connected to NEW database');

  const OldUser = oldConn.model('User', userSchema);
  const NewUser = newConn.model('User', userSchema);

  // Get all users from old DB
  const oldUsers = await OldUser.find({});
  console.log(`📊 Found ${oldUsers.length} users in old database`);

  let migrated = 0;
  let skipped = 0;

  for (const user of oldUsers) {
    const exists = await NewUser.findOne({ email: user.email });
    if (exists) { skipped++; continue; }

    await NewUser.create({
      name: user.name, email: user.email,
      password: user.password, // already hashed
      role: user.role, department: user.department,
      rollNumber: user.rollNumber, employeeId: user.employeeId
    });
    migrated++;
    console.log(`  ✓ Migrated: ${user.email} (${user.role})`);
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migrated} users`);
  console.log(`   Skipped (already exist): ${skipped} users`);

  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
