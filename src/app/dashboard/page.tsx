'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayIcon, 
  ArrowDownTrayIcon, 
  ChartBarIcon, 
  UsersIcon, 
  TrophyIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, description }) => (
  <Card className="bg-white border-gray-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
          {change && (
            <div className="flex items-center space-x-1">
              {trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-success-600" />}
              {trend === 'down' && <ExclamationTriangleIcon className="w-4 h-4 text-destructive-600" />}
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? "text-success-600" : 
                trend === 'down' ? "text-destructive-600" : 
                "text-gray-600"
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
          <div className="text-primary-600">
            {icon}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, href, icon, variant = 'secondary' }) => (
  <Link href={href}>
    <Card className={cn(
      "bg-white border-gray-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer group",
      variant === 'primary' && "border-primary-200 bg-primary-50"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            variant === 'primary' 
              ? "bg-primary-600 text-white group-hover:bg-primary-700" 
              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
          )}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

interface ActivityItemProps {
  type: 'game' | 'import' | 'analysis' | 'system';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'error';
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, title, description, time, status = 'success' }) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'game': return <PlayIcon className="w-4 h-4" />;
      case 'import': return <ArrowDownTrayIcon className="w-4 h-4" />;
      case 'analysis': return <ChartBarIcon className="w-4 h-4" />;
      case 'system': return <CheckCircleIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-success-600';
      case 'pending': return 'text-warning-600';
      case 'error': return 'text-destructive-600';
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3">
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        type === 'game' ? "bg-blue-100 text-blue-600" :
        type === 'import' ? "bg-green-100 text-green-600" :
        type === 'analysis' ? "bg-purple-100 text-purple-600" :
        "bg-gray-100 text-gray-600"
      )}>
        {getTypeIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">{time}</span>
          {status && (
            <Badge 
              variant={status === 'success' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {status}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Games",
      value: "24",
      change: "+3 this week",
      trend: "up" as const,
      icon: <TrophyIcon className="w-6 h-6" />,
      description: "Games analyzed this season"
    },
    {
      title: "Plays Graded",
      value: "2,847",
      change: "+156 today",
      trend: "up" as const,
      icon: <PlayIcon className="w-6 h-6" />,
      description: "Total plays evaluated"
    },
    {
      title: "Success Rate",
      value: "73.2%",
      change: "+2.1% vs last week",
      trend: "up" as const,
      icon: <ArrowTrendingUpIcon className="w-6 h-6" />,
      description: "Overall team performance"
    },
    {
      title: "Active Graders",
      value: "8",
      change: "2 online now",
      trend: "neutral" as const,
      icon: <UsersIcon className="w-6 h-6" />,
      description: "Coaches using system"
    }
  ];

  const quickActions = [
    {
      title: "Grade Games",
      description: "Start grading plays for imported games",
      href: "/games",
      icon: <PlayIcon className="w-6 h-6" />,
      variant: 'primary' as const
    },
    {
      title: "Import Game Data",
      description: "Add external games and plays to analyze",
      href: "/dashboard/data-import",
      icon: <ArrowDownTrayIcon className="w-6 h-6" />
    },
    {
      title: "Start Live Game",
      description: "Begin real-time grading during a game",
      href: "/live-game/create",
      icon: <ClockIcon className="w-6 h-6" />
    },
    {
      title: "Position Modules",
      description: "Configure grading modules for positions",
      href: "/position-modules",
      icon: <UsersIcon className="w-6 h-6" />
    }
  ];

  const recentActivity = [
    {
      type: 'game' as const,
      title: "Michigan vs Ohio State",
      description: "Live game completed - 152 plays graded",
      time: "2 hours ago",
      status: 'success' as const
    },
    {
      type: 'import' as const,
      title: "Data Import Complete",
      description: "SEC Championship game imported successfully",
      time: "4 hours ago",
      status: 'success' as const
    },
    {
      type: 'analysis' as const,
      title: "OL Module Analysis",
      description: "Offensive line performance report generated",
      time: "6 hours ago",
      status: 'success' as const
    },
    {
      type: 'system' as const,
      title: "System Update",
      description: "New grading features available",
      time: "1 day ago",
      status: 'success' as const
    }
  ];

  const upcomingGames = [
    {
      team: "Michigan",
      opponent: "Penn State",
      date: "Nov 16, 2024",
      time: "3:30 PM",
      venue: "Michigan Stadium"
    },
    {
      team: "Michigan",
      opponent: "Maryland",
      date: "Nov 23, 2024",
      time: "12:00 PM",
      venue: "Maryland Stadium"
    },
    {
      team: "Michigan",
      opponent: "Ohio State",
      date: "Nov 30, 2024",
      time: "12:00 PM",
      venue: "Ohio Stadium"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Welcome back, Coach Smith
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Ready to analyze today's performance? Here's what's happening with your team.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
          <Link href="/dashboard/actions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all actions →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200 rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest updates from your team and system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link 
                  href="/dashboard/activity" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Games */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-gray-200 rounded-xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrophyIcon className="w-5 h-5 text-gray-600" />
                <span>Upcoming Games</span>
              </CardTitle>
              <CardDescription>
                Next few games on your schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {upcomingGames.map((game, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {game.team} vs {game.opponent}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {game.date}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{game.time} • {game.venue}</p>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        Prepare
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Opponent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link 
                  href="/dashboard/schedule" 
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View full schedule →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 rounded-xl shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-900 mb-2">Pro Tip: Quick Grading</h3>
              <p className="text-primary-800 mb-3">
                Use the live game interface for real-time grading during games. The quick grading system 
                lets you rate plays from +2 to -2 with just one tap, perfect for sideline use.
              </p>
              <Link href="/live-game/create">
                <Button variant="default" size="sm">
                  Try Live Grading
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
