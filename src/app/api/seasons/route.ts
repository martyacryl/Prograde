import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const teamId = searchParams.get('teamId'); // For future use if needed

    const where: any = {};
    if (isActive !== null) where.isActive = isActive === 'true';

    const seasons = await prisma.season.findMany({
      where,
      orderBy: {
        year: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      seasons: seasons.map(season => ({
        id: season.id,
        year: season.year,
        name: `${season.year} Season`,
        isActive: season.isActive
      }))
    });

  } catch (error) {
    console.error('Failed to load seasons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load seasons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, startDate, endDate, isActive = false } = body;

    if (!year || !startDate) {
      return NextResponse.json(
        { success: false, error: 'Year and start date are required' },
        { status: 400 }
      );
    }

    // Check if season already exists
    const existingSeason = await prisma.season.findUnique({
      where: {
        year
      }
    });

    if (existingSeason) {
      return NextResponse.json(
        { success: false, error: 'Season for this year already exists' },
        { status: 400 }
      );
    }

    const season = await prisma.season.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      season
    });

  } catch (error) {
    console.error('Failed to create season:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create season' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, year, startDate, endDate, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Season ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (year !== undefined) updateData.year = year;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const season = await prisma.season.update({
      where: {
        id
      },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      season
    });

  } catch (error) {
    console.error('Failed to update season:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update season' },
      { status: 500 }
    );
  }
}
