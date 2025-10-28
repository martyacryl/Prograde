import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET: Fetch specific position config
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  try {
    const { positionId } = await params
    const config = await prisma.positionConfiguration.findUnique({
      where: {
        id: positionId
      },
      include: {
        positionGroup: true,
        team: true,
        user: true
      }
    })

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configuration not found' },
        { status: 404 }
      )
    }

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

// PUT: Update specific position config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  try {
    const { positionId } = await params
    const body = await request.json()
    const { gradingFields, metricFields, tags, settings } = body

    const config = await prisma.positionConfiguration.update({
      where: {
        id: positionId
      },
      data: {
        gradingFields,
        metricFields,
        tags,
        settings,
        updatedAt: new Date()
      },
      include: {
        positionGroup: true,
        team: true,
        user: true
      }
    })

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error updating position config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}

// DELETE: Delete position config
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ positionId: string }> }
) {
  try {
    const { positionId } = await params
    await prisma.positionConfiguration.delete({
      where: {
        id: positionId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting position config:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete configuration' },
      { status: 500 }
    )
  }
}
