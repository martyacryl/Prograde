'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPositionModule } from '@/modules/core/position-registry';

export default function PositionGradingPage() {
  const params = useParams();
  const positionName = params.position as string;
  
  const [moduleData, setModuleData] = useState<any>(null);
  const [currentPlay, setCurrentPlay] = useState(0);
  const [grades, setGrades] = useState<Record<string, any>>({});

  useEffect(() => {
    // Find module by name
    const moduleId = Object.keys(require('@/modules/core/position-registry').POSITION_MODULES)
      .find(key => require('@/modules/core/position-registry').POSITION_MODULES[key].name === positionName);
    
    if (moduleId) {
      const module = getPositionModule(moduleId);
      setModuleData(module);
    }
  }, [positionName]);

  const mockPlays = [
    { id: 1, quarter: 1, down: 1, distance: 10, yardLine: 25, description: "1st and 10 at 25 - Run up the middle for 4 yards" },
    { id: 2, quarter: 1, down: 2, distance: 6, yardLine: 29, description: "2nd and 6 at 29 - Pass complete to WR for 8 yards" },
    { id: 3, quarter: 1, down: 1, distance: 10, yardLine: 37, description: "1st and 10 at 37 - Run to the right for 2 yards" }
  ];

  const handleGradeChange = (fieldId: string, value: any) => {
    setGrades(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const saveAndNext = () => {
    // TODO: Save grades to database
    console.log('Saving grades for play', currentPlay + 1, ':', grades);
    
    if (currentPlay < mockPlays.length - 1) {
      setCurrentPlay(prev => prev + 1);
      setGrades({});
    }
  };

  if (!moduleData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const currentPlayData = mockPlays[currentPlay];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <moduleData.icon className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">{moduleData.displayName} Grading</h1>
          </div>
          <Badge variant="outline">
            Play {currentPlay + 1} of {mockPlays.length}
          </Badge>
        </div>

        {/* Current Play */}
        <Card>
          <CardHeader>
            <CardTitle>Current Play</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
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
                <span className="text-sm text-gray-600">Play ID</span>
                <div className="font-semibold">#{currentPlayData.id}</div>
              </div>
            </div>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">{currentPlayData.description}</p>
          </CardContent>
        </Card>

        {/* Grading Form */}
        <Card>
          <CardHeader>
            <CardTitle>Grade This Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {moduleData.defaultConfig.gradingFields.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <label className="block font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <p className="text-sm text-gray-600">{field.helpText}</p>
                
                {field.type === 'grade' && (
                  <div className="flex gap-2">
                    {[-2, -1, 0, 1, 2].map((grade) => (
                      <Button
                        key={grade}
                        variant={grades[field.id] === grade ? "default" : "outline"}
                        className={`w-16 h-16 text-lg font-bold ${
                          grade === 2 ? 'hover:bg-green-500' :
                          grade === 1 ? 'hover:bg-green-400' :
                          grade === 0 ? 'hover:bg-yellow-400' :
                          grade === -1 ? 'hover:bg-red-400' :
                          'hover:bg-red-500'
                        } ${
                          grades[field.id] === grade && (
                            grade === 2 ? 'bg-green-500' :
                            grade === 1 ? 'bg-green-400' :
                            grade === 0 ? 'bg-yellow-400' :
                            grade === -1 ? 'bg-red-400' :
                            'bg-red-500'
                          )
                        }`}
                        onClick={() => handleGradeChange(field.id, grade)}
                      >
                        {grade > 0 ? `+${grade}` : grade}
                      </Button>
                    ))}
                  </div>
                )}
                
                {field.type === 'boolean' && (
                  <div className="flex gap-2">
                    <Button
                      variant={grades[field.id] === true ? "default" : "outline"}
                      onClick={() => handleGradeChange(field.id, true)}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={grades[field.id] === false ? "default" : "outline"}
                      onClick={() => handleGradeChange(field.id, false)}
                    >
                      No
                    </Button>
                  </div>
                )}
                
                {field.type === 'number' && (
                  <input
                    type="number"
                    min={field.min || 0}
                    max={field.max || 100}
                    value={grades[field.id] || ''}
                    onChange={(e) => handleGradeChange(field.id, parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border rounded-md"
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            disabled={currentPlay === 0}
            onClick={() => setCurrentPlay(prev => prev - 1)}
          >
            Previous Play
          </Button>
          <Button onClick={saveAndNext}>
            {currentPlay === mockPlays.length - 1 ? 'Finish' : 'Save & Next Play'}
          </Button>
        </div>
      </div>
    </div>
  );
}


