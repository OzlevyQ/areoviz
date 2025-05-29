// src/models/FlightRecord.ts

import mongoose, { Schema, Document } from 'mongoose';
import { FlightRecord as IFlightRecord, AircraftSystem } from '@/types/aviation';

// Base interfaces
export interface FlightRecordDocument extends Document, Omit<IFlightRecord, 'id'> {
  _id: string;
}

export interface SystemConnection {
  sourceId: string;
  targetId: string;
  type: string;
  status: 'active' | 'inactive';
}

export interface Anomaly {
  flightId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
  status: 'active' | 'resolved';
  parameters: Record<string, any>;
}

// Schemas
const AircraftSystemSchema = new Schema<AircraftSystem>({
  fuel: { level: Number, consumption: Number },
  engine: { rpm: Number, temperature: Number, oilPressure: Number },
  electrical: { voltage: Number, current: Number },
  avionics: { status: String },
  hydraulics: { pressure: Number },
  pressurization: { cabinAltitude: Number, differential: Number }
});

const FlightRecordSchema = new Schema<FlightRecordDocument>({
  flightNumber: { type: String, required: true },
  timestamp: { type: Date, required: true },
  aircraft: { type: String, required: true },
  altitude: { type: Number, required: true },
  speed: { type: Number, required: true },
  heading: { type: Number, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['normal', 'warning', 'critical'],
    required: true 
  },
  verticalSpeed: { type: Number, required: true },
  groundSpeed: { type: Number, required: true },
  systems: { type: AircraftSystemSchema, required: true }
}, {
  timestamps: true
});

const SystemConnectionSchema = new Schema<SystemConnection>({
  sourceId: { type: String, required: true },
  targetId: { type: String, required: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

const AnomalySchema = new Schema<Anomaly>({
  flightId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    required: true 
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'resolved'],
    default: 'active'
  },
  parameters: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes
FlightRecordSchema.index({ timestamp: -1 });
FlightRecordSchema.index({ flightNumber: 1, timestamp: -1 });
FlightRecordSchema.index({ status: 1 });

SystemConnectionSchema.index({ sourceId: 1, targetId: 1 });
SystemConnectionSchema.index({ status: 1 });

AnomalySchema.index({ flightId: 1, timestamp: -1 });
AnomalySchema.index({ severity: 1, status: 1 });

// Models
export const FlightRecordModel = mongoose.models.FlightRecord || mongoose.model<FlightRecordDocument>('FlightRecord', FlightRecordSchema);
export const SystemConnectionModel = mongoose.models.SystemConnection || mongoose.model<SystemConnection>('SystemConnection', SystemConnectionSchema);
export const AnomalyModel = mongoose.models.Anomaly || mongoose.model<Anomaly>('Anomaly', AnomalySchema);
