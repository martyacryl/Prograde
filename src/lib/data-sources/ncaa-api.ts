import axios from 'axios';

// NCAA API base configuration - Using ESPN API (free, no auth required)
const NCAA_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';

// NCAA API response types
export interface NCAAGame {
  id: string;
  season: number;
  week: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  date: string;
  venue: string;
  status: string;
  quarter: number;
  time: string;
}

export interface NCAAPlay {
  id: string;
  game_id: string;
  quarter: number;
  time: string;
  down: number;
  distance: number;
  yard_line: number;
  play_type: string;
  description: string;
  offense: string;
  defense: string;
  result: {
    yards: number;
    success: boolean;
    points: number;
    turnover: boolean;
  };
  formation: string;
  personnel: string;
}

export interface NCAAScoreboard {
  games: NCAAGame[];
  last_updated: string;
}

export interface NCAAPlayByPlay {
  game: NCAAGame;
  plays: NCAAPlay[];
}

/**
 * Fetch play-by-play data for a specific game
 */
export async function fetchGamePlayByPlay(gameId: string): Promise<NCAAPlayByPlay> {
  try {
    console.log(`[fetchGamePlayByPlay] Fetching game ${gameId}`);
    const response = await axios.get(`${NCAA_API_BASE}/summary?event=${gameId}`);
    console.log(`[fetchGamePlayByPlay] Got response, status: ${response.status}`);
    
    const gameData = response.data.header;
    const drivesData = response.data.drives || [];
    console.log(`[fetchGamePlayByPlay] Drives data type:`, typeof drivesData);
    console.log(`[fetchGamePlayByPlay] Drives data keys:`, Object.keys(drivesData));
    
    // Map ESPN data to our internal format
    const homeTeam = gameData.competitions[0]?.competitors.find((c: any) => c.homeAway === 'home');
    const awayTeam = gameData.competitions[0]?.competitors.find((c: any) => c.homeAway === 'away');
    
    const game: NCAAGame = {
      id: gameData.id,
      season: gameData.season.year,
      week: typeof gameData.week === 'number' ? gameData.week : gameData.week.number,
      home_team: homeTeam?.team.name || '',
      away_team: awayTeam?.team.name || '',
      home_score: homeTeam?.score ? parseInt(homeTeam.score) : 0,
      away_score: awayTeam?.score ? parseInt(awayTeam.score) : 0,
      date: gameData.date,
      venue: gameData.competitions?.[0]?.venue?.fullName || '',
      status: 'final',
      quarter: 4,
      time: '0:00'
    };
    
    // Extract plays from drives
    const allPlays: any[] = [];
    const drivesArray = drivesData.previous || drivesData || [];
    console.log(`[fetchGamePlayByPlay] Drives array length:`, Array.isArray(drivesArray) ? drivesArray.length : 'not an array');
    
    drivesArray.forEach((drive: any) => {
      if (drive.plays && Array.isArray(drive.plays)) {
        allPlays.push(...drive.plays);
      }
    });
    
    console.log(`[fetchGamePlayByPlay] Total plays extracted:`, allPlays.length);
    
    const plays: NCAAPlay[] = allPlays.map((play: any) => ({
      id: play.id,
      game_id: gameId,
      quarter: play.period.number,
      time: play.clock.displayValue,
      down: play.start.down,
      distance: play.start.distance,
      yard_line: play.start.yardLine,
      play_type: play.type.text,
      description: play.text,
      offense: '', // Will be determined by context
      defense: '', // Will be determined by context
      result: {
        yards: play.statYardage || 0,
        success: true,
        points: play.scoringPlay ? (play.type.text.includes('Touchdown') ? 6 : 3) : 0,
        turnover: false
      },
      formation: '',
      personnel: ''
    }));
    
    console.log(`[fetchGamePlayByPlay] Successfully mapped ${plays.length} plays`);
    return { game, plays };
  } catch (error) {
    console.error(`[fetchGamePlayByPlay] Error fetching play-by-play for game ${gameId}:`, error);
    if (axios.isAxiosError(error)) {
      console.error(`[fetchGamePlayByPlay] Axios error details:`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
    throw new Error(`Failed to fetch play-by-play data for game ${gameId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch recent games from scoreboard
 */
export async function fetchRecentGames(season: string, week?: string): Promise<NCAAScoreboard> {
  try {
    let allGames: NCAAGame[] = [];
    
    if (week && week !== '1') {
      // Fetch games for specific week
      const response = await axios.get(`${NCAA_API_BASE}/scoreboard`, {
        params: {
          week: week,
          year: season,
          limit: 1000,
        }
      });
      
      allGames = (response.data.events || []).map((event: any) => {
        const homeTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'home');
        const awayTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'away');
        
        return {
          id: event.id,
          season: event.season.year,
          week: event.week.number,
          home_team: homeTeam?.team.name || '',
          away_team: awayTeam?.team.name || '',
          home_score: homeTeam?.score ? parseInt(homeTeam.score) : 0,
          away_score: awayTeam?.score ? parseInt(awayTeam.score) : 0,
          date: event.date,
          venue: event.competitions[0]?.venue.fullName || '',
          status: 'final',
          quarter: 4,
          time: '0:00'
        };
      });
    } else {
      // Fetch games for all weeks of the season (weeks 1-15)
      console.log(`Fetching all games for season ${season}...`);
      
      for (let weekNum = 1; weekNum <= 5; weekNum++) {
        try {
          console.log(`Fetching week ${weekNum}...`);
          const response = await axios.get(`${NCAA_API_BASE}/scoreboard`, {
            params: {
              week: weekNum,
              year: season,
              limit: 1000,
            }
          });
          
          const weekGames = (response.data.events || []).map((event: any) => {
            const homeTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'home');
            const awayTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'away');
            
            return {
              id: event.id,
              season: event.season.year,
              week: event.week.number,
              home_team: homeTeam?.team.name || '',
              away_team: awayTeam?.team.name || '',
              home_score: homeTeam?.score ? parseInt(homeTeam.score) : 0,
              away_score: awayTeam?.score ? parseInt(awayTeam.score) : 0,
              date: event.date,
              venue: event.competitions[0]?.venue.fullName || '',
              status: 'final',
              quarter: 4,
              time: '0:00'
            };
          });
          
          allGames = allGames.concat(weekGames);
          console.log(`Week ${weekNum}: ${weekGames.length} games (Total: ${allGames.length})`);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`No games found for week ${weekNum} (this is normal)`);
        }
      }
    }
    
    console.log(`Total games found for season ${season}: ${allGames.length}`);
    
    return {
      games: allGames,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching scoreboard for ${season} week ${week}:`, error);
    throw new Error(`Failed to fetch scoreboard data for ${season} week ${week}`);
  }
}

/**
 * Fetch specific game details
 */
export async function fetchGameDetails(gameId: string): Promise<NCAAGame> {
  try {
    const response = await axios.get(`${NCAA_API_BASE}/game/${gameId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching game details for ${gameId}:`, error);
    throw new Error(`Failed to fetch game details for ${gameId}`);
  }
}

/**
 * Search for games by team or date
 */
export async function searchGames(query: string, season?: string): Promise<NCAAGame[]> {
  try {
    const params = new URLSearchParams({ q: query });
    if (season) params.append('season', season);
    
    const response = await axios.get(`${NCAA_API_BASE}/search/games?${params}`);
    return response.data.games || [];
  } catch (error) {
    console.error(`Error searching games with query "${query}":`, error);
    throw new Error(`Failed to search games with query "${query}"`);
  }
}

/**
 * Get team schedule for a specific season
 */
export async function getTeamSchedule(teamName: string, season: string): Promise<NCAAGame[]> {
  try {
    // ESPN doesn't have a direct team schedule endpoint, so we'll fetch all games for the season
    // and filter by team name
    const response = await axios.get(`${NCAA_API_BASE}/scoreboard`, {
      params: {
        year: season,
        limit: 1000, // Get more games to find team matches
      }
    });
    
    const allGames = response.data.events || [];
    
    // Filter games that include the team name
    const teamGames = allGames.filter((event: any) => {
      const homeTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'away');
      
      const homeTeamName = homeTeam?.team.name?.toLowerCase() || '';
      const awayTeamName = awayTeam?.team.name?.toLowerCase() || '';
      const searchTeamName = teamName.toLowerCase();
      
      return homeTeamName.includes(searchTeamName) || awayTeamName.includes(searchTeamName);
    });
    
    return teamGames.map((event: any) => {
      const homeTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'home');
      const awayTeam = event.competitions[0]?.competitors.find((c: any) => c.homeAway === 'away');
      
      return {
        id: event.id,
        season: event.season.year,
        week: event.week.number,
        home_team: homeTeam?.team.name || '',
        away_team: awayTeam?.team.name || '',
        home_score: homeTeam?.score ? parseInt(homeTeam.score) : 0,
        away_score: awayTeam?.score ? parseInt(awayTeam.score) : 0,
        date: event.date,
        venue: event.competitions[0]?.venue.fullName || '',
        status: 'final',
        quarter: 4,
        time: '0:00'
      };
    });
  } catch (error) {
    console.error(`Error fetching schedule for ${teamName} ${season}:`, error);
    throw new Error(`Failed to fetch schedule for ${teamName} ${season}`);
  }
}

