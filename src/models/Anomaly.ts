import mongoose, { Schema, Document } from 'mongoose';
import { Anomaly as IAnomaly } from '@/types/aviation';

export interface AnomalyDocument extends Document, Omit<IAnomaly, 'id'> {
  _id: string;
}

const AnomalySchema = new Schema<AnomalyDocument>({
  flightNumber: { type: String, required: true },
  timestamp: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['cabin_pressure', 'altitude', 'engine', 'electrical', 'hydraulics', 'fuel'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true 
  },
  message: { type: String, required: true },
  value: { type: Number, required: true },
  threshold: { type: Number, required: true },
  system: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'acknowledged'],
    default: 'active'
  },
  resolvedAt: { type: Date },
  acknowledgedBy: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
AnomalySchema.index({ timestamp: -1 });
AnomalySchema.index({ flightNumber: 1, timestamp: -1 });
AnomalySchema.index({ severity: 1, status: 1 });
AnomalySchema.index({ type: 1 });

const Anomaly = mongoose.models.Anomaly || mongoose.model<AnomalyDocument>('Anomaly', AnomalySchema);

export default Anomaly; 