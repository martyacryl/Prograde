'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShieldCheckIcon, 
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface SetupGuardProps {
  children: React.ReactNode;
}

interface SetupProgress {
  overall: {
    completed: boolean;
    completedAt: string | null;
    currentStep: string | null;
    percentage: number;
  };
}

export function SetupGuard({ children }: SetupGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [setupProgress, setSetupProgress] = useState<SetupProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.teamId) {
      checkSetupStatus();
    } else {
      router.push('/login');
    }
  }, [user?.teamId, router]);

  const checkSetupStatus = async () => {
    if (!user?.teamId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/team-setup/status?teamId=${user.teamId}`);
      const data = await response.json();

      if (data.success) {
        setSetupProgress(data.setupProgress);
        
        // If setup is complete, allow access to dashboard
        if (data.setupProgress.overall.completed) {
          setLoading(false);
          return;
        }
      } else {
        setError(data.error || 'Failed to check setup status');
      }
    } catch (err) {
      console.error('Error checking setup status:', err);
      setError('Failed to check setup status');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSetup = () => {
    router.push('/team-setup');
  };

  const handleSkipSetup = () => {
    // Allow access to dashboard even if setup isn't complete
    setSetupProgress({ overall: { completed: true, completedAt: null, currentStep: null, percentage: 100 } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate-600">Checking team setup...</p>
        </div>
      </div>
    );
  }

  // If setup is complete, render children
  if (setupProgress?.overall.completed) {
    return <>{children}</>;
  }

  // If setup is not complete, show setup prompt
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Team Setup Required</CardTitle>
          <CardDescription>
            Complete your team setup to access the full dashboard features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Your team needs position configurations to start grading plays.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleGoToSetup}
              className="w-full"
            >
              <ArrowRightIcon className="w-4 h-4 mr-2" />
              Complete Team Setup
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleSkipSetup}
              className="w-full"
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Skip for Now
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              You can complete setup later from the settings menu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
