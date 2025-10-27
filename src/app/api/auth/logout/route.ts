import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  // Token removal is handled client-side
  return NextResponse.json({ success: true, message: 'Logged out successfully' })
}
