'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PlayIcon, 
  CalendarIcon,
  TrophyIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function GamesPage() {
  // Mock games data - replace with real data from API
  const games = [
    {
      id: 'game-1',
      homeTeam: 'Michigan',
      awayTeam: 'Ohio State',
      date: '2023-11-25',
      score: '30-24',
      status: 'completed',
      playsGraded: 152,
      totalPlays: 152,
      lastGraded: '2 hours ago'
    },
    {
      id: 'game-2', 
      homeTeam: 'Alabama',
      awayTeam: 'Georgia',
      date: '2023-12-02',
      score: '27-24',
      status: 'completed',
      playsGraded: 89,
      totalPlays: 147,
      lastGraded: '1 day ago'
    },
    {
      id: 'game-3',
      homeTeam: 'Michigan',
      awayTeam: 'Penn State',
      date: '2024-11-16',
      score: null,
      status: 'upcoming',
      playsGraded: 0,
      totalPlays: 0,
      lastGraded: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'upcoming': return 'Upcoming';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          <p className="text-gray-600 mt-2">Select a game to start grading plays</p>
        </div>
        <Link href="/dashboard/data-import">
          <Button>
            <PlayIcon className="h-4 w-4 mr-2" />
            Import New Game
          </Button>
        </Link>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="bg-white border-gray-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  {game.homeTeam} vs {game.awayTeam}
                </CardTitle>
                <Badge className={getStatusColor(game.status)}>
                  {getStatusText(game.status)}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {game.date}
                {game.score && (
                  <span className="font-medium text-gray-900">• {game.score}</span>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress for completed/in-progress games */}
              {(game.status === 'completed' || game.status === 'in-progress') && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Grading Progress</span>
                    <span className="font-medium">
                      {game.playsGraded} / {game.totalPlays} plays
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(game.playsGraded / game.totalPlays) * 100}%` 
                      }}
                    />
                  </div>
                  {game.lastGraded && (
                    <p className="text-xs text-gray-500">
                      Last graded: {game.lastGraded}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {game.status === 'upcoming' ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-3">Game hasn't started yet</p>
                    <Button variant="outline" disabled>
                      <TrophyIcon className="h-4 w-4 mr-2" />
                      Prepare Game
                    </Button>
                  </div>
                ) : (
                  <Link href={`/games/${game.id}`} className="block">
                    <Button className="w-full">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      {game.status === 'completed' ? 'Review Grades' : 'Continue Grading'}
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Quick Stats for completed games */}
              {game.status === 'completed' && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1 text-green-600" />
                    All plays graded
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {games.length === 0 && (
        <Card className="bg-white border-gray-200 rounded-xl shadow-soft">
          <CardContent className="text-center py-12">
            <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Games Yet</h3>
            <p className="text-gray-600 mb-6">
              Import your first game to start grading plays and analyzing performance.
            </p>
            <Link href="/dashboard/data-import">
              <Button>
                <PlayIcon className="h-4 w-4 mr-2" />
                Import Your First Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-xl shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Quick Start Guide</h3>
              <div className="text-blue-800 space-y-2 text-sm">
                <p><strong>1.</strong> Import a game using the Data Import wizard</p>
                <p><strong>2.</strong> Click on a game to select position groups to grade</p>
                <p><strong>3.</strong> Choose "Offensive Line" to start OL grading</p>
                <p><strong>4.</strong> Grade each play using the detailed interface</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
