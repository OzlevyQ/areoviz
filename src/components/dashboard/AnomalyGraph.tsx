// src/components/dashboard/AnomalyGraph.tsx

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  ConnectionMode,
} from 'react-flow-renderer';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Anomaly } from '@/types';
import { getSeverityColor } from '@/lib/utils';

// Custom node component for system parameters
const SystemNode = ({ data }: NodeProps) => {
  const isAffected = data.isAffected || false;
  const severity = data.severity || 'normal';
  
  const getNodeStyle = () => {
    if (!isAffected) return 'bg-gray-100 dark:bg-gray-800 border-gray-300';
    
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 border-red-500';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 border-orange-500';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-lg border-2 ${getNodeStyle()} transition-all`}>
      <Handle type="target" position={Position.Top} />
      <div className="text-xs font-medium">{data.label}</div>
      {data.value !== undefined && (
        <div className="text-xs text-muted-foreground mt-1">{data.value}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Custom node component for anomalies
const AnomalyNode = ({ data }: NodeProps) => {
  const { setSelectedAnomaly } = useDashboard();
  
  const handleClick = () => {
    setSelectedAnomaly(data.anomaly);
  };

  return (
    <div 
      className={`px-3 py-2 rounded-lg cursor-pointer ${getSeverityColor(data.severity)} border-2`}
      onClick={handleClick}
    >
      <div className="text-xs font-semibold">{data.label}</div>
      <Badge className="mt-1 text-xs" variant="outline">
        {data.severity.toUpperCase()}
      </Badge>
    </div>
  );
};

const nodeTypes = {
  system: SystemNode,
  anomaly: AnomalyNode,
};

export default function AnomalyGraph() {
  const { systemConnections, activeAnomalies, currentRecord } = useDashboard();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Create nodes and edges based on system connections and anomalies
  useEffect(() => {
    if (!currentRecord) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const nodeSet = new Set<string>();

    // Create system parameter nodes
    systemConnections.forEach((connection) => {
      [connection.source, connection.target].forEach((param) => {
        if (!nodeSet.has(param)) {
          nodeSet.add(param);
          
          // Check if this parameter is affected by any anomaly
          const affectedAnomaly = activeAnomalies.find(
            a => a.affectedParameters.includes(param)
          );
          
          // Get the current value of this parameter if available
          const value = currentRecord[param as keyof typeof currentRecord];
          
          newNodes.push({
            id: param,
            type: 'system',
            position: { 
              x: Math.random() * 600 + 100, 
              y: Math.random() * 400 + 100 
            },
            data: {
              label: param.replace(/_/g, ' '),
              value: typeof value === 'number' ? value.toFixed(2) : value,
              isAffected: !!affectedAnomaly,
              severity: affectedAnomaly?.severity || 'normal'
            }
          });
        }
      });

      // Create edge for system connection
      newEdges.push({
        id: `${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#666', strokeWidth: 2 },
        label: connection.label,
        labelStyle: { fontSize: 10 }
      });
    });

    // Create anomaly nodes and connect them to affected parameters
    activeAnomalies.forEach((anomaly, index) => {
      const anomalyNodeId = `anomaly-${anomaly.id}`;
      
      newNodes.push({
        id: anomalyNodeId,
        type: 'anomaly',
        position: { 
          x: 50, 
          y: 50 + index * 100 
        },
        data: {
          label: anomaly.type.replace(/_/g, ' ').toUpperCase(),
          severity: anomaly.severity,
          anomaly: anomaly
        }
      });

      // Connect anomaly to affected parameters
      anomaly.affectedParameters.forEach((param) => {
        if (nodeSet.has(param)) {
          newEdges.push({
            id: `${anomalyNodeId}-${param}`,
            source: anomalyNodeId,
            target: param,
            type: 'straight',
            animated: true,
            style: { 
              stroke: anomaly.severity === 'critical' ? '#ef4444' : 
                     anomaly.severity === 'high' ? '#f97316' :
                     anomaly.severity === 'medium' ? '#eab308' : '#3b82f6',
              strokeWidth: 2,
              strokeDasharray: '5 5'
            }
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [systemConnections, activeAnomalies, currentRecord, setNodes, setEdges]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">System Anomaly Graph</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
