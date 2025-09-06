import axios from 'axios';

export interface SportsReferenceGame {
  id: string;
  date: string;
  season: number;
  week: number;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  venue: string;
  attendance: number;
  home_team_rank: number | null;
  away_team_rank: number | null;
}

export interface SportsReferencePlay {
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
  };
}

export class SportsReferenceDataSource {
  private apiKey: string;
  private baseUrl = 'https://api.sports-reference.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get NCAA games for a specific season
   */
  async getGames(season: number): Promise<SportsReferenceGame[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/cfb/games`, {
        params: {
          year: season,
          api_key: this.apiKey,
        },
      });

      return response.data.games || [];
    } catch (error) {
      console.error('Error fetching Sports Reference NCAA games:', error);
      throw new Error('Failed to fetch Sports Reference NCAA games');
    }
  }

  /**
   * Get detailed game information including plays
   */
  async getGameDetails(gameId: string): Promise<{
    game: SportsReferenceGame;
    plays: SportsReferencePlay[];
  }> {
    try {
      const [gameResponse, playsResponse] = await Promise.all([
        axios.get(`${this.baseUrl}/cfb/games/${gameId}`, {
          params: { api_key: this.apiKey },
        }),
        axios.get(`${this.baseUrl}/cfb/games/${gameId}/plays`, {
          params: { api_key: this.apiKey },
        }),
      ]);

      return {
        game: gameResponse.data,
        plays: playsResponse.data.plays || [],
      };
    } catch (error) {
      console.error('Error fetching Sports Reference game details:', error);
      throw new Error('Failed to fetch Sports Reference game details');
    }
  }

  /**
   * Get team schedule for a specific season
   */
  async getTeamSchedule(teamName: string, season: number): Promise<SportsReferenceGame[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/cfb/teams/${teamName}/schedule`, {
        params: {
          year: season,
          api_key: this.apiKey,
        },
      });

      return response.data.games || [];
    } catch (error) {
      console.error('Error fetching Sports Reference team schedule:', error);
      throw new Error('Failed to fetch Sports Reference team schedule');
    }
  }

  /**
   * Map Sports Reference data to internal schema
   */
  mapGameToExternal(srGame: SportsReferenceGame) {
    return {
      externalId: srGame.id,
      source: 'sports_reference',
      season: srGame.season,
      week: srGame.week,
      homeTeam: srGame.home_team,
      awayTeam: srGame.away_team,
      homeScore: srGame.home_score,
      awayScore: srGame.away_score,
      date: new Date(srGame.date),
      venue: srGame.venue,
      rawData: srGame,
    };
  }

  mapPlayToExternal(srPlay: SportsReferencePlay, externalGameId: string) {
    return {
      externalGameId,
      externalId: srPlay.id,
      source: 'sports_reference',
      quarter: srPlay.quarter,
      time: srPlay.time,
      down: srPlay.down,
      distance: srPlay.distance,
      yardLine: srPlay.yard_line,
      playType: srPlay.play_type,
      description: srPlay.description,
      offense: srPlay.offense,
      defense: srPlay.defense,
      rawData: srPlay,
    };
  }
}
