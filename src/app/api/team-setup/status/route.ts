import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Get team with setup status
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        abbreviation: true,
        level: true,
        setupCompleted: true,
        setupCompletedAt: true,
        setupStep: true,
        createdAt: true
      }
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get position configuration count
    const configCount = await prisma.positionConfiguration.count({
      where: { teamId: teamId }
    });

    // Get total position groups
    const totalPositionGroups = await prisma.positionGroup.count({
      where: { isActive: true }
    });

    // Calculate setup progress
    const setupProgress = {
      positionConfigurations: {
        completed: configCount,
        total: totalPositionGroups,
        percentage: totalPositionGroups > 0 ? Math.round((configCount / totalPositionGroups) * 100) : 0
      },
      overall: {
        completed: team.setupCompleted,
        completedAt: team.setupCompletedAt,
        currentStep: team.setupStep,
        percentage: team.setupCompleted ? 100 : Math.round((configCount / totalPositionGroups) * 100)
      }
    };

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        level: team.level,
        createdAt: team.createdAt
      },
      setupProgress
    });

  } catch (error) {
    console.error('Error fetching team setup status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch team setup status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
