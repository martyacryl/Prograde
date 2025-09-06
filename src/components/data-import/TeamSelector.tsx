'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Users, 
  Star, 
  MapPin, 
  Trophy,
  TrendingUp,
  Filter,
  X
} from 'lucide-react';

interface TeamSelectorProps {
  onTeamSelect: (team: TeamInfo) => void;
  selectedTeams: string[];
  onClearSelection?: () => void;
}

interface TeamInfo {
  id: string;
  name: string;
  fullName: string;
  conference: string;
  division: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  ranking?: number;
  record?: string;
  recentGames?: string[];
}

interface TeamFilters {
  conference?: string;
  division?: string;
  rankedOnly?: boolean;
  hasRecentGames?: boolean;
}

const CONFERENCES = [
  'SEC', 'Big Ten', 'Big 12', 'Pac-12', 'ACC', 
  'American', 'Mountain West', 'MAC', 'Sun Belt', 'Conference USA'
];

const DIVISIONS = ['FBS', 'FCS', 'Division II', 'Division III'];

// Mock team data for development/testing
const MOCK_TEAMS: TeamInfo[] = [
  {
    id: 'michigan',
    name: 'Michigan',
    fullName: 'University of Michigan',
    conference: 'Big Ten',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#00274C', secondary: '#FFCB05' },
    ranking: 1,
    record: '13-1',
    recentGames: ['Ohio State', 'Iowa', 'Penn State']
  },
  {
    id: 'ohio-state',
    name: 'Ohio State',
    fullName: 'The Ohio State University',
    conference: 'Big Ten',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#BB0000', secondary: '#666666' },
    ranking: 2,
    record: '11-2',
    recentGames: ['Michigan', 'Penn State', 'Wisconsin']
  },
  {
    id: 'alabama',
    name: 'Alabama',
    fullName: 'University of Alabama',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#9E1B32', secondary: '#FFFFFF' },
    ranking: 3,
    record: '12-2',
    recentGames: ['Georgia', 'Auburn', 'LSU']
  },
  {
    id: 'georgia',
    name: 'Georgia',
    fullName: 'University of Georgia',
    conference: 'SEC',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#BA0C2F', secondary: '#000000' },
    ranking: 4,
    record: '13-1',
    recentGames: ['Alabama', 'Florida', 'Tennessee']
  },
  {
    id: 'texas',
    name: 'Texas',
    fullName: 'University of Texas at Austin',
    conference: 'Big 12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#BF5700', secondary: '#FFFFFF' },
    ranking: 5,
    record: '12-2',
    recentGames: ['Oklahoma', 'TCU', 'Baylor']
  },
  {
    id: 'oregon',
    name: 'Oregon',
    fullName: 'University of Oregon',
    conference: 'Pac-12',
    division: 'FBS',
    logo: '/api/placeholder/40/40',
    colors: { primary: '#154733', secondary: '#FEE11A' },
    ranking: 6,
    record: '12-2',
    recentGames: ['Washington', 'USC', 'Stanford']
  }
];

export default function TeamSelector({ 
  onTeamSelect, 
  selectedTeams, 
  onClearSelection 
}: TeamSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TeamFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<TeamInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search teams based on query and filters
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    const timeout = setTimeout(() => {
      const filtered = MOCK_TEAMS.filter(team => {
        const matchesQuery = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           team.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilters = (!filters.conference || team.conference === filters.conference) &&
                             (!filters.division || team.division === filters.division) &&
                             (!filters.rankedOnly || team.ranking) &&
                             (!filters.hasRecentGames || (team.recentGames && team.recentGames.length > 0));
        
        return matchesQuery && matchesFilters;
      });
      
      setSearchResults(filtered);
      setShowDropdown(filtered.length > 0);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, filters]);

  const handleTeamSelect = (team: TeamInfo) => {
    onTeamSelect(team);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const isTeamSelected = (teamId: string) => selectedTeams.includes(teamId);

  const getRankingBadge = (ranking: number) => {
    if (ranking <= 5) return <Badge variant="destructive" className="text-xs">#{ranking}</Badge>;
    if (ranking <= 10) return <Badge variant="default" className="text-xs">#{ranking}</Badge>;
    if (ranking <= 25) return <Badge variant="secondary" className="text-xs">#{ranking}</Badge>;
    return null;
  };

  const getConferenceColor = (conference: string) => {
    const colors: { [key: string]: string } = {
      'SEC': 'text-red-600',
      'Big Ten': 'text-blue-600',
      'Big 12': 'text-green-600',
      'Pac-12': 'text-purple-600',
      'ACC': 'text-orange-600'
    };
    return colors[conference] || 'text-gray-600';
  };

  return (
    <div className="space-y-4" ref={searchRef}>
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Search Teams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for teams (e.g., Michigan, Alabama, Ohio State)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              onFocus={() => setShowDropdown(true)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            
            {selectedTeams.length > 0 && onClearSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                Clear Selection ({selectedTeams.length})
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label htmlFor="conference-filter" className="text-sm">Conference</Label>
                <Select
                  value={filters.conference || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, conference: value || undefined }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Conferences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Conferences</SelectItem>
                    {CONFERENCES.map((conf) => (
                      <SelectItem key={conf} value={conf}>
                        {conf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="division-filter" className="text-sm">Division</Label>
                <Select
                  value={filters.division || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, division: value || undefined }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Divisions</SelectItem>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="ranked-only-filter"
                  checked={filters.rankedOnly || false}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, rankedOnly: checked as boolean }))}
                />
                <Label htmlFor="ranked-only-filter" className="text-sm">Top 25 only</Label>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="recent-games-filter"
                  checked={filters.hasRecentGames || false}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, hasRecentGames: checked as boolean }))}
                />
                <Label htmlFor="recent-games-filter" className="text-sm">Has recent games</Label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <Card className="absolute z-50 w-full max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isSearching ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No teams found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="divide-y">
                {searchResults.map((team) => (
                  <div
                    key={team.id}
                    className={`p-3 hover:bg-muted cursor-pointer transition-colors ${
                      isTeamSelected(team.id) ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleTeamSelect(team)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Team Logo */}
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            {team.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      {/* Team Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{team.name}</span>
                          {getRankingBadge(team.ranking || 0)}
                          {isTeamSelected(team.id) && (
                            <Badge variant="outline" className="text-xs">Selected</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {team.fullName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-xs ${getConferenceColor(team.conference)}`}>
                            {team.conference}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {team.division}
                          </Badge>
                          {team.record && (
                            <Badge variant="secondary" className="text-xs">
                              {team.record}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Recent Games */}
                      {team.recentGames && team.recentGames.length > 0 && (
                        <div className="text-right text-xs text-muted-foreground">
                          <div className="font-medium mb-1">Recent Games</div>
                          <div className="space-y-1">
                            {team.recentGames.slice(0, 2).map((game, index) => (
                              <div key={index} className="truncate max-w-24">
                                vs {game}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Teams Summary */}
      {selectedTeams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Teams ({selectedTeams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {MOCK_TEAMS.filter(team => selectedTeams.includes(team.id)).map((team) => (
                <Badge
                  key={team.id}
                  variant="secondary"
                  className="text-sm p-2 cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleTeamSelect(team)} // Remove from selection
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    {team.name}
                    <X className="h-3 w-3" />
                  </div>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
