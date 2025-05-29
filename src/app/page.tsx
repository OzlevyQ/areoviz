// src/app/page.tsx

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Wrench, BarChart3, ArrowRight, Shield, Bot, AlertCircle } from 'lucide-react';

export default function Home() {
  const roles = [
    {
      id: 'pilot',
      title: 'Pilot',
      description: 'Access real-time flight data and operational insights for safe and efficient flight operations.',
      icon: Plane,
      color: 'text-pilot',
      bgColor: 'bg-pilot/10',
      borderColor: 'border-pilot/20',
      features: ['Real-time flight parameters', 'System status overview', 'Immediate action advisories']
    },
    {
      id: 'technician',
      title: 'Technician',
      description: 'Detailed system diagnostics and sensor data for maintenance and troubleshooting.',
      icon: Wrench,
      color: 'text-technician',
      bgColor: 'bg-technician/10',
      borderColor: 'border-technician/20',
      features: ['Sensor diagnostics', 'Anomaly root cause analysis', 'Maintenance recommendations']
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'High-level operational overview and business intelligence for strategic decisions.',
      icon: BarChart3,
      color: 'text-manager',
      bgColor: 'bg-manager/10',
      borderColor: 'border-manager/20',
      features: ['Operational KPIs', 'Cost impact analysis', 'Fleet performance metrics']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4" variant="secondary">
            <Bot className="h-3 w-3 mr-1" />
            AI-Powered Aviation Dashboard
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AreoVizN AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced real-time flight data monitoring, anomaly detection, and AI-driven advisory system 
            designed to enhance aviation safety and operational efficiency.
          </p>
          <div className="flex items-center justify-center gap-4 mb-12">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Launch Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">
                Documentation
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Live flight data streaming with instant anomaly detection
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">AI Advisory</h3>
            <p className="text-sm text-muted-foreground">
              Intelligent recommendations tailored to your role
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Enhanced Safety</h3>
            <p className="text-sm text-muted-foreground">
              Proactive anomaly detection for safer operations
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Choose Your Role
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id} 
                  className={`relative overflow-hidden transition-all hover:shadow-lg hover:scale-105 ${role.borderColor} border-2`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 ${role.bgColor} rounded-full -mr-16 -mt-16 opacity-20`} />
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${role.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${role.bgColor.replace('/10', '')}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      asChild
                    >
                      <Link href={`/dashboard?role=${role.id}`}>
                        Access {role.title} Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>© 2025 AreoVizN AI. Advanced Aviation Dashboard System.</p>
        </footer>
      </section>
    </div>
  );
}
