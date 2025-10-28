import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const positionGroup = searchParams.get('positionGroup');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      );
    }

    const where: any = { gameId };
    if (positionGroup) {
      // Filter by position group (e.g., OL positions: LT, LG, C, RG, RT)
      const positionGroupMap: Record<string, string[]> = {
        'OFFENSIVE_LINE': ['LT', 'LG', 'C', 'RG', 'RT'],
        'QUARTERBACK': ['QB'],
        'RUNNING_BACK': ['RB', 'FB'],
        'WIDE_RECEIVER': ['WR'],
        'TIGHT_END': ['TE'],
        'DEFENSIVE_LINE': ['DE', 'DT', 'NT'],
        'LINEBACKER': ['LB', 'MLB', 'OLB'],
        'CORNERBACK': ['CB'],
        'SAFETY': ['S', 'FS', 'SS']
      };
      
      const positions = positionGroupMap[positionGroup] || [];
      if (positions.length > 0) {
        where.position = { in: positions };
      }
    }

    const roster = await prisma.gameRoster.findMany({
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
        }
      },
      orderBy: [
        { position: 'asc' },
        { isStarter: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      roster
    });

  } catch (error) {
    console.error('Failed to load game roster:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load game roster' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, teamId, playerId, position, isStarter = false } = body;

    if (!gameId || !teamId || !playerId || !position) {
      return NextResponse.json(
        { success: false, error: 'Game ID, Team ID, Player ID, and Position are required' },
        { status: 400 }
      );
    }

    // Check if roster entry already exists
    const existingRoster = await prisma.gameRoster.findUnique({
      where: {
        gameId_playerId: {
          gameId,
          playerId
        }
      }
    });

    let roster;
    if (existingRoster) {
      // Update existing roster entry
      roster = await prisma.gameRoster.update({
        where: {
          gameId_playerId: {
            gameId,
            playerId
          }
        },
        data: {
          position,
          isStarter,
          updatedAt: new Date()
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
    } else {
      // Create new roster entry
      roster = await prisma.gameRoster.create({
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
    }

    return NextResponse.json({
      success: true,
      roster
    });

  } catch (error) {
    console.error('Failed to save game roster:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save game roster' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const playerId = searchParams.get('playerId');

    if (!gameId || !playerId) {
      return NextResponse.json(
        { success: false, error: 'Game ID and Player ID are required' },
        { status: 400 }
      );
    }

    await prisma.gameRoster.delete({
      where: {
        gameId_playerId: {
          gameId,
          playerId
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Roster entry deleted successfully'
    });

  } catch (error) {
    console.error('Failed to delete roster entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete roster entry' },
      { status: 500 }
    );
  }
}