// src/components/dashboard/AnomalyList.tsx

'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { formatDateTime, getSeverityColor } from '@/lib/utils';
import { Anomaly } from '@/types';

export default function AnomalyList() {
  const { activeAnomalies, selectedAnomaly, setSelectedAnomaly } = useDashboard();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="h-4 w-4" />;
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleAnomalyClick = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
  };

  if (activeAnomalies.length === 0) {
    return (
      <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Active Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <AlertCircle className="h-12 w-12 text-green-500 mx-auto mb-3 relative" />
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">No active anomalies detected</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">All systems operating normally ✨</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Active Anomalies
          </CardTitle>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            {activeAnomalies.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-4 space-y-3">
            {activeAnomalies.map((anomaly) => (
              <Card
                key={anomaly.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                  selectedAnomaly?.id === anomaly.id
                    ? 'ring-2 ring-purple-500 shadow-purple-200 dark:shadow-purple-900/50'
                    : ''
                } ${
                  anomaly.severity === 'critical' 
                    ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-300 dark:border-red-800'
                    : anomaly.severity === 'high'
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-300 dark:border-orange-800'
                    : anomaly.severity === 'medium'
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-300 dark:border-yellow-800'
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-300 dark:border-blue-800'
                }`}
                onClick={() => handleAnomalyClick(anomaly)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`${getSeverityColor(anomaly.severity)} p-1 rounded`}>
                        {getSeverityIcon(anomaly.severity)}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getSeverityColor(anomaly.severity)}
                      >
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(anomaly.timestamp)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-1">{anomaly.description}</h4>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {anomaly.affectedSystems.map((system, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {system}
                      </Badge>
                    ))}
                  </div>

                  {anomaly.status && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <Badge 
                        variant="outline" 
                        className={
                          anomaly.status === 'active' 
                            ? 'text-red-600 border-red-600' 
                            : anomaly.status === 'acknowledged'
                            ? 'text-yellow-600 border-yellow-600'
                            : 'text-green-600 border-green-600'
                        }
                      >
                        {anomaly.status}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
