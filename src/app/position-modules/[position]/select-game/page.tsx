'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, Clock, Users, Play, Search } from 'lucide-react';
import { getPositionModule } from '@/modules/core/position-registry';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface Game {
  id: string;
  date: string;
  opponent: string;
  opponentAbbreviation: string;
  season: string;
  week: number;
  gameType: 'regular' | 'playoff' | 'bowl';
  status: 'upcoming' | 'in-progress' | 'completed';
  playsCount: number;
  gradedPlaysCount: number;
  gradingProgress: number;
}

interface Season {
  id: string;
  year: number;
  name: string;
  isActive: boolean;
}

export default function GameSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const positionName = params.position as string;
  const { user } = useAuthStore();
  
  const [moduleData, setModuleData] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [positionName, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load position module
      const moduleId = Object.keys(require('@/modules/core/position-registry').POSITION_MODULES)
        .find(key => require('@/modules/core/position-registry').POSITION_MODULES[key].name === positionName);
      
      if (!moduleId) {
        setError('Position module not found');
        return;
      }

      const module = getPositionModule(moduleId);
      setModuleData(module);

      // Load seasons
      if (user?.teamId) {
        const seasonsResponse = await fetch(`/api/seasons?teamId=${user.teamId}`);
        if (seasonsResponse.ok) {
          const seasonsData = await seasonsResponse.json();
          setSeasons(seasonsData.seasons || []);
          
          // Set active season as default
          const activeSeason = seasonsData.seasons?.find((s: Season) => s.isActive);
          if (activeSeason) {
            setSelectedSeason(activeSeason.id);
          }
        }

        // Load games for the team
        const gamesResponse = await fetch(`/api/games?teamId=${user.teamId}`);
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.games || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load games and seasons');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSeason = !selectedSeason || selectedSeason === 'all' || game.season === selectedSeason;
    const matchesSearch = !searchTerm || 
      game.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `week ${game.week}`.includes(searchTerm.toLowerCase());
    
    return matchesSeason && matchesSearch;
  });

  const getGameStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600">Upcoming</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-orange-500">Live</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="text-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGradingProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-orange-500';
    if (progress < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/position-modules')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Select Game to Grade - {moduleData?.displayName}
              </h1>
              <p className="text-gray-600">
                Choose a game from your season to start grading {moduleData?.displayName} plays
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filter Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Season</label>
                <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="All seasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All seasons</SelectItem>
                    {seasons.map(season => (
                      <SelectItem key={season.id} value={season.id}>
                        {season.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by opponent or week..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games List */}
        <div className="space-y-4">
          {filteredGames.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Games Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedSeason 
                    ? 'No games match your current filters.' 
                    : 'No games have been imported for your team yet.'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedSeason('');
                  }}>
                    Clear Filters
                  </Button>
                  <Link href="/dashboard/data-import">
                    <Button>
                      Import Game Data
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredGames.map(game => (
              <Card key={game.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          Week {game.week} vs {game.opponent}
                        </h3>
                        {getGameStatusBadge(game.status)}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(game.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {game.opponentAbbreviation}
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {game.playsCount} plays
                        </div>
                      </div>

                      {/* Grading Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Grading Progress</span>
                          <span className="font-medium">
                            {game.gradedPlaysCount} / {game.playsCount} plays
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getGradingProgressColor(game.gradingProgress)}`}
                            style={{ width: `${game.gradingProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/games/${game.id}/grade/${positionName}`}>
                        <Button className="min-w-[120px]">
                          <Play className="h-4 w-4 mr-2" />
                          {game.gradingProgress > 0 ? 'Continue Grading' : 'Start Grading'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Text */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Grading Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Games with higher grading progress are easier to continue</li>
                  <li>• Start with completed games for the most accurate grading</li>
                  <li>• Live games allow real-time grading during play</li>
                  <li>• You can switch between games at any time</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
