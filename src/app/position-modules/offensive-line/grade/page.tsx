'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OLIndividualGrading } from '@/modules/position-groups/offensive-line';
import { getPositionModule } from '@/modules/core/position-registry';

export default function OLGradingPage() {
  const [moduleData, setModuleData] = useState<any>(null);
  const [currentPlay, setCurrentPlay] = useState(0);
  const [savedGrades, setSavedGrades] = useState<Record<number, any[]>>({});

  useEffect(() => {
    const module = getPositionModule('OFFENSIVE_LINE');
    setModuleData(module);
  }, []);

  // Mock plays - replace with real imported game data
  const mockPlays = [
    { 
      id: 1, 
      quarter: 1, 
      down: 1, 
      distance: 10, 
      yardLine: 25, 
      description: "1st and 10 at 25 - Inside zone run left for 4 yards",
      playType: "run"
    },
    { 
      id: 2, 
      quarter: 1, 
      down: 2, 
      distance: 6, 
      yardLine: 29, 
      description: "2nd and 6 at 29 - 5-step drop, quick slant to WR for 8 yards", 
      playType: "pass"
    },
    { 
      id: 3, 
      quarter: 1, 
      down: 1, 
      distance: 10, 
      yardLine: 37, 
      description: "1st and 10 at 37 - Power run right, RT and RG double team",
      playType: "run"
    },
    { 
      id: 4, 
      quarter: 1, 
      down: 2, 
      distance: 7, 
      yardLine: 40, 
      description: "2nd and 7 at 40 - 7-step drop, pressure up the middle, sack",
      playType: "pass"
    },
    { 
      id: 5, 
      quarter: 1, 
      down: 3, 
      distance: 15, 
      yardLine: 32, 
      description: "3rd and 15 at 32 - Empty backfield, 5-wide, quick game",
      playType: "pass"
    }
  ];

  const handleSaveGrades = (positionGrades: any[]) => {
    setSavedGrades(prev => ({
      ...prev,
      [currentPlay]: positionGrades
    }));
    
    // TODO: Save to database
    console.log(`Saved grades for play ${currentPlay + 1}:`, positionGrades);
    
    // Auto-advance to next play
    if (currentPlay < mockPlays.length - 1) {
      setCurrentPlay(prev => prev + 1);
    }
  };

  if (!moduleData) {
    return <div className="max-w-6xl mx-auto px-4 py-8">Loading...</div>;
  }

  const currentPlayData = mockPlays[currentPlay];
  const hasGradesForPlay = savedGrades[currentPlay];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        
        {/* Header & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <moduleData.icon className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Offensive Line Grading</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Play {currentPlay + 1} of {mockPlays.length}
            </Badge>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPlay === 0}
                onClick={() => setCurrentPlay(prev => prev - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"  
                size="sm"
                disabled={currentPlay === mockPlays.length - 1}
                onClick={() => setCurrentPlay(prev => prev + 1)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Play Context */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Play Context</CardTitle>
              {hasGradesForPlay && (
                <Badge className="bg-green-100 text-green-800">
                  ✓ Graded
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600">Quarter</span>
                <div className="font-semibold">{currentPlayData.quarter}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Down & Distance</span>
                <div className="font-semibold">{currentPlayData.down} & {currentPlayData.distance}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Yard Line</span>
                <div className="font-semibold">{currentPlayData.yardLine}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Play Type</span>
                <div className="font-semibold">
                  <Badge variant={currentPlayData.playType === 'pass' ? 'default' : 'secondary'}>
                    {currentPlayData.playType.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Play ID</span>
                <div className="font-semibold">#{currentPlayData.id}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Play Description</h4>
              <p className="text-gray-700">{currentPlayData.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Individual OL Grading */}
        <OLIndividualGrading
          playId={currentPlayData.id.toString()}
          onSave={handleSaveGrades}
          gradingFields={moduleData.defaultConfig.gradingFields}
          availableTags={moduleData.defaultConfig.tags}
        />

        {/* Progress Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Grading Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(savedGrades).length}
                </div>
                <div className="text-sm text-gray-600">Plays Graded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {mockPlays.length - Object.keys(savedGrades).length}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((Object.keys(savedGrades).length / mockPlays.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
