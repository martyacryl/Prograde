'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeamSetupWizard } from '@/components/onboarding/TeamSetupWizard';
import { useAuthStore } from '@/stores/authStore';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  UsersIcon,
  CogIcon,
  PlayIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

interface SetupProgress {
  positionConfigurations: {
    completed: number;
    total: number;
    percentage: number;
  };
  overall: {
    completed: boolean;
    completedAt: string | null;
    currentStep: string | null;
    percentage: number;
  };
}

export default function TeamSetupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [setupProgress, setSetupProgress] = useState<SetupProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.teamId) {
      loadSetupStatus();
    } else {
      router.push('/login');
    }
  }, [user?.teamId, router]);

  const loadSetupStatus = async () => {
    if (!user?.teamId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/team-setup/status?teamId=${user.teamId}`);
      const data = await response.json();

      if (data.success) {
        setSetupProgress(data.setupProgress);
      } else {
        setError(data.error || 'Failed to load setup status');
      }
    } catch (err) {
      console.error('Error loading setup status:', err);
      setError('Failed to load setup status');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    router.push('/dashboard');
  };

  const handleSkipToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white">Loading team setup...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className="w-12 h-12 text-white mr-3" />
            <h1 className="text-3xl font-bold text-white">ProGrade</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Team Setup for {user.team?.name || 'Your Team'}
          </p>
        </div>

        {/* Setup Status Overview */}
        {setupProgress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Setup Status</span>
                <Badge variant={setupProgress.overall.completed ? "default" : "secondary"}>
                  {setupProgress.overall.completed ? "Complete" : "In Progress"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {setupProgress.positionConfigurations.completed}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Position Groups Configured
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {setupProgress.positionConfigurations.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Position Groups
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {setupProgress.overall.percentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Setup Complete
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Setup Wizard */}
        <TeamSetupWizard onComplete={handleSetupComplete} />

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleSkipToDashboard}
            className="text-white border-white hover:bg-white hover:text-slate-900"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Skip to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={loadSetupStatus}
            className="text-white border-white hover:bg-white hover:text-slate-900"
          >
            <ClockIcon className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Need help? Contact support or check our documentation for setup guides.
          </p>
        </div>
      </div>
    </div>
  );
}
