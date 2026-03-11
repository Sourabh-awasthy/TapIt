/**
 * Seed script — creates default users and sample students for development.
 * Run: cd backend && npx ts-node src/seed.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';
import { User } from './models/User';
import { Student } from './models/Student';
import { Location } from './models/Location';
import { LOCATION_DEFAULTS } from './config/constants';

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Seed locations ────────────────────────────────────────────────────────
  for (const loc of LOCATION_DEFAULTS) {
    await Location.findOneAndUpdate(
      { code: loc.code },
      { $setOnInsert: { ...loc, isActive: true } },
      { upsert: true }
    );
  }
  console.log('Locations seeded');

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminExists = await User.findOne({ email: 'admin@school.edu' });
  if (!adminExists) {
    await User.create({
      email: 'admin@school.edu',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    });
    console.log('Admin created  → admin@school.edu / admin123');
  } else {
    console.log('Admin already exists');
  }

  // ── Teacher user ──────────────────────────────────────────────────────────
  let teacher = await User.findOne({ email: 'teacher@school.edu' });
  if (!teacher) {
    teacher = await User.create({
      email: 'teacher@school.edu',
      password: await bcrypt.hash('teacher123', 10),
      role: 'teacher',
    });
    console.log('Teacher created → teacher@school.edu / teacher123');
  } else {
    console.log('Teacher already exists');
  }

  // ── Sample students ───────────────────────────────────────────────────────
  const sampleStudents = [
    { firstName: 'Alice',   lastName: 'Johnson',  studentId: 'STU001', rfidCardId: 'RFID001', classGroup: 'CS-2B' },
    { firstName: 'Bob',     lastName: 'Smith',    studentId: 'STU002', rfidCardId: 'RFID002', classGroup: 'CS-2B' },
    { firstName: 'Charlie', lastName: 'Lee',      studentId: 'STU003', rfidCardId: 'RFID003', classGroup: 'CS-2B' },
    { firstName: 'Diana',   lastName: 'Patel',    studentId: 'STU004', rfidCardId: 'RFID004', classGroup: 'CS-2A' },
    { firstName: 'Ethan',   lastName: 'Wong',     studentId: 'STU005', rfidCardId: 'RFID005', classGroup: 'CS-2A' },
  ];

  for (const s of sampleStudents) {
    const exists = await Student.findOne({ studentId: s.studentId });
    if (!exists) {
      const student = await Student.create({ ...s, teacherRef: teacher!._id, isActive: true });

      // Create login for student
      await User.findOneAndUpdate(
        { email: `${s.studentId.toLowerCase()}@school.edu` },
        {
          email: `${s.studentId.toLowerCase()}@school.edu`,
          password: await bcrypt.hash('student123', 10),
          role: 'student',
          studentRef: student._id,
        },
        { upsert: true }
      );

      console.log(`Student created → ${s.firstName} ${s.lastName} (${s.studentId}@school.edu / student123)`);
    } else {
      console.log(`Student ${s.studentId} already exists`);
    }
  }

  await mongoose.disconnect();
  console.log('\nSeed complete.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
