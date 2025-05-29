'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to access your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/user-orders' })}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 