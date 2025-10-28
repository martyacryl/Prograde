import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Check if test user exists
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' },
      include: { team: true }
    })
    
    // Get total user count
    const userCount = await prisma.user.count()
    
    // Get all users (just email and name for debugging)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    return NextResponse.json({
      success: true,
      testUserExists: !!testUser,
      testUser: testUser ? {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        isActive: testUser.isActive,
        teamId: testUser.teamId
      } : null,
      totalUsers: userCount,
      recentUsers: allUsers
    })
  } catch (error) {
    console.error('User check error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
