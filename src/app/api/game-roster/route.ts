import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const teamId = searchParams.get('teamId');
    const position = searchParams.get('position');

    const where: any = {};
    if (gameId) where.gameId = gameId;
    if (teamId) where.teamId = teamId;
    if (position) where.position = position;

    const rosters = await prisma.gameRoster.findMany({
      where,
      include: {
        player: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                abbreviation: true
              }
            }
          }
        },
        game: {
          select: {
            id: true,
            date: true,
            team: {
              select: {
                name: true,
                abbreviation: true
              }
            },
            opponent: {
              select: {
                name: true,
                abbreviation: true
              }
            }
          }
        }
      },
      orderBy: [
        { position: 'asc' },
        { isStarter: 'desc' },
        { player: { jerseyNumber: 'asc' } }
      ]
    });

    return NextResponse.json({
      success: true,
      rosters
    });

  } catch (error) {
    console.error('Failed to load game rosters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load game rosters' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      gameId, 
      teamId, 
      playerId, 
      position, 
      isStarter = true 
    } = body;

    if (!gameId || !teamId || !playerId || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if player is already on roster for this game
    const existingRoster = await prisma.gameRoster.findUnique({
      where: {
        gameId_playerId: {
          gameId,
          playerId
        }
      }
    });

    if (existingRoster) {
      // Update existing roster entry
      const roster = await prisma.gameRoster.update({
        where: {
          id: existingRoster.id
        },
        data: {
          position,
          isStarter
        },
        include: {
          player: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        roster,
        message: 'Roster updated'
      });
    } else {
      // Create new roster entry
      const roster = await prisma.gameRoster.create({
        data: {
          gameId,
          teamId,
          playerId,
          position,
          isStarter
        },
        include: {
          player: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  abbreviation: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        roster,
        message: 'Player added to roster'
      });
    }

  } catch (error) {
    console.error('Failed to manage game roster:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage game roster' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rosterId = searchParams.get('rosterId');

    if (!rosterId) {
      return NextResponse.json(
        { success: false, error: 'Roster ID is required' },
        { status: 400 }
      );
    }

    await prisma.gameRoster.delete({
      where: {
        id: rosterId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Player removed from roster'
    });

  } catch (error) {
    console.error('Failed to remove player from roster:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove player from roster' },
      { status: 500 }
    );
  }
}
