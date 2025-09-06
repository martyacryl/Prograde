import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { gameId, source } = await request.json();

    // Fetch from NCAA API
    const playByPlayResponse = await fetch(`http://localhost:3000/game/${gameId}/play-by-play`);
    const gameInfoResponse = await fetch(`http://localhost:3000/game/${gameId}`);
    
    if (!playByPlayResponse.ok || !gameInfoResponse.ok) {
      throw new Error('Failed to fetch game data from NCAA API');
    }

    const playByPlayData = await playByPlayResponse.json();
    const gameInfo = await gameInfoResponse.json();

    // Process and save the game
    const importResponse = await fetch(`${request.url.replace('/quick-import', '/import')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalGameId: gameId,
        homeTeam: gameInfo.home?.name || 'Home Team',
        awayTeam: gameInfo.away?.name || 'Away Team',
        date: gameInfo.date || new Date().toISOString(),
        plays: playByPlayData.plays || [],
        source: source
      })
    });

    const result = await importResponse.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Quick import error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Quick import failed' 
    }, { status: 500 });
  }
}


