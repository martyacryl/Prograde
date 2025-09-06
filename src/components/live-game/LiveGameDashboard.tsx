'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  SkipForward, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Trophy,
  Target,
  Zap
} from 'lucide-react';

interface LiveGameDashboardProps {
  gameId: string;
  userRole: 'HEAD_COACH' | 'COORDINATOR' | 'ANALYST';
}

interface LiveGame {
  id: string;
  teamId: string;
  opponentId: string;
  gameDate: string;
  status: string;
  currentQuarter: number;
  currentTime: string;
  teamScore: number;
  opponentScore: number;
  gradingMode: string;
  activeGraders: string[];
  team: { name: string; abbreviation: string };
  opponent: { name: string; abbreviation: string };
}

interface LiveAnalytics {
  totalPlays: number;
  successRate: number;
  goodPlays: number;
  badPlays: number;
  neutralPlays: number;
  topTags: string[];
  recentTrends: string[];
  alerts: string[];
}

export default function LiveGameDashboard({ gameId, userRole }: LiveGameDashboardProps) {
  const [game, setGame] = useState<LiveGame | null>(null);
  const [analytics, setAnalytics] = useState<LiveAnalytics | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameData();
    const interval = setInterval(fetchGameData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [gameId]);

  const fetchGameData = async () => {
    try {
      const [gameResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/live-game/${gameId}`),
        fetch(`/api/live-game/${gameId}/analytics`)
      ]);

      if (gameResponse.ok) {
        const gameData = await gameResponse.json();
        setGame(gameData.game);
        setIsGameActive(gameData.game.status !== 'PRE_GAME' && gameData.game.status !== 'FINAL');
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }
    } catch (error) {
      console.error('Error fetching live game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGameStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/live-game/${gameId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchGameData();
      }
    } catch (error) {
      console.error('Error updating game status:', error);
    }
  };

  const updateScore = async (team: 'team' | 'opponent', points: number) => {
    try {
      const response = await fetch(`/api/live-game/${gameId}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [team === 'team' ? 'teamScore' : 'opponentScore']: points 
        }),
      });

      if (response.ok) {
        fetchGameData();
      }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Game not found or you don't have access.</AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRE_GAME': return 'bg-gray-500';
      case 'QUARTER_1':
      case 'QUARTER_2':
      case 'QUARTER_3':
      case 'QUARTER_4': return 'bg-green-500';
      case 'HALFTIME': return 'bg-yellow-500';
      case 'OVERTIME': return 'bg-orange-500';
      case 'FINAL': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getQuarterLabel = (quarter: number) => {
    switch (quarter) {
      case 1: return '1st Quarter';
      case 2: return '2nd Quarter';
      case 3: return '3rd Quarter';
      case 4: return '4th Quarter';
      default: return `${quarter}th Quarter`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="border-2 border-primary">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {game.team.name} vs {game.opponent.name}
              </CardTitle>
              <CardDescription>
                {new Date(game.gameDate).toLocaleDateString()} • {game.team.abbreviation} vs {game.opponent.abbreviation}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge className={`${getStatusColor(game.status)} text-white`}>
                {game.status.replace('_', ' ')}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {getQuarterLabel(game.currentQuarter)} • {game.currentTime}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Score Display */}
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{game.teamScore}</div>
              <div className="text-sm text-muted-foreground">{game.team.name}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-destructive">{game.opponentScore}</div>
              <div className="text-sm text-muted-foreground">{game.opponent.name}</div>
            </div>
          </div>

          {/* Game Controls */}
          {userRole === 'HEAD_COACH' && (
            <div className="mt-6 space-y-3">
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGameStatus('PRE_GAME')}
                  disabled={game.status === 'PRE_GAME'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Game
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGameStatus('HALFTIME')}
                  disabled={game.status !== 'QUARTER_2'}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Halftime
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateGameStatus('FINAL')}
                  disabled={game.status === 'FINAL'}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  End Game
                </Button>
              </div>

              {/* Score Controls */}
              <div className="flex gap-2 justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{game.team.abbreviation}:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateScore('team', game.teamScore + 6)}
                  >
                    +6
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateScore('team', game.teamScore + 3)}
                  >
                    +3
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateScore('team', game.teamScore + 1)}
                  >
                    +1
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{game.opponent.abbreviation}:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateScore('opponent', game.opponentScore + 6)}
                  >
                    +6
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateScore('opponent', game.opponentScore + 3)}
                  >
                    +3
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateScore('opponent', game.opponentScore + 1)}
                  >
                    +1
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="grading" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grading">Live Grading</TabsTrigger>
          <TabsTrigger value="analytics">Real-time Analytics</TabsTrigger>
          <TabsTrigger value="summary">Game Summary</TabsTrigger>
        </TabsList>

        {/* Live Grading Tab */}
        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Play Grading
              </CardTitle>
              <CardDescription>
                Grade plays in real-time during the game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-16 bg-green-600 hover:bg-green-700">
                      <Target className="h-6 w-6 mr-2" />
                      Good Play
                    </Button>
                    <Button className="h-16 bg-red-600 hover:bg-red-700">
                      <AlertTriangle className="h-6 w-6 mr-2" />
                      Bad Play
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm">+2</Button>
                    <Button variant="outline" size="sm">+1</Button>
                    <Button variant="outline" size="sm">0</Button>
                    <Button variant="outline" size="sm">-1</Button>
                    <Button variant="outline" size="sm">-2</Button>
                    <Button variant="outline" size="sm">Skip</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Pressure', 'Big Play', 'Penalty', 'Turnover', 'Sack', 'TD'].map((tag) => (
                      <Button key={tag} variant="outline" size="sm">
                        {tag}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Recent Plays</h5>
                    <div className="text-xs text-muted-foreground">
                      {analytics?.totalPlays || 0} plays graded • Last updated: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Live Analytics
              </CardTitle>
              <CardDescription>
                Real-time insights and trends during the game
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {analytics && (
                <>
                  {/* Performance Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{analytics.totalPlays}</div>
                      <div className="text-sm text-muted-foreground">Total Plays</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.successRate}%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{analytics.goodPlays}</div>
                      <div className="text-sm text-muted-foreground">Good Plays</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{analytics.badPlays}</div>
                      <div className="text-sm text-muted-foreground">Bad Plays</div>
                    </div>
                  </div>

                  {/* Success Rate Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Success Rate</span>
                      <span>{analytics.successRate}%</span>
                    </div>
                    <Progress value={analytics.successRate} className="h-2" />
                  </div>

                  {/* Top Tags */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Most Used Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {analytics.topTags.map((tag, index) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recent Trends */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Trends</h4>
                    <div className="space-y-1">
                      {analytics.recentTrends.map((trend, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {trend}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alerts */}
                  {analytics.alerts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-orange-600">Alerts</h4>
                      <div className="space-y-1">
                        {analytics.alerts.map((alert, index) => (
                          <Alert key={index} className="border-orange-200 bg-orange-50">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-orange-800">
                              {alert}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Game Summary
              </CardTitle>
              <CardDescription>
                Overview and key statistics from the game
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Game Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant="outline">{game.status.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quarter:</span>
                      <span>{getQuarterLabel(game.currentQuarter)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span>{game.currentTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grading Mode:</span>
                      <span>{game.gradingMode}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Active Graders</h4>
                  <div className="space-y-2">
                    {game.activeGraders.length > 0 ? (
                      game.activeGraders.map((graderId, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Grader {index + 1}</span>
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No active graders</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
