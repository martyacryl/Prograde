'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Play, 
  Trophy,
  Star,
  Clock,
  Download,
  Eye
} from 'lucide-react';

interface GameBrowserProps {
  onGameSelect: (gameId: string, gameInfo: GameInfo) => void;
  selectedGames: string[];
  games?: GameInfo[];
  loading?: boolean;
}

interface GameInfo {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  score?: string;
  date: string;
  description?: string;
  playCount?: number;
  hasPlayByPlay: boolean;
  conference?: string;
  week?: number;
  season?: number;
  isRivalry?: boolean;
  isChampionship?: boolean;
  isPlayoff?: boolean;
}

interface SearchFilters {
  teamName?: string;
  opponent?: string;
  season: string;
  week?: number;
  conference?: string;
  rankedOnly?: boolean;
  dateRange?: { start: string; end: string };
  minPlays?: number;
}

export default function GameBrowser({ 
  onGameSelect, 
  selectedGames, 
  games = [], 
  loading = false 
}: GameBrowserProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    season: '2023',
    rankedOnly: false,
    minPlays: 50
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'plays' | 'teams'>('date');
  const [showFilters, setShowFilters] = useState(false);

  const handleGameSelect = (gameId: string, gameInfo: GameInfo) => {
    onGameSelect(gameId, gameInfo);
  };

  const toggleGameSelection = (gameId: string, gameInfo: GameInfo) => {
    if (selectedGames.includes(gameId)) {
      // Remove from selection
      onGameSelect(gameId, gameInfo);
    } else {
      // Add to selection
      onGameSelect(gameId, gameInfo);
    }
  };

  const isGameSelected = (gameId: string) => selectedGames.includes(gameId);

  const getGameTypeBadge = (game: GameInfo) => {
    if (game.isPlayoff) return <Badge variant="destructive" className="text-xs">Playoff</Badge>;
    if (game.isChampionship) return <Badge variant="default" className="text-xs">Championship</Badge>;
    if (game.isRivalry) return <Badge variant="secondary" className="text-xs">Rivalry</Badge>;
    return null;
  };

  const getPlayCountColor = (count: number) => {
    if (count >= 150) return 'text-green-600';
    if (count >= 120) return 'text-blue-600';
    if (count >= 100) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredAndSortedGames = games
    .filter(game => {
      if (filters.teamName && !game.homeTeam.toLowerCase().includes(filters.teamName.toLowerCase()) && 
          !game.awayTeam.toLowerCase().includes(filters.teamName.toLowerCase())) {
        return false;
      }
      if (filters.opponent && !game.homeTeam.toLowerCase().includes(filters.opponent.toLowerCase()) && 
          !game.awayTeam.toLowerCase().includes(filters.opponent.toLowerCase())) {
        return false;
      }
      if (filters.conference && filters.conference !== 'all' && game.conference !== filters.conference) {
        return false;
      }
      if (filters.minPlays && game.playCount && game.playCount < filters.minPlays) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'plays':
          return (b.playCount || 0) - (a.playCount || 0);
        case 'teams':
          return a.homeTeam.localeCompare(b.homeTeam);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Browse NCAA Games</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Search */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <Label htmlFor="team-search" className="text-sm">Search Teams</Label>
              <Input
                id="team-search"
                placeholder="Search for teams (e.g., Michigan, Alabama)"
                value={filters.teamName || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, teamName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="season" className="text-sm">Season</Label>
              <Select
                value={filters.season}
                onValueChange={(value) => setFilters(prev => ({ ...prev, season: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022, 2021, 2020].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label htmlFor="week" className="text-sm">Week</Label>
              <Select
                value={filters.week?.toString() || 'all'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, week: value ? parseInt(value) : undefined }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="conference" className="text-sm">Conference</Label>
                <Select
                  value={filters.conference || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, conference: value || undefined }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Conferences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conferences</SelectItem>
                    {['SEC', 'Big Ten', 'Big 12', 'Pac-12', 'ACC', 'American', 'Mountain West', 'MAC', 'Sun Belt', 'Conference USA'].map((conf) => (
                      <SelectItem key={conf} value={conf}>
                        {conf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="min-plays" className="text-sm">Min Plays</Label>
                <Select
                  value={filters.minPlays?.toString() || '50'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minPlays: parseInt(value) }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[25, 50, 75, 100, 125, 150].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count}+ plays
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="ranked-only"
                  checked={filters.rankedOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, rankedOnly: checked as boolean }))}
                />
                <Label htmlFor="ranked-only" className="text-sm">Ranked teams only</Label>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="play-by-play"
                  checked={true}
                  disabled
                />
                <Label htmlFor="play-by-play" className="text-sm">Play-by-play available</Label>
              </div>
            </div>
          )}

          {/* Sort and View Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Sort by:</Label>
              <Select value={sortBy} onValueChange={(value: 'date' | 'plays' | 'teams') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="plays">Play Count</SelectItem>
                  <SelectItem value="teams">Team Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {loading ? 'Loading games...' : `${filteredAndSortedGames.length} games found`}
        </div>
        {selectedGames.length > 0 && (
          <Badge variant="default">
            {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''} selected
          </Badge>
        )}
      </div>

      {/* Games Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredAndSortedGames.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Search className="h-8 w-8 mb-2" />
            <p>No games found matching your criteria</p>
            <p className="text-sm">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {filteredAndSortedGames.map((game) => (
            <Card 
              key={game.gameId} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isGameSelected(game.gameId) ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => toggleGameSelection(game.gameId, game)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox 
                        checked={isGameSelected(game.gameId)}
                        onChange={() => toggleGameSelection(game.gameId, game)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {getGameTypeBadge(game)}
                    </div>
                    <CardTitle className="text-base">
                      {game.awayTeam} @ {game.homeTeam}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(game.date).toLocaleDateString()}
                      {game.week && ` • Week ${game.week}`}
                      {game.conference && ` • ${game.conference}`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Score */}
                  {game.score && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{game.score}</div>
                      <div className="text-xs text-muted-foreground">Final Score</div>
                    </div>
                  )}

                  {/* Game Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{game.awayTeam}</div>
                      <div className="text-xs text-muted-foreground">Away</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-medium">{game.homeTeam}</div>
                      <div className="text-xs text-muted-foreground">Home</div>
                    </div>
                  </div>

                  {/* Play Count */}
                  {game.playCount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" />
                        Plays
                      </span>
                      <span className={`font-medium ${getPlayCountColor(game.playCount)}`}>
                        {game.playCount}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {game.description && (
                    <div className="text-xs text-muted-foreground text-center">
                      {game.description}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Preview game details
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant={isGameSelected(game.gameId) ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGameSelection(game.gameId, game);
                      }}
                    >
                      {isGameSelected(game.gameId) ? (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 mr-1" />
                          Select
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
