import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get position groups from the database
    const groups = await prisma.positionGroup.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { displayName: 'asc' }
      ]
    });
    
    return NextResponse.json({
      success: true,
      groups: groups
    });

  } catch (error) {
    console.error('Error fetching position groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch position groups' },
      { status: 500 }
    );
  }
}
