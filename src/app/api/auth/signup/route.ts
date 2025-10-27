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
    const { email, password, name } = body
    
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
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizedName,
        password: hashedPassword,
        role: 'HEAD_COACH', // Default role
        isActive: true
      },
      include: { team: true }
    })
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      teamId: user.teamId
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
        team: user.team
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
