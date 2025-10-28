import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Get all plays for this game with their grades
    const plays = await prisma.play.findMany({
      where: {
        gameId: gameId
      },
      include: {
        playGrade: true,
        positionPlayGrades: {
          include: {
            positionGroup: true
          }
        }
      }
    });

    // Calculate grading progress per position group
    const progress: Record<string, number> = {};
    
    // Initialize all position groups to 0
    const positionGroups = [
      'OFFENSIVE_LINE',
      'QUARTERBACK', 
      'RUNNING_BACK',
      'WIDE_RECEIVER',
      'TIGHT_END',
      'DEFENSIVE_LINE',
      'LINEBACKER',
      'DEFENSIVE_BACK',
      'SPECIAL_TEAMS'
    ];
    
    positionGroups.forEach(group => {
      progress[group] = 0;
    });

    // Count graded plays per position group
    plays.forEach(play => {
      if (play.positionPlayGrades.length > 0) {
        play.positionPlayGrades.forEach(positionGrade => {
          const positionGroup = positionGrade.positionGroup?.id;
          if (positionGroup && positionGroups.includes(positionGroup)) {
            progress[positionGroup]++;
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      progress,
      totalPlays: plays.length
    });

  } catch (error) {
    console.error('Failed to load grading progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load grading progress' },
      { status: 500 }
    );
  }
}
