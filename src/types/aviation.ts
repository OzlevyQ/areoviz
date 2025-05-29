// Aviation-specific types for MongoDB integration

export interface AircraftSystem {
  fuel: {
    level: number;
    consumption: number;
  };
  engine: {
    rpm: number;
    temperature: number;
    oilPressure: number;
  };
  electrical: {
    voltage: number;
    current: number;
  };
  avionics: {
    status: string;
  };
  hydraulics: {
    pressure: number;
  };
  pressurization: {
    cabinAltitude: number;
    differential: number;
  };
}

export interface FlightRecord {
  id: string;
  flightNumber: string;
  timestamp: Date;
  aircraft: string;
  altitude: number;
  speed: number;
  heading: number;
  latitude: number;
  longitude: number;
  status: 'normal' | 'warning' | 'critical';
  verticalSpeed: number;
  groundSpeed: number;
  systems: AircraftSystem;
}

export interface Anomaly {
  id: string;
  flightNumber: string;
  timestamp: Date;
  type: 'cabin_pressure' | 'altitude' | 'engine' | 'electrical' | 'hydraulics' | 'fuel';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  system: string;
  status: 'active' | 'resolved' | 'acknowledged';
  resolvedAt?: Date;
  acknowledgedBy?: string;
  notes?: string;
} 