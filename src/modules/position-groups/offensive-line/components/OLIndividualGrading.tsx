'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, User, Save } from 'lucide-react';

interface OLLineupPosition {
  position: string;
  playerNumber?: string;
  playerName?: string;
  grades: Record<string, any>;
  tags: string[];
  notes?: string;
}

interface OLIndividualGradingProps {
  playId: string;
  onSave: (positionGrades: OLLineupPosition[]) => void;
  gradingFields: any[];
  availableTags: string[];
}

export function OLIndividualGrading({ 
  playId, 
  onSave, 
  gradingFields, 
  availableTags 
}: OLIndividualGradingProps) {
  
  // Default OL lineup
  const [lineup, setLineup] = useState<OLLineupPosition[]>([
    { position: 'LT', grades: {}, tags: [] },
    { position: 'LG', grades: {}, tags: [] },
    { position: 'C', grades: {}, tags: [] },
    { position: 'RG', grades: {}, tags: [] },
    { position: 'RT', grades: {}, tags: [] }
  ]);

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionType, setNewPositionType] = useState('');

  // Available additional positions
  const additionalPositions = ['TE6', 'OL6', 'FB', 'WR6', 'RB6'];

  const addPosition = () => {
    if (!newPositionType) return;
    
    const newPosition: OLLineupPosition = {
      position: newPositionType,
      grades: {},
      tags: []
    };
    
    setLineup([...lineup, newPosition]);
    setNewPositionType('');
    setShowAddPosition(false);
  };

  const removePosition = (index: number) => {
    if (lineup.length <= 5) return; // Don't allow removing core 5
    setLineup(lineup.filter((_, i) => i !== index));
  };

  const updateGrade = (positionIndex: number, fieldId: string, value: any) => {
    setLineup(prev => prev.map((pos, i) => 
      i === positionIndex 
        ? { ...pos, grades: { ...pos.grades, [fieldId]: value } }
        : pos
    ));
  };

  const updatePlayerInfo = (positionIndex: number, field: 'playerNumber' | 'playerName', value: string) => {
    setLineup(prev => prev.map((pos, i) => 
      i === positionIndex ? { ...pos, [field]: value } : pos
    ));
  };

  const toggleTag = (positionIndex: number, tag: string) => {
    setLineup(prev => prev.map((pos, i) => 
      i === positionIndex 
        ? { 
            ...pos, 
            tags: pos.tags.includes(tag) 
              ? pos.tags.filter(t => t !== tag)
              : [...pos.tags, tag]
          }
        : pos
    ));
  };

  const updateNotes = (positionIndex: number, notes: string) => {
    setLineup(prev => prev.map((pos, i) => 
      i === positionIndex ? { ...pos, notes } : pos
    ));
  };

  const handleSave = () => {
    onSave(lineup);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Grade Each Lineman</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{lineup.length} Positions</Badge>
          {!showAddPosition ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPosition(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Position
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={newPositionType} onValueChange={setNewPositionType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {additionalPositions.map(pos => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addPosition}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddPosition(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Individual Position Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {lineup.map((position, index) => (
          <Card key={`${position.position}-${index}`} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-600 rounded p-2">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold">{position.position}</div>
                    {position.playerName && (
                      <div className="text-sm text-gray-600">{position.playerName}</div>
                    )}
                  </div>
                </CardTitle>
                
                {index >= 5 && ( // Only show remove for additional positions
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePosition(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              
              {/* Player Info */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Jersey #"
                  value={position.playerNumber || ''}
                  onChange={(e) => updatePlayerInfo(index, 'playerNumber', e.target.value)}
                  className="text-sm"
                />
                <Input
                  placeholder="Player Name"
                  value={position.playerName || ''}
                  onChange={(e) => updatePlayerInfo(index, 'playerName', e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Grading Fields */}
              {gradingFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'grade' && (
                    <div className="flex gap-1">
                      {[-2, -1, 0, 1, 2].map((grade) => (
                        <Button
                          key={grade}
                          variant={position.grades[field.id] === grade ? "default" : "outline"}
                          size="sm"
                          className={`flex-1 h-8 text-xs font-bold ${
                            position.grades[field.id] === grade && (
                              grade === 2 ? 'bg-green-500' :
                              grade === 1 ? 'bg-green-400' :
                              grade === 0 ? 'bg-yellow-400' :
                              grade === -1 ? 'bg-red-400' :
                              'bg-red-500'
                            )
                          }`}
                          onClick={() => updateGrade(index, field.id, grade)}
                        >
                          {grade > 0 ? `+${grade}` : grade}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {field.type === 'boolean' && (
                    <div className="flex gap-2">
                      <Button
                        variant={position.grades[field.id] === true ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => updateGrade(index, field.id, true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={position.grades[field.id] === false ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => updateGrade(index, field.id, false)}
                      >
                        No
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Tags */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {availableTags.slice(0, 4).map((tag) => ( // Show first 4 tags
                    <Badge
                      key={tag}
                      variant={position.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(index, tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <textarea
                placeholder="Notes for this lineman..."
                value={position.notes || ''}
                onChange={(e) => updateNotes(index, e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded h-16 resize-none"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} size="lg" className="px-8">
          <Save className="h-4 w-4 mr-2" />
          Save All OL Grades
        </Button>
      </div>
    </div>
  );
}


