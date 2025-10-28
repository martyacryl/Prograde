'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Home, Save, CheckCircle, Users, Settings } from 'lucide-react';
import { getPositionModule } from '@/modules/core/position-registry';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface Player {
  id: string;
  jerseyNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  headshotUrl?: string;
}

interface GameRoster {
  id: string;
  playerId: string;
  position: string;
  isStarter: boolean;
  player: Player;
}

interface Play {
  id: string;
  quarter: number;
  down: number;
  distance: number;
  yardLine: number;
  description: string;
  playType: string;
  result: {
    yards: number;
    success: boolean;
  };
}

interface PositionGrade {
  position: string;
  playerId?: string;
  playerNumber?: string;
  grades: Record<string, any>;
  notes?: string;
}

export default function GamePositionGradingPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const positionName = params.position as string;
  const { user } = useAuthStore();
  
  const [gameData, setGameData] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [plays, setPlays] = useState<Play[]>([]);
  const [gameRoster, setGameRoster] = useState<GameRoster[]>([]);
  const [currentPlay, setCurrentPlay] = useState(0);
  const [savedGrades, setSavedGrades] = useState<Record<number, PositionGrade[]>>({});
  const [playerAssignments, setPlayerAssignments] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [gameId, positionName, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load position module
      const moduleId = Object.keys(require('@/modules/core/position-registry').POSITION_MODULES)
        .find(key => require('@/modules/core/position-registry').POSITION_MODULES[key].name === positionName);
      
      if (!moduleId) {
        setError('Position module not found');
        return;
      }

      const module = getPositionModule(moduleId);
      setModuleData(module);

      // Load game data
      const gameResponse = await fetch(`/api/games/${gameId}`);
      if (!gameResponse.ok) {
        throw new Error('Failed to load game data');
      }
      const gameData = await gameResponse.json();
      setGameData(gameData.game);

      // Load plays
      setPlays(gameData.plays || []);

      // Load game roster for this position group
      const rosterResponse = await fetch(`/api/game-roster?gameId=${gameId}&positionGroup=${moduleId}`);
      if (rosterResponse.ok) {
        const rosterData = await rosterResponse.json();
        setGameRoster(rosterData.roster || []);
        
        // Initialize player assignments with starters
        const initialAssignments: Record<string, string> = {};
        rosterData.roster?.forEach((roster: GameRoster) => {
          if (roster.isStarter) {
            initialAssignments[roster.position] = roster.playerId;
          }
        });
        setPlayerAssignments(initialAssignments);
      }

      // Load existing grades
      await loadExistingGrades();

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExistingGrades = async () => {
    try {
      const response = await fetch(`/api/grading/position-grade?gameId=${gameId}&positionGroup=${moduleData?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSavedGrades(data.grades || {});
        }
      }
    } catch (error) {
      console.error('Error loading existing grades:', error);
    }
  };

  const handlePlayerAssignment = (position: string, playerId: string) => {
    setPlayerAssignments(prev => ({
      ...prev,
      [position]: playerId
    }));
  };

  const handleGradeChange = (position: string, fieldId: string, value: any) => {
    const playId = plays[currentPlay]?.id;
    if (!playId) return;

    setSavedGrades(prev => {
      const currentGrades = prev[playId] || [];
      const positionIndex = currentGrades.findIndex(g => g.position === position);
      
      if (positionIndex >= 0) {
        // Update existing grade
        const updatedGrades = [...currentGrades];
        updatedGrades[positionIndex] = {
          ...updatedGrades[positionIndex],
          grades: {
            ...updatedGrades[positionIndex].grades,
            [fieldId]: value
          }
        };
        return { ...prev, [playId]: updatedGrades };
      } else {
        // Create new grade
        const playerId = playerAssignments[position];
        const player = gameRoster.find(r => r.playerId === playerId);
        
        const newGrade: PositionGrade = {
          position,
          playerId,
          playerNumber: player?.player.jerseyNumber,
          grades: { [fieldId]: value }
        };
        
        return { ...prev, [playId]: [...currentGrades, newGrade] };
      }
    });
  };

  const saveGrades = async () => {
    if (!user?.teamId || !moduleData) return;

    try {
      setIsSaving(true);
      const playId = plays[currentPlay]?.id;
      const grades = savedGrades[playId] || [];

      if (grades.length === 0) {
        alert('No grades to save');
        return;
      }

      // Save each position grade
      const savePromises = grades.map(grade => 
        fetch('/api/grading/position-grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playId,
            playGradeId: playId, // Using playId as playGradeId for now
            positionGroupId: moduleData.id,
            position: grade.position,
            playerId: grade.playerId,
            playerNumber: grade.playerNumber,
            playerName: gameRoster.find(r => r.playerId === grade.playerId)?.player.firstName + ' ' + 
                       gameRoster.find(r => r.playerId === grade.playerId)?.player.lastName,
            grades: grade.grades,
            notes: grade.notes
          })
        })
      );

      const responses = await Promise.all(savePromises);
      const failedResponses = responses.filter(r => !r.ok);
      
      if (failedResponses.length > 0) {
        throw new Error('Some grades failed to save');
      }

      // Auto-advance to next ungraded play
      const nextUngradedPlay = plays.findIndex((_, index) => 
        index > currentPlay && !savedGrades[index]
      );
      
      if (nextUngradedPlay !== -1) {
        setCurrentPlay(nextUngradedPlay);
      } else if (currentPlay < plays.length - 1) {
        setCurrentPlay(prev => prev + 1);
      }

    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Failed to save grades');
    } finally {
      setIsSaving(false);
    }
  };

  const jumpToNextUngraded = () => {
    const nextUngraded = plays.findIndex((_, index) => 
      index > currentPlay && !savedGrades[index]
    );
    if (nextUngraded !== -1) {
      setCurrentPlay(nextUngraded);
    }
  };

  const jumpToPreviousUngraded = () => {
    for (let i = currentPlay - 1; i >= 0; i--) {
      if (!savedGrades[i]) {
        setCurrentPlay(i);
        return;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  if (error || !gameData || !moduleData || !plays.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Failed to load game data'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push('/position-modules')}>
            Back to Position Modules
          </Button>
        </div>
      </div>
    );
  }

  const currentPlayData = plays[currentPlay];
  const isCurrentPlayGraded = savedGrades[currentPlay];
  const totalGradedPlays = Object.keys(savedGrades).length;
  const progressPercent = (totalGradedPlays / plays.length) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/position-modules')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {moduleData.displayName} Grading
              </h1>
              <p className="text-gray-600">
                {gameData.homeTeam} vs {gameData.awayTeam} - {new Date(gameData.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href={`/games/${gameId}`}>
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Game Overview
              </Button>
            </Link>
            <Link href={`/position-modules/${positionName}/configure`}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Grading Progress</span>
              <span className="text-sm text-gray-600">
                {totalGradedPlays} / {plays.length} plays graded
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Play Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPlay(Math.max(0, currentPlay - 1))}
                  disabled={currentPlay === 0}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    Play {currentPlay + 1} of {plays.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentPlayData.quarter}Q - {currentPlayData.down}&{currentPlayData.distance} at {currentPlayData.yardLine}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPlay(Math.min(plays.length - 1, currentPlay + 1))}
                  disabled={currentPlay === plays.length - 1}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={jumpToPreviousUngraded}
                  disabled={currentPlay === 0}
                >
                  Previous Ungraded
                </Button>
                <Button
                  variant="outline"
                  onClick={jumpToNextUngraded}
                  disabled={currentPlay === plays.length - 1}
                >
                  Next Ungraded
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Play Details */}
        <Card>
          <CardHeader>
            <CardTitle>Play Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Badge variant="outline">Q{currentPlayData.quarter}</Badge>
                <Badge variant="outline">{currentPlayData.down}&{currentPlayData.distance}</Badge>
                <Badge variant="outline">{currentPlayData.yardLine} yard line</Badge>
                <Badge variant="secondary">{currentPlayData.playType}</Badge>
              </div>
              <p className="text-gray-700">{currentPlayData.description}</p>
              <div className="text-sm text-gray-600">
                Result: {currentPlayData.result.yards} yards, {currentPlayData.result.success ? 'Success' : 'No gain'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Player Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {moduleData.positions.map((position: string) => {
                const assignedPlayerId = playerAssignments[position];
                const assignedPlayer = gameRoster.find(r => r.playerId === assignedPlayerId);
                const availablePlayers = gameRoster.filter(r => r.position === position);
                
                return (
                  <div key={position} className="space-y-2">
                    <label className="text-sm font-medium">{position}</label>
                    <Select
                      value={assignedPlayerId || ''}
                      onValueChange={(value) => handlePlayerAssignment(position, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlayers.map(player => (
                          <SelectItem key={player.playerId} value={player.playerId}>
                            #{player.player.jerseyNumber} {player.player.firstName} {player.player.lastName}
                            {player.isStarter && ' (Starter)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Grading Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moduleData.positions.map((position: string) => {
                const assignedPlayerId = playerAssignments[position];
                const assignedPlayer = gameRoster.find(r => r.playerId === assignedPlayerId);
                const currentGrades = savedGrades[plays[currentPlay]?.id]?.find(g => g.position === position)?.grades || {};
                
                return (
                  <div key={position} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{position}</h4>
                      {assignedPlayer && (
                        <Badge variant="outline">
                          #{assignedPlayer.player.jerseyNumber} {assignedPlayer.player.firstName} {assignedPlayer.player.lastName}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {moduleData.defaultConfig?.gradingFields?.map((field: any) => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-medium">{field.label}</label>
                          {field.type === 'grade' ? (
                            <div className="flex gap-1">
                              {Array.from({ length: field.max - field.min + 1 }, (_, i) => {
                                const value = field.min + i;
                                return (
                                  <Button
                                    key={value}
                                    variant={currentGrades[field.id] === value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleGradeChange(position, field.id, value)}
                                  >
                                    {value}
                                  </Button>
                                );
                              })}
                            </div>
                          ) : field.type === 'boolean' ? (
                            <div className="flex gap-2">
                              <Button
                                variant={currentGrades[field.id] === true ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleGradeChange(position, field.id, true)}
                              >
                                Yes
                              </Button>
                              <Button
                                variant={currentGrades[field.id] === false ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleGradeChange(position, field.id, false)}
                              >
                                No
                              </Button>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className="w-full px-3 py-2 border rounded-md"
                              value={currentGrades[field.id] || ''}
                              onChange={(e) => handleGradeChange(position, field.id, e.target.value)}
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={saveGrades}
            disabled={isSaving}
            size="lg"
            className="min-w-[200px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Grades
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}