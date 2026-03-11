/**
 * Demo data script — injects 30 days of realistic tap history for all sample students.
 * Run: cd backend && npm run demo
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from './config/env';
import { Student } from './models/Student';
import { Tap } from './models/Tap';
import { refreshStudentScore } from './services/scoring.service';
import { format, subDays, setHours, setMinutes, addMinutes } from 'date-fns';

const LOCATION_CODES = ['classroom', 'library', 'gym', 'club'] as const;

function toDateKey(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

/** Returns a random int between min and max inclusive */
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Returns true with probability p (0–1) */
function chance(p: number) {
  return Math.random() < p;
}

/** Build a tap date/time for a given day + approx hour */
function tapTime(base: Date, hour: number, minuteJitter = 15): Date {
  const d = new Date(base);
  d.setHours(hour, rand(0, minuteJitter), 0, 0);
  return d;
}

// Per-student profiles so they each look different on the dashboard
const STUDENT_PROFILES: Record<string, {
  classroomRate: number; // fraction of weekdays they attend class
  libraryRate: number;
  gymRate: number;
  clubRate: number;
  lateRate: number;     // fraction of classroom taps that are late
}> = {
  STU001: { classroomRate: 0.92, libraryRate: 0.6,  gymRate: 0.4,  clubRate: 0.3,  lateRate: 0.05 }, // Alice  — star student
  STU002: { classroomRate: 0.78, libraryRate: 0.35, gymRate: 0.6,  clubRate: 0.15, lateRate: 0.15 }, // Bob    — gym rat
  STU003: { classroomRate: 0.60, libraryRate: 0.25, gymRate: 0.1,  clubRate: 0.5,  lateRate: 0.3  }, // Charlie— club person, skips class
  STU004: { classroomRate: 0.85, libraryRate: 0.7,  gymRate: 0.2,  clubRate: 0.2,  lateRate: 0.08 }, // Diana  — studious
  STU005: { classroomRate: 0.45, libraryRate: 0.2,  gymRate: 0.2,  clubRate: 0.1,  lateRate: 0.4  }, // Ethan  — low engagement
};

async function seedDemoData() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  const today = new Date();
  const students = await Student.find({ studentId: { $in: Object.keys(STUDENT_PROFILES) } });

  if (students.length === 0) {
    console.error('No sample students found. Run `npm run seed` first.');
    process.exit(1);
  }

  for (const student of students) {
    const profile = STUDENT_PROFILES[student.studentId];
    if (!profile) continue;

    // Clear existing taps for clean demo data
    const deleted = await Tap.deleteMany({ studentRef: student._id });
    if (deleted.deletedCount > 0) {
      console.log(`Cleared ${deleted.deletedCount} existing taps for ${student.firstName}`);
    }

    const tapsToInsert: any[] = [];

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const day = subDays(today, daysAgo);
      const dow = day.getDay(); // 0=Sun, 6=Sat
      const isWeekday = dow >= 1 && dow <= 5;

      // ── Classroom (weekdays only) ──────────────────────────────────────
      if (isWeekday && chance(profile.classroomRate)) {
        const isLate = chance(profile.lateRate);
        // Morning session: starts 09:00. Late = arrive after 09:00
        const arrivalHour = isLate ? 9 : 9;
        const arrivalMinute = isLate ? rand(5, 25) : rand(0, 5);
        const t = new Date(day);
        t.setHours(arrivalHour, arrivalMinute, rand(0, 59), 0);
        tapsToInsert.push({
          rfidCardId:   student.rfidCardId,
          studentRef:   student._id,
          locationCode: 'classroom',
          tappedAt:     t,
          dayKey:       toDateKey(t),
          isLate,
        });

        // Sometimes a second classroom tap (afternoon session)
        if (chance(0.4)) {
          const t2 = new Date(day);
          t2.setHours(13, rand(0, 10), rand(0, 59), 0);
          tapsToInsert.push({
            rfidCardId:   student.rfidCardId,
            studentRef:   student._id,
            locationCode: 'classroom',
            tappedAt:     t2,
            dayKey:       toDateKey(t2),
            isLate:       false,
          });
        }
      }

      // ── Library (any day) ──────────────────────────────────────────────
      if (chance(profile.libraryRate * (isWeekday ? 1 : 0.4))) {
        const t = tapTime(day, rand(10, 16), 30);
        tapsToInsert.push({
          rfidCardId:   student.rfidCardId,
          studentRef:   student._id,
          locationCode: 'library',
          tappedAt:     t,
          dayKey:       toDateKey(t),
          isLate:       false,
        });
      }

      // ── Gym (any day) ──────────────────────────────────────────────────
      if (chance(profile.gymRate * (isWeekday ? 0.6 : 1.2))) {
        const t = tapTime(day, rand(6, 8), 45); // early morning gym
        tapsToInsert.push({
          rfidCardId:   student.rfidCardId,
          studentRef:   student._id,
          locationCode: 'gym',
          tappedAt:     t,
          dayKey:       toDateKey(t),
          isLate:       false,
        });
      }

      // ── Club / Society (weekdays, evenings) ───────────────────────────
      if (isWeekday && chance(profile.clubRate * (dow === 3 ? 2 : 1))) { // Wednesdays more likely
        const t = tapTime(day, rand(17, 19), 20);
        tapsToInsert.push({
          rfidCardId:   student.rfidCardId,
          studentRef:   student._id,
          locationCode: 'club',
          tappedAt:     t,
          dayKey:       toDateKey(t),
          isLate:       false,
        });
      }
    }

    await Tap.insertMany(tapsToInsert);
    console.log(`Inserted ${tapsToInsert.length} taps for ${student.firstName} ${student.lastName} (${student.studentId})`);

    // Refresh cached scores
    await refreshStudentScore(student._id as any);
    console.log(`  → Scores refreshed\n`);
  }

  // Print a summary
  console.log('─'.repeat(50));
  const { StudentScore } = await import('./models/StudentScore');
  for (const student of students) {
    const sc = await StudentScore.findOne({ studentRef: student._id });
    if (sc) {
      console.log(
        `${student.firstName.padEnd(10)} | engagement: ${String(sc.engagementScore).padStart(5)} ` +
        `| streak: ${String(sc.attendanceStreak).padStart(2)}d ` +
        `| classroom: ${sc.locationBreakdown.classroom} library: ${sc.locationBreakdown.library} ` +
        `gym: ${sc.locationBreakdown.gym} club: ${sc.locationBreakdown.club}`
      );
    }
  }

  await mongoose.disconnect();
  console.log('\nDemo data ready. Log in as stu001@school.edu / student123 to see the dashboard.');
}

seedDemoData().catch(err => {
  console.error(err);
  process.exit(1);
});
