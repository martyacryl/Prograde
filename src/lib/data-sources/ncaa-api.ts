import axios from 'axios';

// NCAA API base configuration
const NCAA_API_BASE = process.env.NCAA_API_BASE || 'http://localhost:3000';

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
    const response = await axios.get(`${NCAA_API_BASE}/game/${gameId}/play-by-play`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching play-by-play for game ${gameId}:`, error);
    throw new Error(`Failed to fetch play-by-play data for game ${gameId}`);
  }
}

/**
 * Fetch recent games from scoreboard
 */
export async function fetchRecentGames(season: string, week: string): Promise<NCAAScoreboard> {
  try {
    const response = await axios.get(`${NCAA_API_BASE}/scoreboard/football/fbs/${season}/${week}/all-conf`);
    return response.data;
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
    const response = await axios.get(`${NCAA_API_BASE}/team/${teamName}/schedule/${season}`);
    return response.data.games || [];
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
    rawData: ncaaGame,
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
    rawData: ncaaPlay,
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
