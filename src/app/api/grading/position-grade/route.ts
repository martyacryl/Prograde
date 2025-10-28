import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      playId, 
      playGradeId,
      positionGroupId,
      position,
      playerNumber,
      grades,
      metrics,
      notes,
      tags
    } = body;

    if (!playId || !playGradeId || !positionGroupId || !position || !grades) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update position play grade
    const positionPlayGrade = await prisma.positionPlayGrade.upsert({
      where: {
        playGradeId_positionGroupId_playerNumber: {
          playGradeId,
          positionGroupId,
          playerNumber: playerNumber || ''
        }
      },
      update: {
        grades,
        metrics: metrics || {},
        notes,
        tags: tags || [],
        updatedAt: new Date()
      },
      create: {
        playId,
        playGradeId,
        positionGroupId,
        position,
        playerNumber,
        grades,
        metrics: metrics || {},
        notes,
        tags: tags || []
      }
    });

    return NextResponse.json({
      success: true,
      grade: positionPlayGrade
    });

  } catch (error) {
    console.error('Failed to save position grade:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save position grade' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playId = searchParams.get('playId');
    const playGradeId = searchParams.get('playGradeId');
    const positionGroupId = searchParams.get('positionGroupId');

    if (!playId || !playGradeId || !positionGroupId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const grades = await prisma.positionPlayGrade.findMany({
      where: {
        playId,
        playGradeId,
        positionGroupId
      },
      include: {
        positionGroup: true
      }
    });

    return NextResponse.json({
      success: true,
      grades
    });

  } catch (error) {
    console.error('Failed to load position grades:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load position grades' },
      { status: 500 }
    );
  }
}
