'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Maximize2, 
  Minimize2, 
  Target, 
  AlertTriangle, 
  SkipForward,
  Save,
  Undo,
  Clock,
  Battery,
  Wifi,
  WifiOff,
  Sun,
  Moon
} from 'lucide-react';

interface SidelineGraderProps {
  gameId: string;
  onPlaySubmit: (play: SidelinePlayData) => void;
  currentQuarter: number;
  currentTime: string;
  isOnline: boolean;
}

interface SidelinePlayData {
  quarter: number;
  time: string;
  quickGrade: number;
  tags: string[];
  notes?: string;
}

const SIDELINE_TAGS = [
  'Pressure', 'Big Play', 'Penalty', 'Turnover', 'Sack', 'TD',
  'Blitz', 'Coverage', 'Run Stop', 'Pass Rush', 'Blocking', 'Tackling',
  'Holding', 'False Start', 'Offsides', 'Pass Interference'
];

export default function SidelineGrader({ 
  gameId, 
  onPlaySubmit, 
  currentQuarter, 
  currentTime,
  isOnline 
}: SidelineGraderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [currentPlay, setCurrentPlay] = useState<SidelinePlayData>({
    quarter: currentQuarter,
    time: currentTime,
    quickGrade: 0,
    tags: [],
    notes: ''
  });
  const [playHistory, setPlayHistory] = useState<SidelinePlayData[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [lastPlayNumber, setLastPlayNumber] = useState(0);

  // Update current quarter and time
  useEffect(() => {
    setCurrentPlay(prev => ({
      ...prev,
      quarter: currentQuarter,
      time: currentTime
    }));
  }, [currentQuarter, currentTime]);

  // Battery level monitoring
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100);
        });
      });
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  const handleQuickGrade = (grade: number) => {
    setCurrentPlay(prev => ({ ...prev, quickGrade: grade }));
  };

  const toggleTag = (tag: string) => {
    setCurrentPlay(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = () => {
    if (currentPlay.quickGrade === 0 && currentPlay.tags.length === 0) {
      return;
    }

    // Add to play history
    setPlayHistory(prev => [...prev, { ...currentPlay }]);

    // Submit the play
    onPlaySubmit(currentPlay);

    // Reset form
    setCurrentPlay({
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
    if (playHistory.length > 0) {
      const lastPlay = playHistory[playHistory.length - 1];
      setPlayHistory(prev => prev.slice(0, -1));
      setCurrentPlay(lastPlay);
      setLastPlayNumber(prev => Math.max(0, prev - 1));
    }
  };

  const getGradeColor = (grade: number) => {
    if (isHighContrast) {
      if (grade > 0) return 'bg-yellow-500 text-black';
      if (grade < 0) return 'bg-red-700 text-white';
      return 'bg-gray-700 text-white';
    }
    
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

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`min-h-screen ${isHighContrast ? 'bg-black text-white' : 'bg-background'}`}>
      {/* Header Bar */}
      <div className={`sticky top-0 z-50 p-4 border-b ${
        isHighContrast ? 'bg-white text-black border-white' : 'bg-background border-border'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold">
              Play #{lastPlayNumber + 1} • Q{currentQuarter} {currentTime}
            </div>
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${getBatteryColor(batteryLevel)}`}>
              <Battery className="h-4 w-4" />
              {Math.round(batteryLevel)}%
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHighContrast}
              className={isHighContrast ? 'bg-black text-white hover:bg-gray-800' : ''}
            >
              {isHighContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className={isHighContrast ? 'bg-black text-white hover:bg-gray-800' : ''}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grading Interface */}
      <div className="p-4 space-y-6">
        {/* Quick Grade Buttons - Large for touch */}
        <Card className={isHighContrast ? 'bg-white text-black border-white' : ''}>
          <CardHeader>
            <CardTitle className="text-xl text-center">Quick Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {[-2, -1, 0, 1, 2].map((grade) => (
                <Button
                  key={grade}
                  className={`h-24 text-2xl font-bold ${getGradeColor(grade)} ${
                    currentPlay.quickGrade === grade ? 'ring-4 ring-blue-400' : ''
                  }`}
                  onClick={() => handleQuickGrade(grade)}
                >
                  {grade > 0 ? '+' : ''}{grade}
                </Button>
              ))}
            </div>
            <div className="text-center text-lg mt-3 font-medium">
              {getGradeLabel(currentPlay.quickGrade)}
            </div>
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <Card className={isHighContrast ? 'bg-white text-black border-white' : ''}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="h-28 bg-green-600 hover:bg-green-700 text-xl font-bold"
                onClick={() => handleQuickGrade(2)}
              >
                <Target className="h-10 w-10 mr-3" />
                Good Play
              </Button>
              <Button
                className="h-28 bg-red-600 hover:bg-red-700 text-xl font-bold"
                onClick={() => handleQuickGrade(-2)}
              >
                <AlertTriangle className="h-10 w-10 mr-3" />
                Bad Play
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tags */}
        <Card className={isHighContrast ? 'bg-white text-black border-white' : ''}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {SIDELINE_TAGS.map((tag) => (
                <Button
                  key={tag}
                  variant={currentPlay.tags.includes(tag) ? "default" : "outline"}
                  size="lg"
                  className={`h-16 text-sm ${
                    isHighContrast && currentPlay.tags.includes(tag) 
                      ? 'bg-black text-white hover:bg-gray-800' 
                      : ''
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleUndo}
            disabled={playHistory.length === 0}
            className={`flex-1 h-16 text-lg ${
              isHighContrast ? 'bg-white text-black border-white hover:bg-gray-100' : ''
            }`}
          >
            <Undo className="h-6 w-6 mr-2" />
            Undo
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={currentPlay.quickGrade === 0 && currentPlay.tags.length === 0}
            size="lg"
            className="flex-1 h-16 text-lg bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-6 w-6 mr-2" />
            Submit Play
          </Button>
        </div>

        {/* Selected Tags Display */}
        {currentPlay.tags.length > 0 && (
          <Card className={isHighContrast ? 'bg-white text-black border-white' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Selected Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {currentPlay.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className={`text-sm p-2 ${
                      isHighContrast ? 'bg-black text-white' : ''
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Plays Summary */}
        {playHistory.length > 0 && (
          <Card className={isHighContrast ? 'bg-white text-black border-white' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Recent Plays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {playHistory.slice(-5).reverse().map((play, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">Q{play.quarter} {play.time}</span>
                      <Badge 
                        variant={play.quickGrade > 0 ? "default" : "destructive"}
                        className={isHighContrast ? 'bg-black text-white' : ''}
                      >
                        {play.quickGrade > 0 ? '+' : ''}{play.quickGrade}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      {play.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
