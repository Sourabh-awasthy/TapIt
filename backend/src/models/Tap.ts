import mongoose, { Document, Schema, Types } from 'mongoose';
import type { LocationCode } from '../config/constants';

export interface ITap extends Document {
  _id: Types.ObjectId;
  rfidCardId: string;
  studentRef: Types.ObjectId;
  locationCode: LocationCode;
  readerDeviceId?: string;
  tappedAt: Date;
  dayKey: string;
  isLate: boolean;
}

const tapSchema = new Schema<ITap>({
  rfidCardId:     { type: String, required: true },
  studentRef:     { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  locationCode:   { type: String, enum: ['classroom','library','gym','club'], required: true },
  readerDeviceId: { type: String },
  tappedAt:       { type: Date, required: true, default: Date.now },
  dayKey:         { type: String, required: true },
  isLate:         { type: Boolean, default: false },
});

tapSchema.index({ studentRef: 1, tappedAt: -1 });
tapSchema.index({ studentRef: 1, locationCode: 1, dayKey: 1 });
tapSchema.index({ dayKey: 1 });
tapSchema.index({ rfidCardId: 1, tappedAt: -1 });

export const Tap = mongoose.model<ITap>('Tap', tapSchema);
