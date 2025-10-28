import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Create test user
    const hashedPassword = await hashPassword('password123')
    
    const testUser = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'HEAD_COACH',
        isActive: true
      },
      include: { team: true }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        isActive: testUser.isActive
      }
    })
  } catch (error) {
    console.error('Create test user error:', error)
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: false,
        error: 'Test user already exists',
        details: 'User with email test@test.com already exists in database'
      }, { status: 409 })
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create test user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
