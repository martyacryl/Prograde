import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      teamId, 
      opponentId, 
      gameDate, 
      gradingMode = 'QUICK',
      activeGraders = [],
      currentQuarter = 1,
      currentTime = '15:00'
    } = body;

    if (!teamId || !opponentId || !gameDate) {
      return NextResponse.json(
        { error: 'Team ID, opponent ID, and game date are required' },
        { status: 400 }
      );
    }

    // Verify teams exist
    const [team, opponent] = await Promise.all([
      prisma.team.findUnique({ where: { id: teamId } }),
      prisma.team.findUnique({ where: { id: opponentId } })
    ]);

    if (!team || !opponent) {
      return NextResponse.json(
        { error: 'One or both teams not found' },
        { status: 404 }
      );
    }

    // Check if game already exists for this team on this date
    const existingGame = await prisma.liveGame.findUnique({
      where: { teamId_gameDate: { teamId, gameDate: new Date(gameDate) } }
    });

    if (existingGame) {
      return NextResponse.json(
        { error: 'A game already exists for this team on this date' },
        { status: 409 }
      );
    }

    // Create the live game
    const liveGame = await prisma.liveGame.create({
      data: {
        teamId,
        opponentId,
        gameDate: new Date(gameDate),
        status: 'PRE_GAME',
        currentQuarter,
        currentTime,
        teamScore: 0,
        opponentScore: 0,
        gradingMode,
        activeGraders,
      },
      include: {
        team: {
          select: { name: true, abbreviation: true }
        },
        opponent: {
          select: { name: true, abbreviation: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Live game created successfully',
      game: liveGame,
    });

  } catch (error) {
    console.error('Error creating live game:', error);
    return NextResponse.json(
      { error: 'Failed to create live game', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const status = searchParams.get('status');

    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (status) where.status = status;

    const liveGames = await prisma.liveGame.findMany({
      where,
      include: {
        team: {
          select: { name: true, abbreviation: true }
        },
        opponent: {
          select: { name: true, abbreviation: true }
        },
        _count: {
          select: { livePlay: true }
        }
      },
      orderBy: { gameDate: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      games: liveGames,
      total: liveGames.length,
    });

  } catch (error) {
    console.error('Error fetching live games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live games' },
      { status: 500 }
    );
  }
}
