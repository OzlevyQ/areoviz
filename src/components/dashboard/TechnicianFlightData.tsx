// src/components/dashboard/TechnicianFlightData.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TechnicianSpecificData } from '@/types';
import BaseDataDisplay from './BaseDataDisplay';
import { formatNumber } from '@/lib/utils';
import { Wrench, AlertTriangle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TechnicianFlightDataProps {
  data: TechnicianSpecificData;
}

export default function TechnicianFlightData({ data }: TechnicianFlightDataProps) {
  const getSensorHealthBadge = (mismatch: number, threshold: number) => {
    if (mismatch < threshold * 0.5) return <Badge variant="secondary" className="bg-green-500">Normal</Badge>;
    if (mismatch < threshold) return <Badge variant="secondary" className="bg-yellow-500">Monitor</Badge>;
    return <Badge variant="destructive">Check Required</Badge>;
  };

  return (
    <div className="space-y-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-technician">
          <Wrench className="h-5 w-5" />
          Technician System Data
        </CardTitle>
      </CardHeader>

      <BaseDataDisplay data={data} roleColor="technician" />

      {/* Sensor Comparisons */}
      <Card className="border-technician/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sensor Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Cabin Altitude Sensors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cabin Altitude Sensors</span>
              {getSensorHealthBadge(data.cabinAltitudeMismatch, 200)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">SD69218</div>
                <div className="font-mono">{formatNumber(data.cabinAltitudeSensor1, 0)} ft</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">PR69218</div>
                <div className="font-mono">{formatNumber(data.cabinAltitudeSensor2, 0)} ft</div>
              </div>
            </div>
            {data.cabinAltitudeMismatch > 50 && (
              <div className="flex items-center gap-1 text-xs text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                Mismatch: {formatNumber(data.cabinAltitudeMismatch, 0)} ft
              </div>
            )}
          </div>

          {/* Differential Pressure Sensors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Differential Pressure</span>
              <Badge variant="secondary" className="bg-green-500">Normal</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">SD64521</div>
                <div className="font-mono">{formatNumber(data.differentialPressureSensor1, 2)} psi</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">SD64515</div>
                <div className="font-mono">{formatNumber(data.differentialPressureSensor2, 2)} psi</div>
              </div>
            </div>
          </div>

          {/* Outflow Valve Sensors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Outflow Valve Position</span>
              {getSensorHealthBadge(Math.abs(data.outflowValveSensor - data.outflowValvePrimary), 10)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">SD6B222</div>
                <div className="font-mono">{formatNumber(data.outflowValveSensor, 0)}%</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">PR6B222</div>
                <div className="font-mono">{formatNumber(data.outflowValvePrimary, 0)}%</div>
              </div>
            </div>
          </div>

          {/* Altitude Rate Sensors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Altitude Rate Sources</span>
              <Badge variant="secondary" className="bg-green-500">Consistent</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">DM8A518</div>
                <div className="font-mono">{formatNumber(data.altitudeRateDM, 0)} fpm</div>
              </div>
              <div className="bg-muted rounded p-2">
                <div className="text-muted-foreground">FGF5114</div>
                <div className="font-mono">{formatNumber(data.altitudeRateFGF, 0)} fpm</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
