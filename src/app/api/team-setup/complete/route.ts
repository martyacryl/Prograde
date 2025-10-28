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

    // Mark team setup as complete
    await prisma.team.update({
      where: { id: teamId },
      data: {
        setupCompleted: true,
        setupCompletedAt: new Date(),
        setupStep: 'completed',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Team setup completed successfully'
    });

  } catch (error) {
    console.error('Error completing team setup:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to complete team setup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
