// src/components/dashboard/ManagerFlightData.tsx

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManagerSpecificData } from '@/types';
import BaseDataDisplay from './BaseDataDisplay';
import { BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ManagerFlightDataProps {
  data: ManagerSpecificData;
}

export default function ManagerFlightData({ data }: ManagerFlightDataProps) {
  const getSystemHealthIcon = () => {
    switch (data.systemHealth) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getSystemHealthColor = () => {
    switch (data.systemHealth) {
      case 'critical':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-manager">
          <BarChart3 className="h-5 w-5" />
          Manager Overview
        </CardTitle>
      </CardHeader>

      <BaseDataDisplay data={data} roleColor="manager" />

      {/* Manager-specific overview cards */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {/* System Health Overview */}
        <Card className="border-manager/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">System Health</h3>
              {getSystemHealthIcon()}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Status</span>
                <Badge className={getSystemHealthColor()}>
                  {data.systemHealth.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Anomalies</span>
                <span className="font-semibold">{data.activeAnomaliesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Flight Time</span>
                <span className="font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {data.totalFlightTime}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Summary */}
        <Card className="bg-manager/5 border-manager/20">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-3">Key Performance Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-manager">98.5%</div>
                <div className="text-xs text-muted-foreground">System Reliability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-manager">0.12</div>
                <div className="text-xs text-muted-foreground">Anomaly Rate/Hr</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operational Summary */}
        <Card className="border-manager/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Operational Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fuel Efficiency:</span>
                <Badge variant="secondary" className="bg-green-500">Optimal</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule Status:</span>
                <Badge variant="secondary" className="bg-green-500">On Time</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance Due:</span>
                <span className="font-medium">152 hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
