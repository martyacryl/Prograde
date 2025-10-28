import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken, checkRateLimit, validateEmail, validatePassword, validateDisplayName, sanitizeInput } from '@/lib/auth-utils'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Rate limiting: 10 attempts per 15 minutes
    const isProduction = process.env.NODE_ENV === 'production'
    const maxAttempts = isProduction ? 10 : 100
    const windowMs = 15 * 60 * 1000
    
    if (!checkRateLimit(clientId, maxAttempts, windowMs)) {
      return NextResponse.json(
        { success: false, error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }
    
    const body = await request.json()
    const { email, password, name, teamData } = body
    
    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }
    
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    if (!validateDisplayName(name)) {
      return NextResponse.json(
        { success: false, error: 'Name must be 2-50 characters' },
        { status: 400 }
      )
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase())
    const sanitizedPassword = sanitizeInput(password)
    const sanitizedName = sanitizeInput(name)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(sanitizedPassword)
    
    // Create user and team in transaction
    const result = await prisma.$transaction(async (tx) => {
      let teamId = null
      
      // Create team if teamData is provided
      if (teamData) {
        const team = await tx.team.create({
          data: {
            name: sanitizeInput(teamData.name),
            abbreviation: sanitizeInput(teamData.abbreviation.toUpperCase()),
            level: teamData.level as any,
            conference: teamData.conference ? sanitizeInput(teamData.conference) : null
          }
        })
        teamId = team.id
      }
      
      // Create user
      const user = await tx.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizedName,
          password: hashedPassword,
          role: 'HEAD_COACH', // Default role
          isActive: true,
          teamId
        },
        include: { team: true }
      })
      
      return user
    })
    
    // Generate JWT token
    const token = generateToken({
      userId: result.id,
      email: result.email,
      role: result.role,
      teamId: result.teamId
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        teamId: result.teamId,
        team: result.team
      },
      token
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
