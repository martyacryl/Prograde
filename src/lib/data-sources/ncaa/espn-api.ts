import axios from 'axios';

export interface ESPNGame {
  id: string;
  date: string;
  season: {
    year: number;
    type: number;
  };
  week: {
    number: number;
  };
  competitions: Array<{
    competitors: Array<{
      team: {
        name: string;
        abbreviation: string;
      };
      score: string;
      homeAway: 'home' | 'away';
    }>;
    venue: {
      fullName: string;
    };
  }>;
}

export interface ESPNPlay {
  id: string;
  sequenceNumber: number;
  text: string;
  scoreValue: number;
  team: {
    id: string;
    name: string;
  };
  clock: {
    displayValue: string;
    value: number;
  };
  period: {
    number: number;
  };
  playType: {
    text: string;
  };
  start: {
    down: number;
    distance: number;
    yardLine: number;
  };
}

export class ESPNNCAADataSource {
  private apiKey: string;
  private baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get NCAA games for a specific season and week
   */
  async getGames(season: number, week: number): Promise<ESPNGame[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/scoreboard`, {
        params: {
          week: week,
          year: season,
          limit: 100,
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data.events || [];
    } catch (error) {
      console.error('Error fetching ESPN NCAA games:', error);
      throw new Error('Failed to fetch ESPN NCAA games');
    }
  }

  /**
   * Get detailed game information including plays
   */
  async getGameDetails(gameId: string): Promise<{
    game: ESPNGame;
    plays: ESPNPlay[];
  }> {
    try {
      const [gameResponse, playsResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/summary?event=${gameId}`),
        axios.get(`${this.baseUrl}/summary?event=${gameId}&plays=true`),
      ]);

      return {
        game: gameResponse.data.header,
        plays: playsResponse.data.plays || [],
      };
    } catch (error) {
      console.error('Error fetching ESPN game details:', error);
      throw new Error('Failed to fetch ESPN game details');
    }
  }

  /**
   * Map ESPN data to internal schema
   */
  mapGameToExternal(espnGame: ESPNGame) {
    const homeTeam = espnGame.competitions[0]?.competitors.find(c => c.homeAway === 'home');
    const awayTeam = espnGame.competitions[0]?.competitors.find(c => c.homeAway === 'away');

    return {
      externalId: espnGame.id,
      source: 'espn',
      season: espnGame.season.year,
      week: espnGame.week.number,
      homeTeam: homeTeam?.team.name || '',
      awayTeam: awayTeam?.team.name || '',
      homeScore: homeTeam?.score ? parseInt(homeTeam.score) : undefined,
      awayScore: awayTeam?.score ? parseInt(awayTeam.score) : undefined,
      date: new Date(espnGame.date),
      venue: espnGame.competitions[0]?.venue.fullName,
      rawData: espnGame,
    };
  }

  mapPlayToExternal(espnPlay: ESPNPlay, externalGameId: string) {
    return {
      externalGameId,
      externalId: espnPlay.id,
      source: 'espn',
      quarter: espnPlay.period.number,
      time: espnPlay.clock.displayValue,
      down: espnPlay.start.down,
      distance: espnPlay.start.distance,
      yardLine: espnPlay.start.yardLine,
      playType: espnPlay.playType.text,
      description: espnPlay.text,
      offense: espnPlay.team.name,
      defense: '', // ESPN doesn't provide defense team directly
      rawData: espnPlay,
    };
  }
}
