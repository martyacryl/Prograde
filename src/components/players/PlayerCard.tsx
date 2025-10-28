import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Player, Team } from '@prisma/client';

interface PlayerCardProps {
  player: any;
  showAnalytics?: boolean;
  onClick?: () => void;
}

export function PlayerCard({ player, showAnalytics = false, onClick }: PlayerCardProps) {
  const teamColors = {
    primary: player.team.primaryColor || '#3b82f6',
    secondary: player.team.secondaryColor || '#1e40af'
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 4.5) return 'text-green-600';
    if (grade >= 3.5) return 'text-blue-600';
    if (grade >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 4.5) return 'Excellent';
    if (grade >= 3.5) return 'Good';
    if (grade >= 2.5) return 'Average';
    return 'Below Average';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
      style={{
        borderLeftColor: teamColors.primary,
        borderLeftWidth: '4px'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={player.headshotUrl || undefined} 
              alt={`${player.firstName} ${player.lastName}`}
            />
            <AvatarFallback 
              className="text-sm font-semibold"
              style={{ backgroundColor: teamColors.primary, color: 'white' }}
            >
              {player.firstName[0]}{player.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {player.firstName} {player.lastName}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: teamColors.primary,
                  color: teamColors.primary 
                }}
              >
                #{player.jerseyNumber}
              </Badge>
              <span>{player.position}</span>
              {player.year && (
                <Badge variant="secondary" className="text-xs">
                  {player.year}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Physical Stats */}
          {(player.height || player.weight) && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {player.height && <span>{player.height}</span>}
              {player.weight && <span>{player.weight} lbs</span>}
            </div>
          )}

          {/* Hometown */}
          {player.hometown && (
            <div className="text-sm text-muted-foreground">
              📍 {player.hometown}
            </div>
          )}

          {/* Analytics */}
          {showAnalytics && player.analytics && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Grade</span>
                <span className={`font-semibold ${getGradeColor(player.analytics.overallAverage)}`}>
                  {player.analytics.overallAverage.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recent Grade</span>
                <span className={`font-semibold ${getGradeColor(player.analytics.recentAverage)}`}>
                  {player.analytics.recentAverage.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Games Played</span>
                <span className="font-semibold">{player.analytics.gamesPlayed}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Grades</span>
                <span className="font-semibold">{player.analytics.totalGrades}</span>
              </div>

              {/* Grade Distribution */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Grade Distribution</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-600">Excellent:</span>
                    <span>{player.analytics.gradeDistribution.excellent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Good:</span>
                    <span>{player.analytics.gradeDistribution.good}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Average:</span>
                    <span>{player.analytics.gradeDistribution.average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Below Avg:</span>
                    <span>{player.analytics.gradeDistribution.belowAverage}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PlayerGridProps {
  players: any[];
  showAnalytics?: boolean;
  onPlayerClick?: (player: any) => void;
}

export function PlayerGrid({ players, showAnalytics = false, onPlayerClick }: PlayerGridProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No players found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          showAnalytics={showAnalytics}
          onClick={onPlayerClick ? () => onPlayerClick(player) : undefined}
        />
      ))}
    </div>
  );
}
