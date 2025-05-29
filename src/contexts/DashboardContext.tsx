// src/contexts/DashboardContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  FlightRecord, 
  Anomaly, 
  SystemConnection, 
  UserRole,
  BaseFlightDisplayData,
  PilotSpecificData,
  TechnicianSpecificData,
  ManagerSpecificData
} from '@/types';
import { mockFlightData, systemConnections } from '@/data/mockFlightData';
import { detectAnomalies } from '@/lib/anomaly-detection';
import { flightPhaseMapping } from '@/lib/utils';

interface DashboardContextType {
  // Flight data
  currentRecord: FlightRecord | null;
  rawFlightData: FlightRecord[];
  currentRecordIndex: number;
  
  // Anomalies
  activeAnomalies: Anomaly[];
  selectedAnomaly: Anomaly | null;
  setSelectedAnomaly: (anomaly: Anomaly | null) => void;
  
  // System connections
  systemConnections: SystemConnection[];
  
  // User role
  role: UserRole;
  setRole: (role: UserRole) => void;
  
  // Display data methods
  getCurrentDisplayData: () => BaseFlightDisplayData | PilotSpecificData | TechnicianSpecificData | ManagerSpecificData | null;
  
  // Control methods
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  isPaused: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [currentRecord, setCurrentRecord] = useState<FlightRecord | null>(null);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [activeAnomalies, setActiveAnomalies] = useState<Anomaly[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [role, setRole] = useState<UserRole>('pilot');
  const [isPaused, setIsPaused] = useState(false);
  
  const rawFlightData = mockFlightData;

  // Data simulation effect
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentRecordIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % rawFlightData.length;
        return nextIndex;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, rawFlightData.length]);

  // Update current record when index changes
  useEffect(() => {
    if (rawFlightData[currentRecordIndex]) {
      setCurrentRecord(rawFlightData[currentRecordIndex]);
    }
  }, [currentRecordIndex, rawFlightData]);

  // Detect anomalies when current record changes
  useEffect(() => {
    if (currentRecord) {
      const detectedAnomalies = detectAnomalies(currentRecord);
      setActiveAnomalies(detectedAnomalies);
    }
  }, [currentRecord]);

  const pauseSimulation = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeSimulation = useCallback(() => {
    setIsPaused(false);
  }, []);

  const getCurrentDisplayData = useCallback((): BaseFlightDisplayData | PilotSpecificData | TechnicianSpecificData | ManagerSpecificData | null => {
    if (!currentRecord) return null;

    const baseData: BaseFlightDisplayData = {
      flightPhaseDisplay: flightPhaseMapping[currentRecord.FlightPhase_FW56211] || 'Unknown',
      altitudeFt: currentRecord.Altitude_AD83212,
      cabinAltitudeFt: currentRecord.CabinAltitude_SD69218,
      verticalSpeedFpm: currentRecord.VerticalSpeed_DMF5518,
      cabinVsFpm: currentRecord.CabinVS_SD68222,
      differentialPressurePsi: currentRecord.CabinDifferentialPressure_SD64521,
      outflowValvePercent: currentRecord.OutflowValvePosition_SD6B222,
      cabinPressurePsi: currentRecord.CabinPressure_SD6A420,
      timestamp: currentRecord.DateTime,
      landingGearStatus: {
        nose: currentRecord.NoseLandingGearCompressed_LG11212 === 1,
        leftMain: currentRecord.LHLandingGearCompressed_LG11213 === 1,
        rightMain: currentRecord.RHLandingGearCompressed_LG11214 === 1
      }
    };

    switch (role) {
      case 'pilot':
        const pilotData: PilotSpecificData = {
          ...baseData,
          altitudeRateFpm: currentRecord.AltitudeRate_DM8A518,
          landingElevationFt: currentRecord.LandingElevation_FMAE115
        };
        return pilotData;

      case 'technician':
        const techData: TechnicianSpecificData = {
          ...baseData,
          cabinAltitudeSensor1: currentRecord.CabinAltitude_SD69218,
          cabinAltitudeSensor2: currentRecord.CabinAltitude_PR69218,
          cabinAltitudeMismatch: Math.abs(currentRecord.CabinAltitude_SD69218 - currentRecord.CabinAltitude_PR69218),
          differentialPressureSensor1: currentRecord.CabinDifferentialPressure_SD64521,
          differentialPressureSensor2: currentRecord.CabinDifferentialPressure_SD64515,
          outflowValveSensor: currentRecord.OutflowValvePosition_SD6B222,
          outflowValvePrimary: currentRecord.OutflowValvePosition_PR6B222,
          altitudeRateDM: currentRecord.AltitudeRate_DM8A518,
          altitudeRateFGF: currentRecord.AltitudeRate_FGF5114
        };
        return techData;

      case 'manager':
        const managerData: ManagerSpecificData = {
          ...baseData,
          activeAnomaliesCount: activeAnomalies.length,
          totalFlightTime: '2h 35m', // This would be calculated from actual data
          systemHealth: activeAnomalies.some(a => a.severity === 'critical') ? 'critical' :
                       activeAnomalies.some(a => a.severity === 'high') ? 'degraded' : 'normal'
        };
        return managerData;

      default:
        return baseData;
    }
  }, [currentRecord, role, activeAnomalies]);

  const value: DashboardContextType = {
    currentRecord,
    rawFlightData,
    currentRecordIndex,
    activeAnomalies,
    selectedAnomaly,
    setSelectedAnomaly,
    systemConnections,
    role,
    setRole,
    getCurrentDisplayData,
    pauseSimulation,
    resumeSimulation,
    isPaused
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
