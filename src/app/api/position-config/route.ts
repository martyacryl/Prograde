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

    const config = await prisma.positionConfiguration.findFirst({
      where: {
        positionGroupId,
        teamId
      },
      include: {
        positionGroup: true
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

    if (!positionGroupId || !teamId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Position group ID, team ID, and user ID are required' },
        { status: 400 }
      )
    }

    // Check if configuration already exists
    const existingConfig = await prisma.positionConfiguration.findFirst({
      where: {
        positionGroupId,
        teamId
      }
    })

    let config
    if (existingConfig) {
      // Update existing configuration
      config = await prisma.positionConfiguration.update({
        where: {
          id: existingConfig.id
        },
        data: {
          gradingFields,
          metricFields,
          tags,
          settings,
          updatedAt: new Date()
        },
        include: {
          positionGroup: true
        }
      })
    } else {
      // Create new configuration
      config = await prisma.positionConfiguration.create({
        data: {
          positionGroupId,
          teamId,
          userId,
          gradingFields,
          metricFields,
          tags,
          settings
        },
        include: {
          positionGroup: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error saving position config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
