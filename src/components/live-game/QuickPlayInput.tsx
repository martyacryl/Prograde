'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mic, 
  MicOff, 
  Target, 
  AlertTriangle, 
  Minus, 
  Plus, 
  SkipForward,
  Save,
  Undo,
  Clock,
  Hash,
  MapPin
} from 'lucide-react';

interface QuickPlayInputProps {
  gameId: string;
  onPlaySubmit: (play: LivePlayData) => void;
  currentQuarter: number;
  currentTime: string;
  isRecording: boolean;
  onToggleRecording: () => void;
}

interface LivePlayData {
  quarter: number;
  time: string;
  down?: number;
  distance?: number;
  yardLine?: number;
  playType?: string;
  quickGrade: number;
  tags: string[];
  notes?: string;
  voiceNote?: string;
}

const QUICK_TAGS = [
  'Pressure', 'Big Play', 'Penalty', 'Turnover', 'Sack', 'TD',
  'Blitz', 'Coverage', 'Run Stop', 'Pass Rush', 'Blocking', 'Tackling'
];

const PLAY_TYPES = [
  'RUSH', 'PASS', 'PUNT', 'FIELD_GOAL', 'KICKOFF', 'EXTRA_POINT',
  'SAFETY', 'PENALTY', 'TIMEOUT', 'CHALLENGE'
];

export default function QuickPlayInput({ 
  gameId, 
  onPlaySubmit, 
  currentQuarter, 
  currentTime,
  isRecording,
  onToggleRecording 
}: QuickPlayInputProps) {
  const [playData, setPlayData] = useState<LivePlayData>({
    quarter: currentQuarter,
    time: currentTime,
    quickGrade: 0,
    tags: [],
    notes: ''
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastPlayNumber, setLastPlayNumber] = useState(0);
  const [undoStack, setUndoStack] = useState<LivePlayData[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update current quarter and time when they change
  useEffect(() => {
    setPlayData(prev => ({
      ...prev,
      quarter: currentQuarter,
      time: currentTime
    }));
  }, [currentQuarter, currentTime]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
    } else {
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingTime(0);
      }
    }

    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [isRecording]);

  const handleQuickGrade = (grade: number) => {
    setPlayData(prev => ({ ...prev, quickGrade: grade }));
  };

  const toggleTag = (tag: string) => {
    setPlayData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = () => {
    if (playData.quickGrade === 0 && playData.tags.length === 0) {
      return; // Don't submit empty plays
    }

    // Save to undo stack
    setUndoStack(prev => [...prev, { ...playData }]);

    // Submit the play
    onPlaySubmit(playData);

    // Reset form
    setPlayData({
      quarter: currentQuarter,
      time: currentTime,
      quickGrade: 0,
      tags: [],
      notes: ''
    });

    // Increment play number
    setLastPlayNumber(prev => prev + 1);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastPlay = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setPlayData(lastPlay);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade: number) => {
    if (grade > 0) return 'bg-green-600 hover:bg-green-700';
    if (grade < 0) return 'bg-red-600 hover:bg-red-700';
    return 'bg-gray-600 hover:bg-gray-700';
  };

  const getGradeLabel = (grade: number) => {
    switch (grade) {
      case 2: return 'Excellent';
      case 1: return 'Good';
      case 0: return 'Neutral';
      case -1: return 'Poor';
      case -2: return 'Terrible';
      default: return 'Select Grade';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Play Info */}
      <Card className="border-2 border-primary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Play #{lastPlayNumber + 1}</span>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Q{currentQuarter} {currentTime}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Grade Buttons */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Quick Grade</Label>
            <div className="grid grid-cols-5 gap-2">
              {[-2, -1, 0, 1, 2].map((grade) => (
                <Button
                  key={grade}
                  className={`h-16 text-lg font-bold ${getGradeColor(grade)} ${
                    playData.quickGrade === grade ? 'ring-4 ring-blue-400' : ''
                  }`}
                  onClick={() => handleQuickGrade(grade)}
                >
                  {grade > 0 ? '+' : ''}{grade}
                </Button>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {getGradeLabel(playData.quickGrade)}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-20 bg-green-600 hover:bg-green-700 text-lg font-bold"
              onClick={() => handleQuickGrade(2)}
            >
              <Target className="h-8 w-8 mr-2" />
              Good Play
            </Button>
            <Button
              className="h-20 bg-red-600 hover:bg-red-700 text-lg font-bold"
              onClick={() => handleQuickGrade(-2)}
            >
              <AlertTriangle className="h-8 w-8 mr-2" />
              Bad Play
            </Button>
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Tags</Label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_TAGS.slice(0, 6).map((tag) => (
                <Button
                  key={tag}
                  variant={playData.tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  className="h-12 text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_TAGS.slice(6).map((tag) => (
                <Button
                  key={tag}
                  variant={playData.tags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  className="h-12 text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Voice Recording */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Voice Note</Label>
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={onToggleRecording}
                className="w-20"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    Record
                  </>
                )}
              </Button>
            </div>
            {isRecording && (
              <div className="text-center text-sm text-red-600">
                Recording: {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Advanced Options Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Down</Label>
                  <Select
                    value={playData.down?.toString() || ''}
                    onValueChange={(value) => setPlayData(prev => ({ 
                      ...prev, 
                      down: value ? parseInt(value) : undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Down" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((down) => (
                        <SelectItem key={down} value={down.toString()}>
                          {down}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Distance</Label>
                  <Input
                    type="number"
                    placeholder="Yards"
                    value={playData.distance || ''}
                    onChange={(e) => setPlayData(prev => ({ 
                      ...prev, 
                      distance: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Yard Line</Label>
                <Input
                  type="number"
                  placeholder="Yard line (0-100)"
                  value={playData.yardLine || ''}
                  onChange={(e) => setPlayData(prev => ({ 
                    ...prev, 
                    yardLine: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Play Type</Label>
                <Select
                  value={playData.playType || ''}
                  onValueChange={(value) => setPlayData(prev => ({ ...prev, playType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select play type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  placeholder="Additional notes..."
                  value={playData.notes || ''}
                  onChange={(e) => setPlayData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="flex-1"
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={playData.quickGrade === 0 && playData.tags.length === 0}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Submit Play
            </Button>
          </div>

          {/* Selected Tags Display */}
          {playData.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Selected Tags:</Label>
              <div className="flex flex-wrap gap-1">
                {playData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
