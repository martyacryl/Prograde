import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Reset team setup status
    await prisma.team.update({
      where: { id: teamId },
      data: {
        setupCompleted: false,
        setupCompletedAt: null,
        setupStep: 'ready_to_customize',
        updatedAt: new Date()
      }
    });

    // Optionally delete existing position configurations to start fresh
    // Uncomment the next lines if you want to delete existing configs:
    // await prisma.positionConfiguration.deleteMany({
    //   where: { teamId: teamId }
    // });

    return NextResponse.json({
      success: true,
      message: 'Team setup reset successfully. You can now customize position groups.',
      setupStep: 'ready_to_customize'
    });

  } catch (error) {
    console.error('Error resetting team setup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset team setup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
