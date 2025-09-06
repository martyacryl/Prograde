import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { StandardizedPlaySchema } from '@/lib/data-sources/parsers/play-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalGameId } = body;

    if (!externalGameId) {
      return NextResponse.json(
        { error: 'External game ID is required' },
        { status: 400 }
      );
    }

    // Get the external game and its plays
    const externalGame = await prisma.externalGame.findUnique({
      where: { id: externalGameId },
      include: {
        externalPlays: {
          orderBy: [
            { quarter: 'asc' },
            { time: 'asc' },
          ],
        },
      },
    });

    if (!externalGame) {
      return NextResponse.json(
        { error: 'External game not found' },
        { status: 404 }
      );
    }

    // Validate data quality
    const validationResults = await validateExternalGame(externalGame);

    return NextResponse.json({
      success: true,
      externalGameId,
      validationResults,
      message: 'Data validation completed',
    });

  } catch (error) {
    console.error('Error validating data:', error);
    return NextResponse.json(
      { error: 'Failed to validate data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Validate external game data quality
 */
async function validateExternalGame(externalGame: any) {
  const results = {
    game: {
      isValid: true,
      issues: [] as string[],
      warnings: [] as string[],
    },
    plays: {
      total: externalGame.externalPlays.length,
      valid: 0,
      invalid: 0,
      issues: [] as string[],
      warnings: [] as string[],
    },
    overall: {
      score: 0,
      quality: 'unknown' as 'excellent' | 'good' | 'fair' | 'poor',
    },
  };

  // Validate game data
  if (!externalGame.homeTeam || !externalGame.awayTeam) {
    results.game.isValid = false;
    results.game.issues.push('Missing team information');
  }

  if (!externalGame.date) {
    results.game.isValid = false;
    results.game.issues.push('Missing game date');
  }

  if (externalGame.season < 2000 || externalGame.season > 2030) {
    results.game.warnings.push('Season year seems unusual');
  }

  // Validate plays
  for (const play of externalGame.externalPlays) {
    try {
      // Try to validate against standardized schema
      StandardizedPlaySchema.parse(play);
      results.plays.valid++;
    } catch (error) {
      results.plays.invalid++;
      if (error instanceof Error) {
        results.plays.issues.push(`Play ${play.externalId}: ${error.message}`);
      }
    }

    // Check for common data quality issues
    if (!play.description || play.description.length < 5) {
      results.plays.warnings.push(`Play ${play.externalId}: Very short or missing description`);
    }

    if (play.quarter < 1 || play.quarter > 4) {
      results.plays.issues.push(`Play ${play.externalId}: Invalid quarter (${play.quarter})`);
    }

    if (play.down && (play.down < 1 || play.down > 4)) {
      results.plays.issues.push(`Play ${play.externalId}: Invalid down (${play.down})`);
    }

    if (play.yardLine && (play.yardLine < 0 || play.yardLine > 100)) {
      results.plays.issues.push(`Play ${play.externalId}: Invalid yard line (${play.yardLine})`);
    }
  }

  // Calculate overall quality score
  const totalPlays = results.plays.total;
  const validPlays = results.plays.valid;
  const gameScore = results.game.isValid ? 100 : 50;
  const playsScore = totalPlays > 0 ? (validPlays / totalPlays) * 100 : 0;
  
  results.overall.score = Math.round((gameScore + playsScore) / 2);

  // Determine quality level
  if (results.overall.score >= 90) {
    results.overall.quality = 'excellent';
  } else if (results.overall.score >= 75) {
    results.overall.quality = 'good';
  } else if (results.overall.score >= 60) {
    results.overall.quality = 'fair';
  } else {
    results.overall.quality = 'poor';
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const season = searchParams.get('season');
    const quality = searchParams.get('quality');

    // Get validation summary for multiple games
    const where: any = {};
    if (source) where.source = source;
    if (season) where.season = parseInt(season);

    const externalGames = await prisma.externalGame.findMany({
      where,
      include: {
        _count: {
          select: { externalPlays: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    // Calculate summary statistics
    const summary = {
      total: externalGames.length,
      bySource: {} as { [key: string]: number },
      bySeason: {} as { [key: string]: number },
      averagePlays: 0,
      totalPlays: 0,
    };

    externalGames.forEach(game => {
      // Count by source
      summary.bySource[game.source] = (summary.bySource[game.source] || 0) + 1;
      
      // Count by season
      summary.bySeason[game.season.toString()] = (summary.bySeason[game.season.toString()] || 0) + 1;
      
      // Count plays
      summary.totalPlays += game._count.externalPlays;
    });

    summary.averagePlays = summary.total > 0 ? Math.round(summary.totalPlays / summary.total) : 0;

    return NextResponse.json({
      success: true,
      summary,
      games: externalGames.map(game => ({
        id: game.id,
        externalId: game.externalId,
        source: game.source,
        season: game.season,
        week: game.week,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        date: game.date,
        playCount: game._count.externalPlays,
        isMapped: !!game.mappedGameId,
      })),
    });

  } catch (error) {
    console.error('Error fetching validation summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch validation summary' },
      { status: 500 }
    );
  }
}
