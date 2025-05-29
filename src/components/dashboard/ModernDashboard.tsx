// src/components/dashboard/ModernDashboard.tsx

'use client';

import React from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import FlightDataPanel from './FlightDataPanel';
import AnomalyGraph from './AnomalyGraph';
import AnomalyList from './AnomalyList';
import AiAdvisor from './AiAdvisor';
import AIChatPanel from './AIChatPanel';
import { useDashboard } from '@/contexts/DashboardContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Bell,
  Search,
  User,
  Pause,
  Play,
  Plane,
  Wrench,
  BarChart3,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ModernDashboard() {
  const { role, setRole, isPaused, pauseSimulation, resumeSimulation, activeAnomalies } = useDashboard();

  const getRoleIcon = () => {
    switch (role) {
      case 'pilot':
        return <Plane className="h-4 w-4" />;
      case 'technician':
        return <Wrench className="h-4 w-4" />;
      case 'manager':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'pilot':
        return 'bg-pilot text-white';
      case 'technician':
        return 'bg-technician text-white';
      case 'manager':
        return 'bg-manager text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const criticalAnomaliesCount = activeAnomalies.filter(a => a.severity === 'critical').length;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg blur-lg opacity-75"></div>
              <div className="relative text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AreoVizN AI
              </div>
            </div>
            <Badge className={`${getRoleColor()} shadow-lg`}>
              {getRoleIcon()}
              <span className="ml-1">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
            </Badge>
          </div>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search flight data..."
                className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={isPaused ? resumeSimulation : pauseSimulation}
              title={isPaused ? 'Resume simulation' : 'Pause simulation'}
            >
              {isPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
              title="Notifications"
            >
              <Bell className={`h-4 w-4 ${criticalAnomaliesCount > 0 ? 'text-orange-500 animate-pulse' : ''}`} />
              {criticalAnomaliesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-bounce">
                  {criticalAnomaliesCount}
                </span>
              )}
            </Button>

            <AIChatPanel />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Switch Role
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setRole('pilot')}>
                  <Plane className="mr-2 h-4 w-4" />
                  Pilot View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('technician')}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Technician View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole('manager')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Manager View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <ModeToggle />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="flex-1 p-4">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
          {/* Left Panel - Flight Data */}
          <ResizablePanel defaultSize={25} minSize={20}>
            <FlightDataPanel />
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel - Graph and Anomaly List */}
          <ResizablePanel defaultSize={45}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={65}>
                <AnomalyGraph />
              </ResizablePanel>
              
              <ResizableHandle />
              
              <ResizablePanel defaultSize={35}>
                <AnomalyList />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Panel - AI Advisor & Chat */}
          <ResizablePanel defaultSize={30} minSize={25}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={100}>
                <AiAdvisor />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
