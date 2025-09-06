import { z } from 'zod';

// Kaggle NCAA dataset schemas
export const KaggleNCAAGameSchema = z.object({
  id: z.string(),
  season: z.number(),
  week: z.number(),
  home_team: z.string(),
  away_team: z.string(),
  home_score: z.number().optional(),
  away_score: z.number().optional(),
  date: z.string(),
  venue: z.string().optional(),
  conference: z.string().optional(),
  division: z.string().optional(),
});

export const KaggleNCAAPlaySchema = z.object({
  id: z.string(),
  game_id: z.string(),
  quarter: z.number(),
  time: z.string(),
  down: z.number().optional(),
  distance: z.number().optional(),
  yard_line: z.number().optional(),
  play_type: z.string(),
  description: z.string(),
  offense: z.string(),
  defense: z.string(),
  result: z.object({
    yards: z.number().optional(),
    success: z.boolean().optional(),
    points: z.number().optional(),
  }).optional(),
  formation: z.string().optional(),
  personnel: z.string().optional(),
});

export type KaggleNCAAGame = z.infer<typeof KaggleNCAAGameSchema>;
export type KaggleNCAAPlay = z.infer<typeof KaggleNCAAPlaySchema>;

export class KaggleNCAADataSource {
  private apiKey: string;
  private username: string;

  constructor(username: string, apiKey: string) {
    this.username = username;
    this.apiKey = apiKey;
  }

  /**
   * Parse CSV data from Kaggle NCAA datasets
   */
  async parseGamesCSV(csvData: string): Promise<KaggleNCAAGame[]> {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const game: any = {};
      
      headers.forEach((header, i) => {
        const value = values[i];
        switch (header) {
          case 'season':
          case 'week':
            game[header] = parseInt(value) || 0;
            break;
          case 'home_score':
          case 'away_score':
            game[header.replace('_', '_')] = parseInt(value) || undefined;
            break;
          default:
            game[header.replace('_', '')] = value;
        }
      });
      
      return KaggleNCAAGameSchema.parse(game);
    });
  }

  async parsePlaysCSV(csvData: string): Promise<KaggleNCAAPlay[]> {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const play: any = {};
      
      headers.forEach((header, i) => {
        const value = values[i];
        switch (header) {
          case 'quarter':
          case 'down':
          case 'distance':
          case 'yard_line':
            play[header.replace('_', '')] = parseInt(value) || undefined;
            break;
          case 'game_id':
            play[header.replace('_', '')] = value;
            break;
          default:
            play[header.replace('_', '')] = value;
        }
      });
      
      return KaggleNCAAPlaySchema.parse(play);
    });
  }

  /**
   * Map Kaggle data to internal schema
   */
  mapGameToExternal(game: KaggleNCAAGame) {
    return {
      externalId: game.id,
      source: 'kaggle_ncaa',
      season: game.season,
      week: game.week,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      homeScore: game.home_score,
      awayScore: game.away_score,
      date: new Date(game.date),
      venue: game.venue,
      rawData: game,
    };
  }

  mapPlayToExternal(play: KaggleNCAAPlay, externalGameId: string) {
    return {
      externalGameId,
      externalId: play.id,
      source: 'kaggle_ncaa',
      quarter: play.quarter,
      time: play.time,
      down: play.down,
      distance: play.distance,
      yardLine: play.yard_line,
      playType: play.play_type,
      description: play.description,
      offense: play.offense,
      defense: play.defense,
      rawData: play,
    };
  }
}
