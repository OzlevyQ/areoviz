// src/app/dashboard/page.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import ModernDashboard from '@/components/dashboard/ModernDashboard';
import { UserRole } from '@/types';
import { Suspense } from 'react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { setRole } = useDashboard();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['pilot', 'technician', 'manager'].includes(roleParam)) {
      setRole(roleParam as UserRole);
    }
  }, [searchParams, setRole]);

  return <ModernDashboard />;
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </DashboardProvider>
  );
}
