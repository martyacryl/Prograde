import { z } from 'zod';

// Team mapping interface
export interface TeamMapping {
  externalName: string;
  internalName: string;
  abbreviation: string;
  conference?: string;
  level: 'NFL' | 'COLLEGE' | 'HIGH_SCHOOL';
  confidence: number; // 0-1, how confident we are in this mapping
}

// Game mapping result
export interface GameMappingResult {
  externalGameId: string;
  internalTeamId?: string;
  internalOpponentId?: string;
  mapped: boolean;
  confidence: number;
  suggestedTeams: string[];
  mappingNotes: string[];
}

export class GameMapper {
  private teamMappings: Map<string, TeamMapping> = new Map();
  private fuzzyMatchThreshold = 0.7;

  constructor() {
    this.initializeDefaultMappings();
  }

  /**
   * Initialize default team mappings for common teams
   */
  private initializeDefaultMappings() {
    // NCAA Power 5 teams
    const ncaaTeams: TeamMapping[] = [
      { externalName: 'Ohio State', internalName: 'Ohio State Buckeyes', abbreviation: 'OSU', conference: 'Big Ten', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Michigan', internalName: 'Michigan Wolverines', abbreviation: 'MICH', conference: 'Big Ten', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Alabama', internalName: 'Alabama Crimson Tide', abbreviation: 'ALA', conference: 'SEC', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Georgia', internalName: 'Georgia Bulldogs', abbreviation: 'UGA', conference: 'SEC', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'TCU', internalName: 'TCU Horned Frogs', abbreviation: 'TCU', conference: 'Big 12', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Clemson', internalName: 'Clemson Tigers', abbreviation: 'CLEM', conference: 'ACC', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Notre Dame', internalName: 'Notre Dame Fighting Irish', abbreviation: 'ND', conference: 'Independent', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'USC', internalName: 'USC Trojans', abbreviation: 'USC', conference: 'Pac-12', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Texas', internalName: 'Texas Longhorns', abbreviation: 'TEX', conference: 'SEC', level: 'COLLEGE', confidence: 0.95 },
      { externalName: 'Oklahoma', internalName: 'Oklahoma Sooners', abbreviation: 'OU', conference: 'SEC', level: 'COLLEGE', confidence: 0.95 },
    ];

    // NFL teams
    const nflTeams: TeamMapping[] = [
      { externalName: 'Kansas City Chiefs', internalName: 'Kansas City Chiefs', abbreviation: 'KC', conference: 'AFC', level: 'NFL', confidence: 0.95 },
      { externalName: 'Philadelphia Eagles', internalName: 'Philadelphia Eagles', abbreviation: 'PHI', conference: 'NFC', level: 'NFL', confidence: 0.95 },
      { externalName: 'San Francisco 49ers', internalName: 'San Francisco 49ers', abbreviation: 'SF', conference: 'NFC', level: 'NFL', confidence: 0.95 },
      { externalName: 'Dallas Cowboys', internalName: 'Dallas Cowboys', abbreviation: 'DAL', conference: 'NFC', level: 'NFL', confidence: 0.95 },
      { externalName: 'New England Patriots', internalName: 'New England Patriots', abbreviation: 'NE', conference: 'AFC', level: 'NFL', confidence: 0.95 },
    ];

    [...ncaaTeams, ...nflTeams].forEach(team => {
      this.teamMappings.set(team.externalName.toLowerCase(), team);
    });
  }

  /**
   * Add a custom team mapping
   */
  addTeamMapping(mapping: TeamMapping) {
    this.teamMappings.set(mapping.externalName.toLowerCase(), mapping);
  }

  /**
   * Find the best team match using fuzzy string matching
   */
  findTeamMatch(externalTeamName: string): TeamMapping | null {
    const normalizedExternal = externalTeamName.toLowerCase().trim();
    
    // Exact match
    if (this.teamMappings.has(normalizedExternal)) {
      return this.teamMappings.get(normalizedExternal)!;
    }

    // Fuzzy match
    let bestMatch: TeamMapping | null = null;
    let bestScore = 0;

    for (const [key, mapping] of this.teamMappings) {
      const score = this.calculateSimilarity(normalizedExternal, key);
      if (score > bestScore && score >= this.fuzzyMatchThreshold) {
        bestScore = score;
        bestMatch = mapping;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Map an external game to internal team structure
   */
  mapGameToTeams(externalGame: {
    homeTeam: string;
    awayTeam: string;
    source: string;
    season: number;
  }): GameMappingResult {
    const homeMapping = this.findTeamMatch(externalGame.homeTeam);
    const awayMapping = this.findTeamMatch(externalGame.awayTeam);
    
    const result: GameMappingResult = {
      externalGameId: `${externalGame.source}_${externalGame.season}_${externalGame.homeTeam}_${externalGame.awayTeam}`,
      mapped: false,
      confidence: 0,
      suggestedTeams: [],
      mappingNotes: [],
    };

    if (homeMapping && awayMapping) {
      result.mapped = true;
      result.confidence = Math.min(homeMapping.confidence, awayMapping.confidence);
      result.mappingNotes.push(
        `Successfully mapped ${externalGame.homeTeam} to ${homeMapping.internalName}`,
        `Successfully mapped ${externalGame.awayTeam} to ${awayMapping.internalName}`
      );
    } else if (homeMapping || awayMapping) {
      result.confidence = (homeMapping || awayMapping)!.confidence * 0.5;
      result.mappingNotes.push(
        homeMapping 
          ? `Successfully mapped ${externalGame.homeTeam} to ${homeMapping.internalName}`
          : `Failed to map ${externalGame.homeTeam}`,
        awayMapping
          ? `Successfully mapped ${externalGame.awayTeam} to ${awayMapping.internalName}`
          : `Failed to map ${externalGame.awayTeam}`
      );
    } else {
      result.mappingNotes.push(
        `Failed to map ${externalGame.homeTeam}`,
        `Failed to map ${externalGame.awayTeam}`
      );
    }

    // Add suggestions for unmapped teams
    if (!homeMapping) {
      result.suggestedTeams.push(externalGame.homeTeam);
    }
    if (!awayMapping) {
      result.suggestedTeams.push(externalGame.awayTeam);
    }

    return result;
  }

  /**
   * Get all available team mappings
   */
  getAllTeamMappings(): TeamMapping[] {
    return Array.from(this.teamMappings.values());
  }

  /**
   * Search for teams by name or abbreviation
   */
  searchTeams(query: string): TeamMapping[] {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.teamMappings.values()).filter(mapping => 
      mapping.externalName.toLowerCase().includes(normalizedQuery) ||
      mapping.internalName.toLowerCase().includes(normalizedQuery) ||
      mapping.abbreviation.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Export team mappings for backup/import
   */
  exportTeamMappings(): string {
    return JSON.stringify(Array.from(this.teamMappings.values()), null, 2);
  }

  /**
   * Import team mappings from JSON
   */
  importTeamMappings(jsonData: string) {
    try {
      const mappings: TeamMapping[] = JSON.parse(jsonData);
      mappings.forEach(mapping => this.addTeamMapping(mapping));
    } catch (error) {
      throw new Error('Invalid team mappings JSON format');
    }
  }
}
