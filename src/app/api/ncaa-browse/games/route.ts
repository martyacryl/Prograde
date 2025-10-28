import { NextRequest, NextResponse } from 'next/server';
import { searchGames, getTeamSchedule, fetchRecentGames, fetchGamePlayByPlay } from '@/lib/data-sources/ncaa-api';

interface NCAAGame {
  gameID: string;
  home: {
    names: {
      full: string;
      short: string;
      abbreviation: string;
    };
    score: number;
    record: string;
    conference: string;
    ranking?: number;
  };
  away: {
    names: {
      full: string;
      short: string;
      abbreviation: string;
    };
    score: number;
    record: string;
    conference: string;
    ranking?: number;
  };
  startDate: string;
  status: {
    period: number;
    clock: string;
    type: {
      name: string;
      description: string;
    };
  };
  venue: {
    name: string;
    city: string;
    state: string;
  };
  week?: number;
  season: number;
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
  venue?: string;
  homeRanking?: number;
  awayRanking?: number;
}

// Mock data for development/testing
const MOCK_GAMES: GameInfo[] = [
  {
    gameId: "3146430",
    homeTeam: "Michigan",
    awayTeam: "Ohio State",
    score: "30-24",
    date: "2023-11-25",
    description: "The Game - Big Ten rivalry",
    playCount: 152,
    hasPlayByPlay: true,
    conference: "Big Ten",
    week: 13,
    season: 2023,
    isRivalry: true,
    venue: "Michigan Stadium, Ann Arbor, MI",
    homeRanking: 1,
    awayRanking: 2
  },
  {
    gameId: "SEC_CHAMP_2023",
    homeTeam: "Georgia",
    awayTeam: "Alabama",
    score: "27-24",
    date: "2023-12-02",
    description: "SEC Championship Game",
    playCount: 143,
    hasPlayByPlay: true,
    conference: "SEC",
    week: 15,
    season: 2023,
    isChampionship: true,
    venue: "Mercedes-Benz Stadium, Atlanta, GA",
    homeRanking: 4,
    awayRanking: 3
  },
  {
    gameId: "CFP_SF1_2023",
    homeTeam: "Michigan",
    awayTeam: "Alabama",
    score: "27-20",
    date: "2024-01-01",
    description: "CFP Semifinal - Rose Bowl",
    playCount: 158,
    hasPlayByPlay: true,
    conference: "Playoff",
    week: 16,
    season: 2023,
    isPlayoff: true,
    venue: "Rose Bowl, Pasadena, CA",
    homeRanking: 1,
    awayRanking: 3
  },
  {
    gameId: "CFP_FINAL_2023",
    homeTeam: "Michigan",
    awayTeam: "Washington",
    score: "34-13",
    date: "2024-01-08",
    description: "CFP National Championship",
    playCount: 165,
    hasPlayByPlay: true,
    conference: "Playoff",
    week: 17,
    season: 2023,
    isPlayoff: true,
    venue: "NRG Stadium, Houston, TX",
    homeRanking: 1,
    awayRanking: 2
  },
  {
    gameId: "IRON_BOWL_2023",
    homeTeam: "Auburn",
    awayTeam: "Alabama",
    score: "24-27",
    date: "2023-11-25",
    description: "Iron Bowl - SEC rivalry",
    playCount: 138,
    hasPlayByPlay: true,
    conference: "SEC",
    week: 13,
    season: 2023,
    isRivalry: true,
    venue: "Jordan-Hare Stadium, Auburn, AL",
    homeRanking: undefined,
    awayRanking: 3
  },
  {
    gameId: "RED_RIVER_2023",
    homeTeam: "Oklahoma",
    awayTeam: "Texas",
    score: "24-29",
    date: "2023-10-07",
    description: "Red River Showdown - Big 12 rivalry",
    playCount: 145,
    hasPlayByPlay: true,
    conference: "Big 12",
    week: 6,
    season: 2023,
    isRivalry: true,
    venue: "Cotton Bowl, Dallas, TX",
    homeRanking: 12,
    awayRanking: 5
  },
  {
    gameId: "B1G_CHAMP_2023",
    homeTeam: "Michigan",
    awayTeam: "Iowa",
    score: "26-0",
    date: "2023-12-02",
    description: "Big Ten Championship Game",
    playCount: 127,
    hasPlayByPlay: true,
    conference: "Big Ten",
    week: 15,
    season: 2023,
    isChampionship: true,
    venue: "Lucas Oil Stadium, Indianapolis, IN",
    homeRanking: 1,
    awayRanking: 16
  },
  {
    gameId: "PAC12_CHAMP_2023",
    homeTeam: "Washington",
    awayTeam: "Oregon",
    score: "34-31",
    date: "2023-12-01",
    description: "Pac-12 Championship Game",
    playCount: 156,
    hasPlayByPlay: true,
    conference: "Pac-12",
    week: 15,
    season: 2023,
    isChampionship: true,
    venue: "Allegiant Stadium, Las Vegas, NV",
    homeRanking: 2,
    awayRanking: 6
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');
    const season = searchParams.get('season') || '2023';
    const week = searchParams.get('week');
    const conference = searchParams.get('conference');
    const rankedOnly = searchParams.get('rankedOnly') === 'true';
    const minPlays = searchParams.get('minPlays') ? parseInt(searchParams.get('minPlays')!) : 0;
    const useRealAPI = searchParams.get('useRealAPI') === 'true';

    let games: GameInfo[] = [];

    if (useRealAPI && team) {
      // Fetch real games from NCAA API for specific team
      try {
        console.log(`Fetching real games for team: ${team}, season: ${season}`);
        const realGames = await getTeamSchedule(team, season);
        
        games = realGames.map(game => ({
          gameId: game.id,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          score: `${game.home_score}-${game.away_score}`,
          date: game.date,
          description: `${game.home_team} vs ${game.away_team}`,
          playCount: 0, // Will be fetched when importing
          hasPlayByPlay: true,
          conference: 'Unknown', // NCAA API doesn't provide conference info
          week: game.week,
          season: game.season,
          venue: game.venue,
          homeRanking: undefined,
          awayRanking: undefined
        }));
        
        console.log(`Found ${games.length} real games for ${team}`);
      } catch (error) {
        console.error('Error fetching real games:', error);
        // Fall back to mock data if real API fails
        games = MOCK_GAMES;
      }
    } else if (useRealAPI && week) {
      // Fetch real games from NCAA API for specific week
      try {
        console.log(`Fetching real games for season: ${season}, week: ${week}`);
        const scoreboard = await fetchRecentGames(season, week);
        
        games = scoreboard.games.map(game => ({
          gameId: game.id,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          score: `${game.home_score}-${game.away_score}`,
          date: game.date,
          description: `${game.home_team} vs ${game.away_team}`,
          playCount: 0, // Will be fetched when importing
          hasPlayByPlay: true,
          conference: 'Unknown',
          week: game.week,
          season: game.season,
          venue: game.venue,
          homeRanking: undefined,
          awayRanking: undefined
        }));
        
        console.log(`Found ${games.length} real games for week ${week}`);
      } catch (error) {
        console.error('Error fetching real games:', error);
        // Fall back to mock data if real API fails
        games = MOCK_GAMES;
      }
    } else if (useRealAPI) {
      // Fetch real games from NCAA API for the entire season
      try {
        console.log(`Fetching real games for season: ${season}`);
        const scoreboard = await fetchRecentGames(season, '1'); // Get all games for the season
        
        console.log(`ESPN API returned ${scoreboard.games.length} games`);
        
        games = scoreboard.games.map(game => ({
          gameId: game.id,
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          score: `${game.home_score}-${game.away_score}`,
          date: game.date,
          description: `${game.home_team} vs ${game.away_team}`,
          playCount: 0, // Will be fetched when importing
          hasPlayByPlay: true,
          conference: 'Unknown',
          week: game.week,
          season: game.season,
          venue: game.venue,
          homeRanking: undefined,
          awayRanking: undefined
        }));
        
        console.log(`Mapped ${games.length} games for season ${season}`);
      } catch (error) {
        console.error('Error fetching real games:', error);
        // Fall back to mock data if real API fails
        games = MOCK_GAMES;
      }
    } else {
      // Use mock data for general browsing
      games = MOCK_GAMES;
    }

    // Apply filters
    let filteredGames = games.filter(game => {
      // Filter by season
      if (game.season !== parseInt(season)) return false;
      
      // Filter by week if specified
      if (week && game.week !== parseInt(week)) return false;
      
      // Filter by team name
      if (team) {
        const teamLower = team.toLowerCase();
        if (!game.homeTeam.toLowerCase().includes(teamLower) && 
            !game.awayTeam.toLowerCase().includes(teamLower)) {
          return false;
        }
      }
      
      // Filter by conference
      if (conference && game.conference !== conference) return false;
      
      // Filter by ranking
      if (rankedOnly && !game.homeRanking && !game.awayRanking) return false;
      
      // Filter by minimum plays
      if (minPlays && game.playCount && game.playCount < minPlays) return false;
      
      return true;
    });

    // Sort by date (most recent first)
    filteredGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Add estimated play count for games without it
    filteredGames = filteredGames.map(game => ({
      ...game,
      playCount: game.playCount || Math.floor(Math.random() * 50) + 100 // Random 100-150 plays
    }));

    return NextResponse.json({
      success: true,
      games: filteredGames,
      total: filteredGames.length,
      filters: {
        team,
        season,
        week,
        conference,
        rankedOnly,
        minPlays,
        useRealAPI
      },
      source: useRealAPI ? 'ncaa_api' : 'mock_data'
    });

  } catch (error) {
    console.error('Error fetching NCAA games:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch games',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameIds, importType = 'full', teamId } = body;

    if (!gameIds || !Array.isArray(gameIds)) {
      return NextResponse.json(
        { error: 'Game IDs array is required' },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required for import' },
        { status: 400 }
      );
    }

    // Import each game using the NCAA API
    const importResults = [];
    
    for (const gameId of gameIds) {
      try {
        console.log(`Importing game ${gameId}...`);
        
        // Fetch game data directly from NCAA API functions
        const playByPlayData = await fetchGamePlayByPlay(gameId);
        
        // Import the game to database
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const importResponse = await fetch(`${baseUrl}/api/games/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            externalGameId: gameId,
            homeTeam: playByPlayData.game.home_team,
            awayTeam: playByPlayData.game.away_team,
            date: playByPlayData.game.date,
            plays: playByPlayData.plays,
            source: 'ncaa_api',
            teamId: teamId
          })
        });
        
        const importResult = await importResponse.json();
        
        importResults.push({
          gameId,
          status: importResult.success ? 'success' : 'error',
          message: importResult.success ? `Imported ${playByPlayData.plays.length} plays` : importResult.error,
          playCount: playByPlayData.plays.length
        });
        
        console.log(`Game ${gameId} imported successfully`);
        
      } catch (error) {
        console.error(`Error importing game ${gameId}:`, error);
        importResults.push({
          gameId,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          playCount: 0
        });
      }
    }

    const successCount = importResults.filter(r => r.status === 'success').length;
    const errorCount = importResults.filter(r => r.status === 'error').length;

    return NextResponse.json({
      success: true,
      message: `Import completed: ${successCount} successful, ${errorCount} failed`,
      importType,
      gameIds,
      results: importResults,
      summary: {
        total: gameIds.length,
        successful: successCount,
        failed: errorCount,
        totalPlays: importResults.reduce((sum, r) => sum + r.playCount, 0)
      }
    });

  } catch (error) {
    console.error('Error initiating game import:', error);
    return NextResponse.json(
      { error: 'Failed to initiate import' },
      { status: 500 }
    );
  }
}
