import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        games: {
          select: {
            id: true,
            date: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      teams
    });

  } catch (error) {
    console.error('Failed to load teams:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load teams' },
      { status: 500 }
    );
  }
}
