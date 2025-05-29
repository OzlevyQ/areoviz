// src/components/dashboard/PilotFlightData.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PilotSpecificData } from '@/types';
import BaseDataDisplay from './BaseDataDisplay';
import { formatNumber } from '@/lib/utils';
import { Plane, TrendingUp, Compass } from 'lucide-react';

interface PilotFlightDataProps {
  data: PilotSpecificData;
}

export default function PilotFlightData({ data }: PilotFlightDataProps) {
  return (
    <div className="space-y-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-pilot">
          <Plane className="h-5 w-5" />
          Pilot Flight Data
        </CardTitle>
      </CardHeader>

      <BaseDataDisplay data={data} roleColor="pilot" />

      {/* Pilot-specific additional data */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card className="border-pilot/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Altitude Rate
            </div>
            <div className="text-xl font-semibold text-pilot">
              {formatNumber(data.altitudeRateFpm, 0)} fpm
            </div>
          </CardContent>
        </Card>

        <Card className="border-pilot/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Compass className="h-4 w-4" />
              Landing Elevation
            </div>
            <div className="text-xl font-semibold text-pilot">
              {formatNumber(data.landingElevationFt, 0)} ft
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Status Summary */}
      <Card className="bg-pilot/5 border-pilot/20">
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-2">System Status</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pressurization:</span>
              <span className="font-medium text-green-600">Normal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Flight Phase:</span>
              <span className="font-medium">{data.flightPhaseDisplay}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