/**
 * Map NCAA API data to internal schema
 */
export function mapNCAAGameToExternal(ncaaGame: NCAAGame) {
  return {
    externalId: ncaaGame.id,
    source: 'ncaa_api',
    season: ncaaGame.season,
    week: ncaaGame.week,
    homeTeam: ncaaGame.home_team,
    awayTeam: ncaaGame.away_team,
    homeScore: ncaaGame.home_score,
    awayScore: ncaaGame.away_score,
    date: new Date(ncaaGame.date),
    venue: ncaaGame.venue,
    rawData: JSON.parse(JSON.stringify(ncaaGame)),
  };
}

export function mapNCAAPlayToExternal(ncaaPlay: NCAAPlay, externalGameId: string) {
  return {
    externalGameId,
    externalId: ncaaPlay.id,
    source: 'ncaa_api',
    quarter: ncaaPlay.quarter,
    time: ncaaPlay.time,
    down: ncaaPlay.down,
    distance: ncaaPlay.distance,
    yardLine: ncaaPlay.yard_line,
    playType: ncaaPlay.play_type,
    description: ncaaPlay.description,
    offense: ncaaPlay.offense,
    defense: ncaaPlay.defense,
    rawData: JSON.parse(JSON.stringify(ncaaPlay)),
  };
}

