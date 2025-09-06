'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Clock, 
  BarChart3,
  Zap,
  Shield,
  Users,
  Flag
} from 'lucide-react';

interface LiveAnalyticsProps {
  gameId: string;
  refreshInterval?: number; // milliseconds
}

interface LiveAnalyticsData {
  totalPlays: number;
  successRate: number;
  goodPlays: number;
  badPlays: number;
  neutralPlays: number;
  topTags: string[];
  recentTrends: string[];
  alerts: string[];
  quarterBreakdown: {
    quarter: number;
    plays: number;
    successRate: number;
    topPerformer: string;
    issues: string[];
  }[];
  positionPerformance: {
    position: string;
    successRate: number;
    totalPlays: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  defensiveTendencies: {
    pattern: string;
    frequency: number;
    lastSeen: string;
    warning: boolean;
  }[];
  formationEffectiveness: {
    formation: string;
    successRate: number;
    usage: number;
    recommendation: string;
  }[];
}

export default function LiveAnalytics({ gameId, refreshInterval = 5000 }: LiveAnalyticsProps) {
  const [analytics, setAnalytics] = useState<LiveAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [gameId, refreshInterval]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/live-game/${gameId}/analytics`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching live analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Unable to load live analytics data.</AlertDescription>
      </Alert>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Analytics</h2>
          <p className="text-muted-foreground">
            Real-time insights and trends • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Zap className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{analytics.totalPlays}</div>
              <div className="text-sm text-muted-foreground">Total Plays</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getSuccessRateColor(analytics.successRate)}`}>
                {analytics.successRate}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analytics.goodPlays}</div>
              <div className="text-sm text-muted-foreground">Good Plays</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{analytics.badPlays}</div>
              <div className="text-sm text-muted-foreground">Bad Plays</div>
            </div>
          </div>

          {/* Success Rate Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Success Rate</span>
              <span className={getSuccessRateColor(analytics.successRate)}>
                {analytics.successRate}%
              </span>
            </div>
            <Progress value={analytics.successRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Coaching Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.alerts.map((alert, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    {alert}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quarter Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quarter Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.quarterBreakdown.map((quarter) => (
              <div key={quarter.quarter} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Q{quarter.quarter}</h4>
                  <Badge variant="outline">{quarter.plays} plays</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className={getSuccessRateColor(quarter.successRate)}>
                      {quarter.successRate}%
                    </span>
                  </div>
                  <Progress value={quarter.successRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Top Performer: {quarter.topPerformer}
                  </div>
                  {quarter.issues.length > 0 && (
                    <div className="text-xs text-red-600">
                      Issues: {quarter.issues.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Position Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Position Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.positionPerformance.map((position) => (
              <div key={position.position} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{position.position}</span>
                  {getTrendIcon(position.trend)}
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getSuccessRateColor(position.successRate)}`}>
                    {position.successRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {position.totalPlays} plays
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Defensive Tendencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Defensive Tendencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.defensiveTendencies.map((tendency, index) => (
              <div key={index} className={`p-3 border rounded ${
                tendency.warning ? 'border-orange-200 bg-orange-50' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{tendency.pattern}</div>
                    <div className="text-sm text-muted-foreground">
                      Frequency: {tendency.frequency}x • Last: {tendency.lastSeen}
                    </div>
                  </div>
                  {tendency.warning && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Warning
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formation Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Formation Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.formationEffectiveness.map((formation) => (
              <div key={formation.formation} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{formation.formation}</span>
                  <Badge variant="outline">{formation.usage} uses</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Success Rate:</span>
                    <span className={getSuccessRateColor(formation.successRate)}>
                      {formation.successRate}%
                    </span>
                  </div>
                  <Progress value={formation.successRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {formation.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.recentTrends.map((trend, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {trend}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Most Used Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.topTags.map((tag, index) => (
              <Badge key={tag} variant="secondary" className="text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
