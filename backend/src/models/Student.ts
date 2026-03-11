import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudent extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  studentId: string;
  rfidCardId?: string;
  classGroup: string;
  teacherRef?: Types.ObjectId;
  enrolledAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    rfidCardId: { type: String, sparse: true, unique: true, trim: true },
    classGroup: { type: String, required: true, trim: true },
    teacherRef: { type: Schema.Types.ObjectId, ref: 'User' },
    enrolledAt: { type: Date, default: Date.now },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

studentSchema.index({ classGroup: 1 });
studentSchema.index({ teacherRef: 1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
