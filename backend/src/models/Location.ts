import mongoose, { Document, Schema } from 'mongoose';

export interface ISession {
  label: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export interface ILocation extends Document {
  code: string;
  label: string;
  weight: number;
  sessions: ISession[];
  isActive: boolean;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>({
  label:      { type: String, required: true },
  startTime:  { type: String, required: true },
  endTime:    { type: String, required: true },
  daysOfWeek: [{ type: Number }],
}, { _id: false });

const locationSchema = new Schema<ILocation>(
  {
    code:     { type: String, required: true, unique: true },
    label:    { type: String, required: true },
    weight:   { type: Number, required: true, min: 0, max: 1 },
    sessions: [sessionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Location = mongoose.model<ILocation>('Location', locationSchema);
