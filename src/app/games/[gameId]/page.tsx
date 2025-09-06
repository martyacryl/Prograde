'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, BarChart3, Settings, Users } from 'lucide-react';
import { getAllPositionModules } from '@/modules/core/position-registry';
import Link from 'next/link';

export default function GameGradingPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  
  const [gameData, setGameData] = useState<any>(null);
  const [plays, setPlays] = useState<any[]>([]);
  const [gradingProgress, setGradingProgress] = useState<Record<string, number>>({});
  
  const positionModules = getAllPositionModules();

  useEffect(() => {
    loadGameData();
  }, [gameId]);

  const loadGameData = async () => {
    // TODO: Load real game data from database
    // For now, use mock data
    const mockGame = {
      id: gameId,
      homeTeam: 'Michigan',
      awayTeam: 'Ohio State',
      date: '2023-11-25',
      score: '30-24',
      status: 'FINAL',
      totalPlays: 152
    };
    
    const mockPlays = Array.from({ length: 152 }, (_, i) => ({
      id: i + 1,
      quarter: Math.ceil((i + 1) / 38),
      down: Math.floor(Math.random() * 4) + 1,
      distance: Math.floor(Math.random() * 15) + 1,
      yardLine: Math.floor(Math.random() * 100),
      playType: Math.random() > 0.6 ? 'pass' : 'run',
      description: `Play ${i + 1} description from imported game data`
    }));
    
    setGameData(mockGame);
    setPlays(mockPlays);
    
    // Load grading progress
    loadGradingProgress();
  };

  const loadGradingProgress = async () => {
    // TODO: Query database for grading progress per position group
    const mockProgress = {
      'OFFENSIVE_LINE': 23,
      'QUARTERBACK': 45,
      'RUNNING_BACK': 12,
      'WIDE_RECEIVER': 8
    };
    setGradingProgress(mockProgress);
  };

  if (!gameData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading game data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        
        {/* Game Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {gameData.homeTeam} vs {gameData.awayTeam}
              </h1>
              <p className="text-gray-600 mt-1">
                {gameData.date} • Final Score: {gameData.score} • {gameData.totalPlays} plays
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              {gameData.status}
            </Badge>
          </div>
        </div>

        {/* Position Group Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Position Groups to Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="offense" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="offense">Offense</TabsTrigger>
                <TabsTrigger value="defense">Defense</TabsTrigger>
                <TabsTrigger value="special">Special Teams</TabsTrigger>
              </TabsList>
              
              <TabsContent value="offense" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {positionModules
                    .filter(module => module.category === 'OFFENSE')
                    .map((module) => (
                      <Card key={module.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-3 text-lg">
                            <div className="bg-blue-100 text-blue-600 rounded p-2">
                              <module.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div>{module.displayName}</div>
                              <div className="text-sm font-normal text-gray-600">
                                {module.positions.join(', ')}
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Progress Indicator */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{gradingProgress[module.id] || 0} / {plays.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${((gradingProgress[module.id] || 0) / plays.length) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Link 
                              href={`/games/${gameId}/grade/${module.name}`}
                              className="flex-1"
                            >
                              <Button className="w-full">
                                <Play className="h-4 w-4 mr-2" />
                                Grade Plays
                              </Button>
                            </Link>
                            <Link href={`/games/${gameId}/analytics/${module.name}`}>
                              <Button variant="outline" size="sm">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="defense" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {positionModules
                    .filter(module => module.category === 'DEFENSE')
                    .map((module) => (
                      <Card key={module.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-3 text-lg">
                            <div className="bg-red-100 text-red-600 rounded p-2">
                              <module.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div>{module.displayName}</div>
                              <div className="text-sm font-normal text-gray-600">
                                {module.positions.join(', ')}
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{gradingProgress[module.id] || 0} / {plays.length}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${((gradingProgress[module.id] || 0) / plays.length) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link 
                              href={`/games/${gameId}/grade/${module.name}`}
                              className="flex-1"
                            >
                              <Button className="w-full">
                                <Play className="h-4 w-4 mr-2" />
                                Grade Plays
                              </Button>
                            </Link>
                            <Link href={`/games/${gameId}/analytics/${module.name}`}>
                              <Button variant="outline" size="sm">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="special" className="mt-6">
                <div className="text-center py-12">
                  <div className="text-gray-500">Special teams modules coming soon.</div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Game Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{plays.length}</div>
                <div className="text-sm text-gray-600">Total Plays</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Object.values(gradingProgress).reduce((sum, val) => sum + val, 0)}
                </div>
                <div className="text-sm text-gray-600">Plays Graded</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Object.keys(gradingProgress).length}
                </div>
                <div className="text-sm text-gray-600">Position Groups</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round((Object.values(gradingProgress).reduce((sum, val) => sum + val, 0) / (plays.length * positionModules.length)) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


