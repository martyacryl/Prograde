import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const seasonId = searchParams.get('seasonId');
    const position = searchParams.get('position');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (teamId) where.teamId = teamId;
    if (seasonId) where.seasonId = seasonId;
    if (position) where.position = position;
    if (isActive !== null) where.isActive = isActive === 'true';

    const players = await prisma.player.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            abbreviation: true
          }
        },
        season: {
          select: {
            id: true,
            year: true
          }
        }
      },
      orderBy: [
        { season: { year: 'desc' } },
        { position: 'asc' },
        { jerseyNumber: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      players
    });

  } catch (error) {
    console.error('Failed to load players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      teamId, 
      seasonId,
      jerseyNumber, 
      firstName, 
      lastName, 
      position, 
      year, 
      height, 
      weight, 
      hometown 
    } = body;

    if (!teamId || !seasonId || !jerseyNumber || !firstName || !lastName || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (teamId, seasonId, jerseyNumber, firstName, lastName, position)' },
        { status: 400 }
      );
    }

    // Check if player with same jersey number already exists for this team and season
    const existingPlayer = await prisma.player.findUnique({
      where: {
        teamId_seasonId_jerseyNumber: {
          teamId,
          seasonId,
          jerseyNumber
        }
      }
    });

    if (existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player with this jersey number already exists for this team and season' },
        { status: 400 }
      );
    }

    const player = await prisma.player.create({
      data: {
        teamId,
        seasonId,
        jerseyNumber,
        firstName,
        lastName,
        position,
        year,
        height,
        weight,
        hometown
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            abbreviation: true
          }
        },
        season: {
          select: {
            id: true,
            year: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      player
    });

  } catch (error) {
    console.error('Failed to create player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}
