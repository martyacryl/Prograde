import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PlayParser, StandardizedPlay } from '@/lib/data-sources/parsers/play-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalGameId, teamId, opponentId, seasonId } = body;

    if (!externalGameId || !teamId || !opponentId) {
      return NextResponse.json(
        { error: 'External game ID, team ID, and opponent ID are required' },
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

    // Create internal game
    const internalGame = await prisma.game.create({
      data: {
        date: externalGame.date,
        week: externalGame.week,
        seasonId: seasonId || 'default-season', // You might want to create a season first
        teamId,
        opponentId,
        homeAway: 'HOME', // Default, you might want to determine this from the data
        score: {
          team: externalGame.homeScore || 0,
          opponent: externalGame.awayScore || 0,
          quarter: 4, // Default to end of game
        },
      },
    });

    // Map external plays to internal plays
    const mappedPlays = [];
    for (const externalPlay of externalGame.externalPlays) {
      try {
        // Create internal play
        const internalPlay = await prisma.play.create({
          data: {
            gameId: internalGame.id,
            quarter: externalPlay.quarter,
            time: externalPlay.time,
            down: externalPlay.down || 1,
            distance: externalPlay.distance || 10,
            playType: mapPlayType(externalPlay.playType),
            playAction: null,
            result: {
              yards: 0,
              success: false,
              points: 0,
            },
            isRedZone: externalPlay.yardLine ? externalPlay.yardLine <= 20 : false,
            isGoalToGo: externalPlay.yardLine && externalPlay.distance ? externalPlay.yardLine <= externalPlay.distance : false,
            isThirdDown: externalPlay.down === 3,
            isFourthDown: externalPlay.down === 4,
            playersInvolved: {},
          },
        });

        // Link external play to internal play
        await prisma.externalPlay.update({
          where: { id: externalPlay.id },
          data: { mappedPlayId: internalPlay.id },
        });

        mappedPlays.push({
          externalPlayId: externalPlay.id,
          internalPlayId: internalPlay.id,
          quarter: externalPlay.quarter,
          time: externalPlay.time,
          playType: externalPlay.playType,
          description: externalPlay.description,
        });
      } catch (error) {
        console.error(`Error mapping play ${externalPlay.id}:`, error);
      }
    }

    // Update external game with mapping
    await prisma.externalGame.update({
      where: { id: externalGameId },
      data: { mappedGameId: internalGame.id },
    });

    return NextResponse.json({
      success: true,
      mapped: mappedPlays.length,
      total: externalGame.externalPlays.length,
      internalGameId: internalGame.id,
      mappedPlays,
      message: `Successfully mapped ${mappedPlays.length} plays to internal game ${internalGame.id}`,
    });

  } catch (error) {
    console.error('Error mapping plays:', error);
    return NextResponse.json(
      { error: 'Failed to map plays', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Map external play type to internal play type
 */
function mapPlayType(externalPlayType: string): 'RUSH' | 'PASS' | 'PUNT' | 'FIELD_GOAL' | 'KICKOFF' | 'EXTRA_POINT' | 'SAFETY' | 'PENALTY' | 'TIMEOUT' | 'CHALLENGE' {
  const playTypeMap: { [key: string]: 'RUSH' | 'PASS' | 'PUNT' | 'FIELD_GOAL' | 'KICKOFF' | 'EXTRA_POINT' | 'SAFETY' | 'PENALTY' | 'TIMEOUT' | 'CHALLENGE' } = {
    'RUSH': 'RUSH',
    'PASS': 'PASS',
    'PUNT': 'PUNT',
    'FIELD_GOAL': 'FIELD_GOAL',
    'KICKOFF': 'KICKOFF',
    'EXTRA_POINT': 'EXTRA_POINT',
    'SAFETY': 'SAFETY',
    'PENALTY': 'PENALTY',
    'TIMEOUT': 'TIMEOUT',
    'CHALLENGE': 'CHALLENGE',
  };

  const normalizedType = externalPlayType.toUpperCase();
  return playTypeMap[normalizedType] || 'RUSH'; // Default to RUSH if unknown
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalGameId = searchParams.get('externalGameId');
    const internalGameId = searchParams.get('internalGameId');

    if (!externalGameId && !internalGameId) {
      return NextResponse.json(
        { error: 'Either external game ID or internal game ID is required' },
        { status: 400 }
      );
    }

    let where: any = {};
    if (externalGameId) where.externalGameId = externalGameId;
    if (internalGameId) where.mappedPlayId = internalGameId;

    const mappings = await prisma.externalPlay.findMany({
      where,
      include: {
        externalGame: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            date: true,
            source: true,
          },
        },
        mappedPlay: {
          select: {
            id: true,
            quarter: true,
            time: true,
            playType: true,
          },
        },
      },
      orderBy: [
        { quarter: 'asc' },
        { time: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      mappings,
      total: mappings.length,
    });

  } catch (error) {
    console.error('Error fetching play mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch play mappings' },
      { status: 500 }
    );
  }
}
