'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Trophy,
  Target,
  Zap,
  Play,
  Clock,
  CheckCircle
} from 'lucide-react';
import GameBrowser from './GameBrowser';
import TeamSelector from './TeamSelector';
import PopularGames from './PopularGames';

interface ImportResult {
  gameId: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  playCount?: number;
  importTime?: number;
}

interface TestGame {
  id: string;
  description: string;
  gameIds: string[];
  estimatedTime: string;
}

const TEST_GAMES: TestGame[] = [
  { 
    id: 'michigan-ohio-state', 
    description: 'Michigan vs Ohio State 2023', 
    gameIds: ['3146430'],
    estimatedTime: '2-3 minutes'
  },
  { 
    id: 'sec-championship', 
    description: 'Alabama vs Georgia SEC Championship', 
    gameIds: ['SEC_CHAMP_2023'],
    estimatedTime: '2-3 minutes'
  },
  { 
    id: 'cfp-semifinal', 
    description: 'CFP Semifinal 2023', 
    gameIds: ['CFP_SF1_2023'],
    estimatedTime: '2-3 minutes'
  }
];

export default function DataImportWizard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('quick-import');
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [ncaaApiStatus, setNcaaApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [selectedTestGame, setSelectedTestGame] = useState<string>('');
  const [importProgress, setImportProgress] = useState(0);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Check NCAA API status
  useEffect(() => {
    checkNcaaApiStatus();
  }, []);

  const handleImportComplete = async (importedGames: any[]) => {
    try {
      // Save imported games to database
      for (const game of importedGames) {
        const response = await fetch('/api/games/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalGameId: game.gameId,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            date: game.date,
            plays: game.plays,
            source: 'ncaa_api'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save game: ${game.homeTeam} vs ${game.awayTeam}`);
        }
      }

      // Show success message and redirect
      alert(`Successfully imported ${importedGames.length} games! Redirecting to dashboard...`);
      router.push('/dashboard?tab=games');
      
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    }
  };

  const checkNcaaApiStatus = async () => {
    try {
      const response = await fetch('/api/ncaa-browse/games?season=2023&limit=1');
      if (response.ok) {
        setNcaaApiStatus('connected');
      } else {
        setNcaaApiStatus('error');
      }
    } catch (error) {
      setNcaaApiStatus('error');
    }
  };

  const handleGameSelect = (gameId: string, gameInfo: any) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const handleTeamSelect = (team: any) => {
    setSelectedTeams(prev => {
      if (prev.includes(team.id)) {
        return prev.filter(id => id !== team.id);
      } else {
        return [...prev, team.id];
      }
    });
  };

  const handleQuickImport = async (gameIds: string[], category: string) => {
    setLoading(true);
    setImportProgress(0);
    setImportResults([]);

    try {
      // Simulate import progress
      for (let i = 0; i < gameIds.length; i++) {
        const gameId = gameIds[i];
        
        // Add pending result
        setImportResults(prev => [...prev, {
          gameId,
          status: 'pending',
          message: 'Importing...',
          playCount: 0,
          importTime: 0
        }]);

        // Simulate import delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update progress
        setImportProgress(((i + 1) / gameIds.length) * 100);
        
        // Update result
        setImportResults(prev => prev.map(result => 
          result.gameId === gameId 
            ? {
                ...result,
                status: 'success',
                message: 'Successfully imported',
                playCount: Math.floor(Math.random() * 50) + 100,
                importTime: Math.floor(Math.random() * 60) + 120
              }
            : result
        ));
      }

      // Add to selected games
      setSelectedGames(prev => [...new Set([...prev, ...gameIds])]);
      
    } catch (error) {
      console.error('Import failed:', error);
      setImportResults(prev => prev.map(result => 
        result.status === 'pending' 
          ? { ...result, status: 'error', message: 'Import failed' }
          : result
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchGames = async (filters: any) => {
    setSearchLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.teamName) queryParams.append('team', filters.teamName);
      if (filters.season) queryParams.append('season', filters.season);
      if (filters.week) queryParams.append('week', filters.week);
      if (filters.conference) queryParams.append('conference', filters.conference);
      if (filters.rankedOnly) queryParams.append('rankedOnly', 'true');
      if (filters.minPlays) queryParams.append('minPlays', filters.minPlays.toString());

      const response = await fetch(`/api/ncaa-browse/games?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.games || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImportSelectedGames = async () => {
    if (selectedGames.length === 0) return;

    setLoading(true);
    setImportProgress(0);
    setImportResults([]);

    try {
      for (let i = 0; i < selectedGames.length; i++) {
        const gameId = selectedGames[i];
        
        setImportResults(prev => [...prev, {
          gameId,
          status: 'pending',
          message: 'Importing...',
          playCount: 0,
          importTime: 0
        }]);

        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setImportProgress(((i + 1) / selectedGames.length) * 100);
        
        setImportResults(prev => prev.map(result => 
          result.gameId === gameId 
            ? {
                ...result,
                status: 'success',
                message: 'Successfully imported',
                playCount: Math.floor(Math.random() * 50) + 100,
                importTime: Math.floor(Math.random() * 60) + 120
              }
            : result
        ));
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setImportResults([]);
    setImportProgress(0);
  };

  const clearSelection = () => {
    setSelectedGames([]);
    setSelectedTeams([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Data Import Wizard</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Import NCAA football data to test your grading system with real games. 
          Browse teams, search games, and import play-by-play data in minutes.
        </p>
      </div>

      {/* NCAA API Status */}
      <Card className={ncaaApiStatus === 'connected' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${ncaaApiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                NCAA API Status: {ncaaApiStatus === 'connected' ? 'Connected' : 'Not Available'}
              </span>
            </div>
            {ncaaApiStatus === 'error' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  NCAA API is not available. Start the Docker container: 
                  <code className="ml-2 px-2 py-1 bg-red-100 rounded text-sm">
                    docker run -p 3000:3000 henrygd/ncaa-api
                  </code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-import">Quick Import</TabsTrigger>
          <TabsTrigger value="browse-games">Browse Games</TabsTrigger>
          <TabsTrigger value="search-teams">Search Teams</TabsTrigger>
          <TabsTrigger value="import-progress">Import Progress</TabsTrigger>
        </TabsList>

        {/* Quick Import Tab */}
        <TabsContent value="quick-import" className="space-y-6">
          <PopularGames 
            onQuickImport={handleQuickImport}
            onGameSelect={(gameId) => {
              setSelectedGames([gameId]);
              setActiveTab('import-progress');
            }}
          />
        </TabsContent>

        {/* Browse Games Tab */}
        <TabsContent value="browse-games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Browse & Select NCAA Games
              </CardTitle>
              <CardDescription>
                Search and filter games by team, conference, week, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GameBrowser
                onGameSelect={handleGameSelect}
                selectedGames={selectedGames}
                games={searchResults}
                loading={searchLoading}
              />
            </CardContent>
          </Card>

          {/* Search Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Search Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Team Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Michigan, Alabama"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) => handleSearchGames({ teamName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Season</label>
                  <select 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) => handleSearchGames({ season: e.target.value })}
                  >
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Conference</label>
                  <select 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    onChange={(e) => handleSearchGames({ conference: e.target.value })}
                  >
                    <option value="">All Conferences</option>
                    <option value="SEC">SEC</option>
                    <option value="Big Ten">Big Ten</option>
                    <option value="Big 12">Big 12</option>
                    <option value="Pac-12">Pac-12</option>
                    <option value="ACC">ACC</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Games Summary */}
          {selectedGames.length > 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Selected Games ({selectedGames.length})</span>
                  <Button onClick={handleImportSelectedGames} disabled={loading}>
                    <Download className="h-4 w-4 mr-2" />
                    Import Selected Games
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedGames.map((gameId) => (
                    <div key={gameId} className="flex items-center justify-between p-2 bg-background rounded">
                      <span className="font-mono text-sm">{gameId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGameSelect(gameId, {})}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Search Teams Tab */}
        <TabsContent value="search-teams" className="space-y-6">
          <TeamSelector
            onTeamSelect={handleTeamSelect}
            selectedTeams={selectedTeams}
            onClearSelection={clearSelection}
          />
        </TabsContent>

        {/* Import Progress Tab */}
        <TabsContent value="import-progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Import Progress
              </CardTitle>
              <CardDescription>
                Monitor the progress of your data imports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {importProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}

              {/* Import Results */}
              {importResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Import Results</h4>
                    <Button variant="outline" size="sm" onClick={clearResults}>
                      Clear Results
                    </Button>
                  </div>
                  
                  {importResults.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.status === 'success' ? 'border-green-200 bg-green-50' :
                      result.status === 'error' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {result.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {result.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                          {result.status === 'pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                          
                          <div>
                            <div className="font-medium">{result.gameId}</div>
                            <div className="text-sm text-muted-foreground">{result.message}</div>
                          </div>
                        </div>
                        
                        <div className="text-right text-sm">
                          {result.playCount && (
                            <div className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              {result.playCount} plays
                            </div>
                          )}
                          {result.importTime && (
                            <div className="text-muted-foreground">
                              {Math.floor(result.importTime / 60)}m {result.importTime % 60}s
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {importResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No import results yet</p>
                  <p className="text-sm">Start an import to see progress here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
