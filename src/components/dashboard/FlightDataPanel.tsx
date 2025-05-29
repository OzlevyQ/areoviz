// src/components/dashboard/FlightDataPanel.tsx

'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import PilotFlightData from './PilotFlightData';
import TechnicianFlightData from './TechnicianFlightData';
import ManagerFlightData from './ManagerFlightData';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PilotSpecificData, TechnicianSpecificData, ManagerSpecificData } from '@/types';

export default function FlightDataPanel() {
  const { getCurrentDisplayData, role } = useDashboard();
  const displayData = getCurrentDisplayData();

  if (!displayData) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Loading flight data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderRoleSpecificData = () => {
    switch (role) {
      case 'pilot':
        return <PilotFlightData data={displayData as PilotSpecificData} />;
      case 'technician':
        return <TechnicianFlightData data={displayData as TechnicianSpecificData} />;
      case 'manager':
        return <ManagerFlightData data={displayData as ManagerSpecificData} />;
      default:
        return null;
    }
  };

  const getRoleGradient = () => {
    switch (role) {
      case 'pilot':
        return 'from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800';
      case 'technician':
        return 'from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-800';
      case 'manager':
        return 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800';
      default:
        return '';
    }
  };

  return (
    <Card className={`h-full bg-gradient-to-br ${getRoleGradient()} shadow-xl`}>
      <ScrollArea className="h-full">
        <CardContent className="p-6">
          {renderRoleSpecificData()}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
