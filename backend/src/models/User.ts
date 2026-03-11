import mongoose, { Document, Schema, Types } from 'mongoose';

export type Role = 'student' | 'teacher' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: Role;
  studentRef?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    studentRef: { type: Schema.Types.ObjectId, ref: 'Student', sparse: true },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
