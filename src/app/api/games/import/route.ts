import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Assuming you have Prisma set up

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalGameId, homeTeam, awayTeam, date, plays, source } = body;

    // Create the game record
    const game = await prisma.game.create({
      data: {
        date: new Date(date),
        week: Math.ceil(new Date(date).getDate() / 7), // Simple week calculation
        season: new Date(date).getFullYear(),
        teamId: 'default-team-id', // TODO: Map to actual team
        opponentId: 'opponent-team-id', // TODO: Map to actual opponent
        homeAway: 'HOME', // TODO: Determine home/away
        score: null // Will be filled later if available
      }
    });

    // Create play records
    if (plays && plays.length > 0) {
      const playRecords = plays.map((play: any, index: number) => ({
        gameId: game.id,
        quarter: play.quarter || Math.ceil((index + 1) / 40),
        time: play.time || '15:00',
        down: play.down || 1,
        distance: play.distance || 10,
        yardLine: play.yardLine || 25,
        playType: play.playType || 'RUSH',
        result: play.result || {},
        description: play.description || `Play ${index + 1}`,
        externalPlayId: play.id?.toString(),
        externalSource: source
      }));

      await prisma.play.createMany({
        data: playRecords
      });
    }

    // Create external game record for tracking
    await prisma.externalGame.create({
      data: {
        externalId: externalGameId,
        source: source,
        season: new Date(date).getFullYear(),
        week: Math.ceil(new Date(date).getDate() / 7),
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        date: new Date(date),
        rawData: { homeTeam, awayTeam, plays: plays?.length || 0 },
        mappedGameId: game.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      gameId: game.id,
      message: `Imported ${plays?.length || 0} plays for ${homeTeam} vs ${awayTeam}`
    });

  } catch (error) {
    console.error('Game import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to import game' 
    }, { status: 500 });
  }
}