/**
 * Get specific test games for development
 */
export const TEST_GAMES = {
  MICHIGAN_OHIO_STATE_2023: {
    id: '3146430',
    description: 'Michigan vs Ohio State 2023',
    season: 2023,
    week: 13,
    expectedPlays: 150, // Expected number of plays
  },
  ALABAMA_GEORGIA_SEC_2023: {
    id: '3146431', // Replace with actual game ID
    description: 'Alabama vs Georgia SEC Championship 2023',
    season: 2023,
    week: 15,
    expectedPlays: 140,
  },
  CFP_SEMIFINAL_2023: {
    id: '3146432', // Replace with actual game ID
    description: 'CFP Semifinal 2023',
    season: 2023,
    week: 16,
    expectedPlays: 160,
  },
};

/**
 * Fetch test game data for development
 */
export async function fetchTestGameData() {
  const testGames = [];
  
  for (const [key, game] of Object.entries(TEST_GAMES)) {
    try {
      console.log(`Fetching test game: ${game.description}`);
      const playByPlay = await fetchGamePlayByPlay(game.id);
      testGames.push({
        key,
        game: playByPlay.game,
        plays: playByPlay.plays,
        playCount: playByPlay.plays.length,
        expectedPlays: game.expectedPlays,
      });
    } catch (error) {
      console.error(`Failed to fetch test game ${key}:`, error);
    }
  }
  
  return testGames;
}
