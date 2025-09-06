'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Home, Save, CheckCircle } from 'lucide-react';
import { getPositionModule } from '@/modules/core/position-registry';
import { OLIndividualGrading } from '@/modules/position-groups/offensive-line/components/OLIndividualGrading';
import Link from 'next/link';

export default function GamePositionGradingPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const positionName = params.position as string;
  
  const [gameData, setGameData] = useState<any>(null);
  const [moduleData, setModuleData] = useState<any>(null);
  const [plays, setPlays] = useState<any[]>([]);
  const [currentPlay, setCurrentPlay] = useState(0);
  const [savedGrades, setSavedGrades] = useState<Record<number, any>>({});

  useEffect(() => {
    loadData();
  }, [gameId, positionName]);

  const loadData = async () => {
    // Load game data
    const mockGame = {
      id: gameId,
      homeTeam: 'Michigan',
      awayTeam: 'Ohio State',
      date: '2023-11-25',
      score: '30-24'
    };

    // Load position module
    const moduleId = Object.keys(require('@/modules/core/position-registry').POSITION_MODULES)
      .find(key => require('@/modules/core/position-registry').POSITION_MODULES[key].name === positionName);
    
    const module = moduleId ? getPositionModule(moduleId) : null;

    // Load plays from imported game
    const mockPlays = Array.from({ length: 152 }, (_, i) => ({
      id: i + 1,
      quarter: Math.ceil((i + 1) / 38),
      down: Math.floor(Math.random() * 4) + 1,
      distance: Math.floor(Math.random() * 15) + 1,
      yardLine: Math.floor(Math.random() * 100),
      playType: Math.random() > 0.6 ? 'pass' : 'run',
      description: `${mockGame.homeTeam} ${i + 1}: ${
        Math.random() > 0.6 ? 
        'Pass play - QB drops back, throws to receiver' : 
        'Run play - Handoff to running back'
      }`,
      time: `${Math.floor(Math.random() * 15)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      yardsGained: Math.floor(Math.random() * 20) - 2
    }));

    setGameData(mockGame);
    setModuleData(module);
    setPlays(mockPlays);

    // Load existing grades
    loadExistingGrades();
  };

  const loadExistingGrades = async () => {
    // TODO: Load saved grades from database
    const mockSavedGrades = {
      0: { graded: true },
      5: { graded: true },
      12: { graded: true }
    };
    setSavedGrades(mockSavedGrades);
  };

  const handleSaveGrades = async (positionGrades: any) => {
    // Save grades to database
    const gradeData = {
      gameId,
      playId: plays[currentPlay].id,
      positionGroup: moduleData.id,
      grades: positionGrades,
      timestamp: new Date().toISOString()
    };

    console.log('Saving grades:', gradeData);
    
    // TODO: API call to save grades
    // await fetch(`/api/games/${gameId}/grades`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(gradeData)
    // });

    // Update local state
    setSavedGrades(prev => ({
      ...prev,
      [currentPlay]: { graded: true, data: positionGrades }
    }));

    // Auto-advance to next ungraded play
    const nextUngradedPlay = plays.findIndex((_, index) => 
      index > currentPlay && !savedGrades[index]
    );
    
    if (nextUngradedPlay !== -1) {
      setCurrentPlay(nextUngradedPlay);
    } else if (currentPlay < plays.length - 1) {
      setCurrentPlay(prev => prev + 1);
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

  if (!gameData || !moduleData || !plays.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
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
        
        {/* Header & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/games/${gameId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Game
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <moduleData.icon className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">
                  {moduleData.displayName} - {gameData.homeTeam} vs {gameData.awayTeam}
                </h1>
                <p className="text-gray-600">{gameData.date}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="font-semibold">
                {totalGradedPlays} / {plays.length} ({Math.round(progressPercent)}%)
              </div>
            </div>
            <Badge variant={isCurrentPlayGraded ? "default" : "outline"}>
              Play {currentPlay + 1} {isCurrentPlayGraded && '✓'}
            </Badge>
          </div>
        </div>

        {/* Play Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPlay === 0}
                  onClick={() => setCurrentPlay(prev => prev - 1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToPreviousUngraded}
                  disabled={!plays.slice(0, currentPlay).some((_, i) => !savedGrades[i])}
                >
                  ← Ungraded
                </Button>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">
                  Q{currentPlayData.quarter} • {currentPlayData.time}
                </div>
                <div className="text-sm text-gray-600">
                  {currentPlayData.down} & {currentPlayData.distance} at {currentPlayData.yardLine}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={jumpToNextUngraded}
                  disabled={!plays.slice(currentPlay + 1).some((_, i) => !savedGrades[currentPlay + 1 + i])}
                >
                  Ungraded →
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPlay === plays.length - 1}
                  onClick={() => setCurrentPlay(prev => prev + 1)}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Play Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Play Details</CardTitle>
              {isCurrentPlayGraded && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Graded
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <Badge variant={currentPlayData.playType === 'pass' ? 'default' : 'secondary'}>
                  {currentPlayData.playType.toUpperCase()}
                </Badge>
                {currentPlayData.yardsGained !== undefined && (
                  <Badge variant="outline">
                    {currentPlayData.yardsGained >= 0 ? '+' : ''}{currentPlayData.yardsGained} yards
                  </Badge>
                )}
              </div>
              <p className="text-gray-700 font-medium">{currentPlayData.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Position-Specific Grading Interface */}
        {moduleData.id === 'OFFENSIVE_LINE' && (
          <OLIndividualGrading
            playId={currentPlayData.id.toString()}
            onSave={handleSaveGrades}
            gradingFields={moduleData.defaultConfig.gradingFields}
            availableTags={moduleData.defaultConfig.tags}
          />
        )}

        {/* For other position groups, create similar components */}
        {moduleData.id !== 'OFFENSIVE_LINE' && (
          <Card>
            <CardHeader>
              <CardTitle>{moduleData.displayName} Grading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Grading interface for {moduleData.displayName} coming soon.</p>
                <p className="text-sm mt-2">This will follow the same pattern as OL individual grading.</p>
                <Button 
                  onClick={() => handleSaveGrades({ placeholder: 'graded' })}
                  className="mt-4"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Mark as Graded (Placeholder)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


