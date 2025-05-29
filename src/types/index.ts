// src/types/index.ts

export interface FlightRecord {
  _id?: string;
  TimeTag: number;
  RecorderTime: number;
  DateTime: string; // ISO 8601 format
  CabinAltitude_SD69218: number;
  CabinAltitude_PR69218: number;
  CabinDifferentialPressure_SD64521: number;
  CabinDifferentialPressure_SD64515: number;
  OutflowValvePosition_SD6B222: number;
  OutflowValvePosition_PR6B222: number;
  CabinPressure_SD6A420: number;
  CabinVS_SD68222: number;
  Altitude_AD83212: number;
  AltitudeRate_DM8A518: number;
  AltitudeRate_FGF5114: number;
  VerticalSpeed_DMF5518: number;
  LandingElevation_FMAE115: number;
  NoseLandingGearCompressed_LG11212: number; // 0 or 1
  LHLandingGearCompressed_LG11213: number; // 0 or 1
  RHLandingGearCompressed_LG11214: number; // 0 or 1
  FlightPhase_FW56211: number; // Numerical representation of flight phase
}

export interface Anomaly {
  id: string;
  timestamp: string; // ISO 8601 format, derived from FlightRecord.DateTime
  type: string; // e.g., 'sensor_mismatch', 'high_pressure'
  description: string; // User-friendly description
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSystems: string[]; // e.g., ['Pressurization', 'Air Data System']
  affectedParameters: string[]; // Specific FlightRecord parameters, e.g., ['CabinAltitude_SD69218']
  status?: 'active' | 'acknowledged' | 'resolved';
  currentValues?: Record<string, string | number>; // Values that triggered/relate to the anomaly
  recommendedActions?: string[];
}

export interface SystemConnection {
  source: string; // Parameter name (node ID)
  target: string; // Parameter name (node ID)
  type: string;   // e.g., 'input', 'control_signal', 'mode_command'
  label?: string;  // Optional label for the edge
}

export interface BaseFlightDisplayData {
  flightPhaseDisplay: string;
  altitudeFt: number;
  cabinAltitudeFt: number;
  verticalSpeedFpm: number;
  cabinVsFpm: number;
  differentialPressurePsi: number;
  outflowValvePercent: number;
  cabinPressurePsi: number;
  timestamp: string;
  landingGearStatus: {
    nose: boolean;
    leftMain: boolean;
    rightMain: boolean;
  };
}

export interface PilotSpecificData extends BaseFlightDisplayData {
  altitudeRateFpm: number;
  landingElevationFt: number;
}

export interface TechnicianSpecificData extends BaseFlightDisplayData {
  cabinAltitudeSensor1: number;
  cabinAltitudeSensor2: number;
  cabinAltitudeMismatch: number;
  differentialPressureSensor1: number;
  differentialPressureSensor2: number;
  outflowValveSensor: number;
  outflowValvePrimary: number;
  altitudeRateDM: number;
  altitudeRateFGF: number;
}

export interface ManagerSpecificData extends BaseFlightDisplayData {
  activeAnomaliesCount: number;
  totalFlightTime: string;
  systemHealth: 'normal' | 'degraded' | 'critical';
}

export type UserRole = 'pilot' | 'technician' | 'manager';
