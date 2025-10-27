import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-change-in-production'

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET environment variable not set, using fallback (not secure for production)')
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

// Password verification
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Handle both bcrypt hashes and plain text (for migration)
  if (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')) {
    return await bcrypt.compare(password, hashedPassword)
  }
  // Plain text fallback (for migration only)
  return password === hashedPassword
}

// JWT token generation
export function generateToken(payload: { userId: string; email: string; role: string; teamId?: string | null }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// JWT token verification
export function verifyToken(token: string): { userId: string; email: string; role: string; teamId?: string | null } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      teamId: decoded.teamId
    }
  } catch (error) {
    return null
  }
}

// Get authenticated user from token
export async function getAuthenticatedUser(token: string | undefined) {
  if (!token) return null
  
  const decoded = verifyToken(token)
  if (!decoded) return null
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { team: true }
  })
  
  if (!user || !user.isActive) return null
  
  return user
}

// Rate limiting helper (simple in-memory store)
const rateLimitStore = new Map<string, number[]>()

export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, [])
  }
  
  const requests = rateLimitStore.get(identifier)!
  const validRequests = requests.filter(time => time > windowStart)
  rateLimitStore.set(identifier, validRequests)
  
  if (validRequests.length >= maxRequests) {
    return false // Rate limit exceeded
  }
  
  validRequests.push(now)
  return true // Rate limit OK
}

// Input validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password && password.length >= 6
}

export function validateDisplayName(name: string): boolean {
  return name && name.trim().length >= 2 && name.trim().length <= 50
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '').trim()
}
