import { z } from 'zod';

// Standardized play data schema
export const StandardizedPlaySchema = z.object({
  id: z.string(),
  gameId: z.string(),
  quarter: z.number(),
  time: z.string(),
  down: z.number().nullable(),
  distance: z.number().nullable(),
  yardLine: z.number().nullable(),
  playType: z.string(),
  description: z.string(),
  offense: z.string(),
  defense: z.string(),
  result: z.object({
    yards: z.number().nullable(),
    success: z.boolean().nullable(),
    points: z.number().nullable(),
    turnover: z.boolean().nullable(),
    sack: z.boolean().nullable(),
    interception: z.boolean().nullable(),
    fumble: z.boolean().nullable(),
  }).nullable(),
  formation: z.string().nullable(),
  personnel: z.string().nullable(),
  blitz: z.boolean().nullable(),
  pressure: z.boolean().nullable(),
  coverage: z.string().nullable(),
  isRedZone: z.boolean(),
  isGoalToGo: z.boolean(),
  isThirdDown: z.boolean(),
  isFourthDown: z.boolean(),
});

export type StandardizedPlay = z.infer<typeof StandardizedPlaySchema>;

export class PlayParser {
  /**
   * Parse time string to quarter and time remaining
   */
  static parseTime(timeStr: string): { quarter: number; time: string } {
    // Handle various time formats
    if (timeStr.includes('Q')) {
      // Format: "Q1 15:00" or "1Q 15:00"
      const match = timeStr.match(/(?:Q?(\d+)\s*)?(.+)/);
      if (match) {
        return {
          quarter: parseInt(match[1]) || 1,
          time: match[2].trim(),
        };
      }
    }
    
    // Default to quarter 1 if can't parse
    return { quarter: 1, time: timeStr };
  }

  /**
   * Determine if play is in red zone
   */
  static isRedZone(yardLine: number | null, offense: string, defense: string): boolean {
    if (!yardLine) return false;
    
    // If offense is near opponent's end zone (yard line <= 20)
    return yardLine <= 20;
  }

  /**
   * Determine if play is goal-to-go
   */
  static isGoalToGo(down: number | null, distance: number | null, yardLine: number | null): boolean {
    if (!down || !distance || !yardLine) return false;
    
    // Goal-to-go: distance to goal is less than or equal to distance needed for first down
    return yardLine <= distance;
  }

  /**
   * Determine if play is third or fourth down
   */
  static isThirdDown(down: number | null): boolean {
    return down === 3;
  }

  static isFourthDown(down: number | null): boolean {
    return down === 4;
  }

  /**
   * Parse play type from description
   */
  static parsePlayType(description: string, playType: string): string {
    const desc = description.toLowerCase();
    
    if (desc.includes('run') || desc.includes('rush') || desc.includes('handoff')) {
      return 'RUSH';
    }
    
    if (desc.includes('pass') || desc.includes('throw') || desc.includes('completion')) {
      return 'PASS';
    }
    
    if (desc.includes('punt')) {
      return 'PUNT';
    }
    
    if (desc.includes('field goal') || desc.includes('fg')) {
      return 'FIELD_GOAL';
    }
    
    if (desc.includes('kickoff')) {
      return 'KICKOFF';
    }
    
    if (desc.includes('extra point') || desc.includes('pat')) {
      return 'EXTRA_POINT';
    }
    
    if (desc.includes('safety')) {
      return 'SAFETY';
    }
    
    if (desc.includes('penalty')) {
      return 'PENALTY';
    }
    
    if (desc.includes('timeout')) {
      return 'TIMEOUT';
    }
    
    if (desc.includes('challenge')) {
      return 'CHALLENGE';
    }
    
    return playType.toUpperCase();
  }

  /**
   * Extract formation from description
   */
  static extractFormation(description: string): string | null {
    const desc = description.toLowerCase();
    
    // Common formations
    const formations = [
      'shotgun', 'pistol', 'i-formation', 'single wing', 'wildcat',
      'spread', 'pro set', 'wishbone', 'veer', 'flexbone'
    ];
    
    for (const formation of formations) {
      if (desc.includes(formation)) {
        return formation.toUpperCase();
      }
    }
    
    return null;
  }

  /**
   * Extract personnel from description
   */
  static extractPersonnel(description: string): string | null {
    const desc = description.toLowerCase();
    
    // Look for personnel patterns like "11 personnel", "21 personnel"
    const match = desc.match(/(\d{2})\s*personnel/);
    if (match) {
      return match[1];
    }
    
    return null;
  }

  /**
   * Detect blitz from description
   */
  static detectBlitz(description: string): boolean {
    const desc = description.toLowerCase();
    return desc.includes('blitz') || desc.includes('rush') || desc.includes('pressure');
  }

  /**
   * Detect pressure from description
   */
  static detectPressure(description: string): boolean {
    const desc = description.toLowerCase();
    return desc.includes('pressure') || desc.includes('hurry') || desc.includes('hit');
  }

  /**
   * Extract coverage from description
   */
  static extractCoverage(description: string): string | null {
    const desc = description.toLowerCase();
    
    const coverages = [
      'man', 'zone', 'cover 1', 'cover 2', 'cover 3', 'cover 4',
      'quarters', 'dime', 'nickel', 'prevent'
    ];
    
    for (const coverage of coverages) {
      if (desc.includes(coverage)) {
        return coverage.toUpperCase();
      }
    }
    
    return null;
  }

  /**
   * Standardize a play from any external source
   */
  static standardizePlay(play: any, source: string): StandardizedPlay {
    const { quarter, time } = this.parseTime(play.time || '');
    const yardLine = play.yardLine || play.yard_line || null;
    const down = play.down || null;
    const distance = play.distance || null;
    
    return {
      id: play.id || play.externalId || play.play_id || '',
      gameId: play.gameId || play.externalGameId || play.game_id || '',
      quarter: play.quarter || quarter,
      time: play.time || time,
      down,
      distance,
      yardLine,
      playType: this.parsePlayType(play.description || '', play.playType || play.play_type || ''),
      description: play.description || '',
      offense: play.offense || '',
      defense: play.defense || '',
      result: {
        yards: play.result?.yards || null,
        success: play.result?.success || null,
        points: play.result?.points || null,
        turnover: play.result?.turnover || null,
        sack: play.result?.sack || null,
        interception: play.result?.interception || null,
        fumble: play.result?.fumble || null,
      },
      formation: play.formation || this.extractFormation(play.description || ''),
      personnel: play.personnel || this.extractPersonnel(play.description || ''),
      blitz: play.blitz || this.detectBlitz(play.description || ''),
      pressure: play.pressure || this.detectPressure(play.description || ''),
      coverage: play.coverage || this.extractCoverage(play.description || ''),
      isRedZone: this.isRedZone(yardLine, play.offense || '', play.defense || ''),
      isGoalToGo: this.isGoalToGo(down, distance, yardLine),
      isThirdDown: this.isThirdDown(down),
      isFourthDown: this.isFourthDown(down),
    };
  }
}
