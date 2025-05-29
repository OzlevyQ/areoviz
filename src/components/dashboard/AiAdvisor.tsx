// src/components/dashboard/AiAdvisor.tsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  AlertCircle, 
  Wrench, 
  Shield, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { formatDateTime, getRoleColor } from '@/lib/utils';
import { geminiAI } from '@/lib/gemini';
import { Loader2 } from 'lucide-react';

export default function AiAdvisor() {
  const { selectedAnomaly, role, currentRecord } = useDashboard();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeWithAI = useCallback(async () => {
    if (!selectedAnomaly) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await geminiAI.analyzeAnomaly(selectedAnomaly);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to analyze anomaly with AI');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedAnomaly]);

  useEffect(() => {
    if (selectedAnomaly) {
      analyzeWithAI();
    }
  }, [selectedAnomaly, analyzeWithAI]);

  if (!selectedAnomaly) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Advisory
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-5rem)]">
          <div className="text-center">
            <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select an anomaly to view AI analysis</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on any anomaly from the list or graph
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const roleColor = getRoleColor(role);

  const renderPilotAdvice = () => (
    <div className="space-y-4">
      <div className="bg-pilot/10 border border-pilot/20 rounded-lg p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4" />
          Immediate Action Required
        </h3>
        <ul className="space-y-2 text-sm">
          {selectedAnomaly.recommendedActions?.slice(0, 2).map((action, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-pilot mt-0.5 flex-shrink-0" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Operational Impact</h3>
        <p className="text-sm text-muted-foreground">
          {selectedAnomaly.severity === 'critical' 
            ? 'This anomaly requires immediate attention and may affect flight safety. Follow established procedures and consider diverting if necessary.'
            : selectedAnomaly.severity === 'high'
            ? 'Monitor closely and be prepared to take corrective action. May impact passenger comfort or system efficiency.'
            : 'Continue monitoring. No immediate impact on flight operations expected.'}
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="font-medium">Remember to log this event in the flight report</span>
        </div>
      </div>
    </div>
  );

  const renderTechnicianAdvice = () => (
    <div className="space-y-4">
      <div className="bg-technician/10 border border-technician/20 rounded-lg p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Wrench className="h-4 w-4" />
          Technical Analysis
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Root Cause Analysis:</span>
            <p className="text-muted-foreground mt-1">
              {selectedAnomaly.type === 'sensor_mismatch' 
                ? 'Sensor divergence indicates potential calibration drift or sensor degradation. Check sensor history logs for trending.'
                : selectedAnomaly.type === 'high_cabin_vs'
                ? 'Rapid cabin altitude change detected. Possible causes: Outflow valve malfunction, controller logic error, or external pressure disturbance.'
                : selectedAnomaly.type === 'pressure_limit'
                ? 'Differential pressure exceeding design limits. Check pressure relief valves and outflow valve operation.'
                : 'System parameter deviation detected. Review maintenance history and component health monitoring data.'}
            </p>
          </div>

          {selectedAnomaly.currentValues && (
            <div>
              <span className="font-medium">Current Readings:</span>
              <div className="mt-2 space-y-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded p-2">
                {Object.entries(selectedAnomaly.currentValues).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="font-medium">Maintenance Actions:</span>
            <ul className="mt-2 space-y-1">
              {selectedAnomaly.recommendedActions?.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-technician">•</span>
                  <span className="text-muted-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span>Reference: AMM 21-31-00, TSM 21-31-11</span>
        </div>
      </div>
    </div>
  );

  const renderManagerAdvice = () => (
    <div className="space-y-4">
      <div className="bg-manager/10 border border-manager/20 rounded-lg p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4" />
          Executive Summary
        </h3>
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Impact Level:</span>
              <p className="font-semibold capitalize">{selectedAnomaly.severity}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Systems Affected:</span>
              <p className="font-semibold">{selectedAnomaly.affectedSystems.length}</p>
            </div>
          </div>

          <div>
            <span className="font-medium">Operational Impact:</span>
            <p className="text-muted-foreground mt-1">
              {selectedAnomaly.severity === 'critical' || selectedAnomaly.severity === 'high'
                ? 'May result in schedule disruption. Consider maintenance window allocation and potential aircraft substitution.'
                : 'Minimal operational impact expected. Schedule routine maintenance at next available opportunity.'}
            </p>
          </div>

          <div>
            <span className="font-medium">Cost Implications:</span>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Immediate inspection: 2-4 man-hours</li>
              <li>• Potential parts replacement: ${selectedAnomaly.severity === 'critical' ? '5,000-15,000' : '500-2,000'}</li>
              <li>• Downtime estimate: {selectedAnomaly.severity === 'critical' ? '4-8 hours' : '1-2 hours'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">MTBF Impact</div>
            <div className="text-lg font-semibold text-green-600">-2.3%</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-3">
            <div className="text-xs text-muted-foreground">Schedule Risk</div>
            <div className="text-lg font-semibold text-orange-600">Low</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Advisory - {role.charAt(0).toUpperCase() + role.slice(1)} View
          </CardTitle>
          <Badge className={`bg-${roleColor}`}>
            {role.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-6 space-y-4">
            {/* Anomaly Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{selectedAnomaly.description}</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(selectedAnomaly.timestamp)}
                </div>
                <Badge variant="outline" className={selectedAnomaly.severity === 'critical' ? 'text-red-600' : ''}>
                  {selectedAnomaly.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {selectedAnomaly.type.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* AI Analysis Section */}
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Analyzing with AI...</span>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Bot className="h-4 w-4" />
                    AI-Powered Analysis
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{aiAnalysis}</div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Role-specific content as supplementary info */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                    <span>View Role-Specific Guidelines</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="mt-4">
                    {role === 'pilot' && renderPilotAdvice()}
                    {role === 'technician' && renderTechnicianAdvice()}
                    {role === 'manager' && renderManagerAdvice()}
                  </div>
                </details>
              </div>
            ) : (
              <div>
                {/* Fallback to role-specific content if no AI analysis */}
                {role === 'pilot' && renderPilotAdvice()}
                {role === 'technician' && renderTechnicianAdvice()}
                {role === 'manager' && renderManagerAdvice()}
              </div>
            )}

            {/* Common footer */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                AI Advisory generated at {new Date().toLocaleTimeString()} based on current flight data and historical patterns.
              </p>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
