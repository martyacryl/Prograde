import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  const body = await request.json();
  
  const { playId, positionGroup, grades } = body;
  
  // TODO: Save to database
  console.log('Saving grades to database:', {
    gameId,
    playId,
    positionGroup,
    grades
  });
  
  // Mock response
  return NextResponse.json({ 
    success: true, 
    message: 'Grades saved successfully',
    data: { gameId, playId, positionGroup, gradesCount: grades?.length || 0 }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params;
  
  // TODO: Load grades from database
  console.log('Loading grades for game:', gameId);
  
  // Mock response
  return NextResponse.json({
    success: true,
    grades: {
      // Mock saved grades
      'OFFENSIVE_LINE': 23,
      'QUARTERBACK': 45
    }
  });
}


