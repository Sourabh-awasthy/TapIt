import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudentScore extends Document {
  studentRef: Types.ObjectId;
  engagementScore: number;
  attendanceStreak: number;
  longestStreak: number;
  punctualityRate: number | null;
  locationBreakdown: { classroom: number; library: number; gym: number; club: number };
  lastTapAt: Date | null;
  computedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentScoreSchema = new Schema<IStudentScore>(
  {
    studentRef:      { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    engagementScore: { type: Number, default: 0 },
    attendanceStreak:{ type: Number, default: 0 },
    longestStreak:   { type: Number, default: 0 },
    punctualityRate: { type: Number, default: null },
    locationBreakdown: {
      classroom: { type: Number, default: 0 },
      library:   { type: Number, default: 0 },
      gym:       { type: Number, default: 0 },
      club:      { type: Number, default: 0 },
    },
    lastTapAt:   { type: Date, default: null },
    computedAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const StudentScore = mongoose.model<IStudentScore>('StudentScore', studentScoreSchema);
