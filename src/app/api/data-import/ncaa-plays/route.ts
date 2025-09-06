import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { PlayParser, StandardizedPlay } from '@/lib/data-sources/parsers/play-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalGameId, plays, source } = body;

    if (!externalGameId || !plays || !Array.isArray(plays)) {
      return NextResponse.json(
        { error: 'External game ID and plays array are required' },
        { status: 400 }
      );
    }

    // Verify the external game exists
    const externalGame = await prisma.externalGame.findUnique({
      where: { id: externalGameId },
    });

    if (!externalGame) {
      return NextResponse.json(
        { error: 'External game not found' },
        { status: 404 }
      );
    }

    // Standardize plays using PlayParser
    const standardizedPlays: StandardizedPlay[] = plays.map((play: any) =>
      PlayParser.standardizePlay(play, source)
    );

    // Import plays to database
    const importedPlays = [];
    for (const play of standardizedPlays) {
      try {
        const importedPlay = await prisma.externalPlay.create({
          data: {
            externalGameId,
            externalId: play.id,
            source: source || 'unknown',
            quarter: play.quarter,
            time: play.time,
            down: play.down,
            distance: play.distance,
            yardLine: play.yardLine,
            playType: play.playType,
            description: play.description,
            offense: play.offense,
            defense: play.defense,
            rawData: play,
          },
        });

        importedPlays.push(importedPlay);
      } catch (error) {
        console.error(`Error importing play ${play.id}:`, error);
      }
    }

    // Update external game with play count
    await prisma.externalGame.update({
      where: { id: externalGameId },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      imported: importedPlays.length,
      total: plays.length,
      externalGameId,
      message: `Successfully imported ${importedPlays.length} plays for game ${externalGameId}`,
    });

  } catch (error) {
    console.error('Error importing NCAA plays:', error);
    return NextResponse.json(
      { error: 'Failed to import NCAA plays', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const externalGameId = searchParams.get('externalGameId');
    const source = searchParams.get('source');
    const playType = searchParams.get('playType');

    if (!externalGameId) {
      return NextResponse.json(
        { error: 'External game ID is required' },
        { status: 400 }
      );
    }

    const where: any = { externalGameId };
    if (source) where.source = source;
    if (playType) where.playType = playType;

    const plays = await prisma.externalPlay.findMany({
      where,
      orderBy: [
        { quarter: 'asc' },
        { time: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      plays,
      total: plays.length,
    });

  } catch (error) {
    console.error('Error fetching NCAA plays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NCAA plays' },
      { status: 500 }
    );
  }
}
