// src/lib/anomaly-detection.ts

import { FlightRecord, Anomaly } from '@/types';

export function detectAnomalies(record: FlightRecord): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const timestamp = record.DateTime;

  // Rule 1: Cabin altitude sensor mismatch
  const cabinAltitudeDiff = Math.abs(record.CabinAltitude_SD69218 - record.CabinAltitude_PR69218);
  if (cabinAltitudeDiff > 200) { // 200 feet threshold
    anomalies.push({
      id: crypto.randomUUID(),
      timestamp,
      type: 'sensor_mismatch',
      description: `Cabin altitude sensor mismatch detected: ${cabinAltitudeDiff.toFixed(0)} ft difference`,
      severity: cabinAltitudeDiff > 500 ? 'high' : 'medium',
      affectedSystems: ['Pressurization', 'Sensor System'],
      affectedParameters: ['CabinAltitude_SD69218', 'CabinAltitude_PR69218'],
      status: 'active',
      currentValues: {
        'Sensor 1 (SD69218)': record.CabinAltitude_SD69218,
        'Sensor 2 (PR69218)': record.CabinAltitude_PR69218,
        'Difference': cabinAltitudeDiff
      },
      recommendedActions: [
        'Cross-check with backup instruments',
        'Monitor for sensor drift',
        'Schedule sensor calibration at next maintenance'
      ]
    });
  }

  // Rule 2: High cabin vertical speed
  const cabinVs = record.CabinVS_SD68222;
  if (Math.abs(cabinVs) > 1000) { // 1000 fpm threshold
    anomalies.push({
      id: crypto.randomUUID(),
      timestamp,
      type: 'high_cabin_vs',
      description: `High cabin vertical speed: ${Math.abs(cabinVs).toFixed(0)} fpm`,
      severity: Math.abs(cabinVs) > 2000 ? 'critical' : 'high',
      affectedSystems: ['Pressurization', 'Passenger Comfort'],
      affectedParameters: ['CabinVS_SD68222'],
      status: 'active',
      currentValues: {
        'Cabin VS': cabinVs,
        'Aircraft Altitude': record.Altitude_AD83212,
        'Outflow Valve': record.OutflowValvePosition_SD6B222
      },
      recommendedActions: [
        'Reduce rate of climb/descent',
        'Check outflow valve operation',
        'Monitor passenger comfort',
        'Verify pressurization schedule'
      ]
    });
  }

  // Rule 3: Differential pressure out of range
  const diffPressure = record.CabinDifferentialPressure_SD64521;
  if (diffPressure > 8.5 || diffPressure < -0.5) {
    anomalies.push({
      id: crypto.randomUUID(),
      timestamp,
      type: 'pressure_limit',
      description: `Differential pressure ${diffPressure > 8.5 ? 'exceeding' : 'below'} limits: ${diffPressure.toFixed(2)} psi`,
      severity: 'critical',
      affectedSystems: ['Pressurization', 'Structural'],
      affectedParameters: ['CabinDifferentialPressure_SD64521', 'CabinDifferentialPressure_SD64515'],
      status: 'active',
      currentValues: {
        'Diff Pressure SD': record.CabinDifferentialPressure_SD64521,
        'Diff Pressure SD2': record.CabinDifferentialPressure_SD64515,
        'Cabin Altitude': record.CabinAltitude_SD69218
      },
      recommendedActions: [
        'Immediate action required',
        'Reduce altitude if safe',
        'Check pressure relief valves',
        'Prepare for possible emergency descent'
      ]
    });
  }

  // Rule 4: Landing gear position check during approach/landing
  const flightPhase = record.FlightPhase_FW56211;
  const gearDown = record.NoseLandingGearCompressed_LG11212 === 1 && 
                   record.LHLandingGearCompressed_LG11213 === 1 && 
                   record.RHLandingGearCompressed_LG11214 === 1;
  
  if ((flightPhase === 7 || flightPhase === 8) && !gearDown && record.Altitude_AD83212 < 5000) {
    anomalies.push({
      id: crypto.randomUUID(),
      timestamp,
      type: 'landing_gear_warning',
      description: 'Landing gear not confirmed down during approach',
      severity: 'critical',
      affectedSystems: ['Landing Gear', 'Flight Control'],
      affectedParameters: ['NoseLandingGearCompressed_LG11212', 'LHLandingGearCompressed_LG11213', 'RHLandingGearCompressed_LG11214'],
      status: 'active',
      currentValues: {
        'Nose Gear': record.NoseLandingGearCompressed_LG11212 === 1 ? 'Down' : 'Up',
        'Left Main': record.LHLandingGearCompressed_LG11213 === 1 ? 'Down' : 'Up',
        'Right Main': record.RHLandingGearCompressed_LG11214 === 1 ? 'Down' : 'Up',
        'Altitude': record.Altitude_AD83212
      },
      recommendedActions: [
        'Verify landing gear position',
        'Execute go-around if necessary',
        'Check hydraulic pressure',
        'Follow landing gear emergency procedures'
      ]
    });
  }

  // Rule 5: Outflow valve position sensor mismatch
  const outflowDiff = Math.abs(record.OutflowValvePosition_SD6B222 - record.OutflowValvePosition_PR6B222);
  if (outflowDiff > 10) { // 10% threshold
    anomalies.push({
      id: crypto.randomUUID(),
      timestamp,
      type: 'valve_sensor_mismatch',
      description: `Outflow valve sensor disagreement: ${outflowDiff.toFixed(1)}% difference`,
      severity: 'medium',
      affectedSystems: ['Pressurization', 'Valve Control'],
      affectedParameters: ['OutflowValvePosition_SD6B222', 'OutflowValvePosition_PR6B222'],
      status: 'active',
      currentValues: {
        'Sensor SD': record.OutflowValvePosition_SD6B222,
        'Sensor PR': record.OutflowValvePosition_PR6B222,
        'Difference': outflowDiff
      },
      recommendedActions: [
        'Monitor valve behavior',
        'Switch to manual control if needed',
        'Schedule valve sensor inspection'
      ]
    });
  }

  return anomalies;
}
