'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { PlayerGrid } from '@/components/players/PlayerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, Download, Search, Filter } from 'lucide-react';

interface Player {
  id: string;
  jerseyNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  year?: string;
  height?: string;
  weight?: number;
  hometown?: string;
  headshotUrl?: string;
  isActive: boolean;
  team: {
    id: string;
    name: string;
    abbreviation: string;
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
  };
  season: {
    id: string;
    year: number;
  };
  analytics?: {
    totalGrades: number;
    overallAverage: number;
    recentAverage: number;
    gamesPlayed: number;
    gradeDistribution: {
      excellent: number;
      good: number;
      average: number;
      belowAverage: number;
    };
  };
}

interface Season {
  id: string;
  year: number;
  isActive: boolean;
}

export default function RosterManagementPage() {
  const { user } = useAuthStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingHeadshots, setFetchingHeadshots] = useState(false);

  const positions = ['QB', 'RB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];

  useEffect(() => {
    loadSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      loadPlayers();
    }
  }, [selectedSeason, selectedPosition]);

  const loadSeasons = async () => {
    try {
      const response = await fetch('/api/seasons');
      const data = await response.json();
      
      if (data.success) {
        setSeasons(data.seasons);
        // Set current active season as default
        const activeSeason = data.seasons.find((s: Season) => s.isActive);
        if (activeSeason) {
          setSelectedSeason(activeSeason.id);
        }
      } else {
        setError(data.error || 'Failed to load seasons');
      }
    } catch (error) {
      console.error('Error loading seasons:', error);
      setError('Failed to load seasons');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    if (!selectedSeason || !user?.teamId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        teamId: user.teamId,
        seasonId: selectedSeason,
        isActive: 'true'
      });

      if (selectedPosition && selectedPosition !== 'all') {
        params.append('position', selectedPosition);
      }

      const response = await fetch(`/api/players?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPlayers(data.players);
      } else {
        setError(data.error || 'Failed to load players');
      }
    } catch (error) {
      console.error('Error loading players:', error);
      setError('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerHeadshots = async () => {
    if (!selectedSeason || !user?.teamId) return;

    try {
      setFetchingHeadshots(true);
      
      // First, search for the team on ESPN
      const searchResponse = await fetch(`/api/players/fetch-headshots?teamName=${encodeURIComponent(user.team?.name || '')}`);
      const searchData = await searchResponse.json();
      
      if (!searchData.success || searchData.teams.length === 0) {
        setError('Team not found on ESPN. Please check team name.');
        return;
      }

      // Use the first matching team
      const espnTeam = searchData.teams[0];
      
      // Fetch roster and headshots
      const response = await fetch('/api/players/fetch-headshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: user.teamId,
          seasonId: selectedSeason,
          espnTeamId: espnTeam.id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setError(null);
        // Reload players to show updated data
        loadPlayers();
      } else {
        setError(data.error || 'Failed to fetch headshots');
      }
    } catch (error) {
      console.error('Error fetching headshots:', error);
      setError('Failed to fetch headshots');
    } finally {
      setFetchingHeadshots(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = searchTerm === '' || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.jerseyNumber.includes(searchTerm) ||
      player.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const currentSeason = seasons.find(s => s.id === selectedSeason);

  if (!user?.teamId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            You must be associated with a team to manage rosters.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roster Management</h1>
            <p className="text-muted-foreground">
              Manage your team's roster with player headshots and analytics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {user.team?.name}
            </Badge>
            {currentSeason && (
              <Badge variant="secondary" className="text-sm">
                {currentSeason.year} Season
              </Badge>
            )}
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Roster Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Season Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.year} {season.isActive && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Position Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="All positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex space-x-2">
                  <Button
                    onClick={fetchPlayerHeadshots}
                    disabled={fetchingHeadshots || !selectedSeason}
                    size="sm"
                    className="flex-1"
                  >
                    {fetchingHeadshots ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Fetch Headshots
                  </Button>
                </div>
              </div>
            </div>

            {/* Analytics Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showAnalytics"
                checked={showAnalytics}
                onChange={(e) => setShowAnalytics(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showAnalytics" className="text-sm font-medium">
                Show Analytics
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Players Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Players ({filteredPlayers.length})
              </h2>
              {filteredPlayers.length > 0 && (
                <Badge variant="outline">
                  {filteredPlayers.filter(p => p.headshotUrl).length} with headshots
                </Badge>
              )}
            </div>
            
            <PlayerGrid
              players={filteredPlayers}
              showAnalytics={showAnalytics}
              onPlayerClick={(player) => {
                console.log('Player clicked:', player);
                // TODO: Navigate to player detail page
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
