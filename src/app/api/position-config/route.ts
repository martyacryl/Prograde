import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthHeaders } from '@/stores/authStore'

export const runtime = 'nodejs'

// GET: Fetch configuration for position + team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const positionGroupId = searchParams.get('positionGroupId')
    const teamId = searchParams.get('teamId')

    if (!positionGroupId || !teamId) {
      return NextResponse.json(
        { success: false, error: 'Position group ID and team ID are required' },
        { status: 400 }
      )
    }

    const config = await prisma.positionConfiguration.findUnique({
      where: {
        positionGroupId_teamId: {
          positionGroupId,
          teamId
        }
      }
    })

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error fetching position config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

// POST: Save/update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionGroupId, teamId, userId, gradingFields, metricFields, tags, settings } = body

    if (!positionGroupId || !teamId) {
      return NextResponse.json(
        { success: false, error: 'Position group ID and team ID are required' },
        { status: 400 }
      )
    }

    // If no userId provided, try to find a user from the team
    let actualUserId = userId;
    if (!actualUserId) {
      const teamUser = await prisma.user.findFirst({
        where: { teamId },
        select: { id: true }
      });
      if (!teamUser) {
        return NextResponse.json(
          { success: false, error: 'No user found for this team' },
          { status: 400 }
        );
      }
      actualUserId = teamUser.id;
    }

    // Use upsert to handle both create and update cases
    const config = await prisma.positionConfiguration.upsert({
      where: {
        positionGroupId_teamId: {
          positionGroupId,
          teamId
        }
      },
      update: {
        gradingFields,
        metricFields: metricFields || {},
        tags: tags || [],
        settings,
        userId: actualUserId, // Update userId if config is adopted by another user
        updatedAt: new Date()
      },
      create: {
        positionGroupId,
        teamId,
        userId: actualUserId,
        gradingFields,
        metricFields: metricFields || {},
        tags: tags || [],
        settings
      }
    })

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error saving position config:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
