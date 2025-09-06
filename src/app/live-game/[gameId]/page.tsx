'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  Tablet,
  Monitor,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import LiveGameDashboard from '@/components/live-game/LiveGameDashboard';
import QuickPlayInput from '@/components/live-game/QuickPlayInput';
import SidelineGrader from '@/components/live-game/SidelineGrader';
import LiveAnalytics from '@/components/live-game/LiveAnalytics';

interface LiveGamePageProps {
  params: Promise<{ gameId: string }>;
}

export default function LiveGamePage({ params }: LiveGamePageProps) {
  const [gameId, setGameId] = useState<string>('');
  
  useEffect(() => {
    params.then(({ gameId }) => setGameId(gameId));
  }, [params]);
  
  const [activeView, setActiveView] = useState<'dashboard' | 'grading' | 'sideline' | 'analytics'>('dashboard');
  const [isRecording, setIsRecording] = useState(false);
  const [userRole, setUserRole] = useState<'HEAD_COACH' | 'COORDINATOR' | 'ANALYST'>('ANALYST');
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePlaySubmit = async (playData: any) => {
    try {
      const response = await fetch(`/api/live-game/${gameId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playData),
      });

      if (response.ok) {
        console.log('Play submitted successfully');
        // You could add a toast notification here
      } else {
        console.error('Failed to submit play');
      }
    } catch (error) {
      console.error('Error submitting play:', error);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording logic
  };

  if (!gameId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Game</h2>
          <p className="text-gray-600">Please wait while we load the game data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Live Game</h1>
            <p className="text-muted-foreground">Real-time grading and analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Online Status */}
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {/* View Selector */}
            <div className="flex gap-2">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('dashboard')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeView === 'grading' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('grading')}
              >
                <Target className="h-4 w-4 mr-2" />
                Grading
              </Button>
              <Button
                variant={activeView === 'sideline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('sideline')}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Sideline
              </Button>
              <Button
                variant={activeView === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You are currently offline. Data will be synced when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* View Content */}
        {activeView === 'dashboard' && (
          <LiveGameDashboard gameId={gameId} userRole={userRole} />
        )}

        {activeView === 'grading' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Live Play Grading
                </CardTitle>
                <CardDescription>
                  Grade plays in real-time during the game
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickPlayInput
                  gameId={gameId}
                  onPlaySubmit={handlePlaySubmit}
                  currentQuarter={1}
                  currentTime="15:00"
                  isRecording={isRecording}
                  onToggleRecording={toggleRecording}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'sideline' && (
          <SidelineGrader
            gameId={gameId}
            onPlaySubmit={handlePlaySubmit}
            currentQuarter={1}
            currentTime="15:00"
            isOnline={isOnline}
          />
        )}

        {activeView === 'analytics' && (
          <LiveAnalytics gameId={gameId} />
        )}
      </div>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-lg"
          onClick={() => setActiveView('grading')}
        >
          <Target className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
