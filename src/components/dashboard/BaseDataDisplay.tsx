// src/components/dashboard/BaseDataDisplay.tsx

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber, formatDateTime } from '@/lib/utils';
import { BaseFlightDisplayData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BaseDataDisplayProps {
  data: BaseFlightDisplayData;
  roleColor: string;
}

export default function BaseDataDisplay({ data, roleColor }: BaseDataDisplayProps) {
  const getGearStatus = () => {
    const { nose, leftMain, rightMain } = data.landingGearStatus;
    if (nose && leftMain && rightMain) return { text: 'Down & Locked', color: 'bg-green-500' };
    if (!nose && !leftMain && !rightMain) return { text: 'Up', color: 'bg-blue-500' };
    return { text: 'In Transit', color: 'bg-yellow-500' };
  };

  const gearStatus = getGearStatus();

  return (
    <div className="space-y-4">
      {/* Flight Phase and Time */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={`bg-${roleColor} text-white`} variant="default">
          {data.flightPhaseDisplay}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {formatDateTime(data.timestamp)}
        </span>
      </div>

      <Separator />

      {/* Primary Flight Data */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Altitude</div>
            <div className="text-2xl font-semibold">
              {formatNumber(data.altitudeFt, 0)} ft
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              VS: {formatNumber(data.verticalSpeedFpm, 0)} fpm
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Cabin Altitude</div>
            <div className="text-2xl font-semibold">
              {formatNumber(data.cabinAltitudeFt, 0)} ft
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              VS: {formatNumber(data.cabinVsFpm, 0)} fpm
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pressurization Data */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Differential Pressure</div>
            <div className="text-xl font-semibold">
              {formatNumber(data.differentialPressurePsi, 2)} psi
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Cabin Pressure</div>
            <div className="text-xl font-semibold">
              {formatNumber(data.cabinPressurePsi, 1)} psi
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outflow Valve and Landing Gear */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Outflow Valve</div>
            <div className="text-xl font-semibold">
              {formatNumber(data.outflowValvePercent, 0)}%
            </div>
            <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-${roleColor} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${data.outflowValvePercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Landing Gear</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-3 h-3 rounded-full ${gearStatus.color}`} />
              <span className="text-lg font-semibold">{gearStatus.text}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
