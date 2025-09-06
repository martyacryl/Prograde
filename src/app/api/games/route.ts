import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        plays: true,
        team: true,
        season: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    const formattedGames = games.map(game => ({
      id: game.id,
      homeTeam: game.team?.name || 'Home Team',
      awayTeam: 'Away Team', // TODO: Get from opponent relation
      date: game.date,
      playCount: game.plays.length,
      status: 'Imported',
      season: game.season,
      week: game.week
    }));

    return NextResponse.json({ 
      success: true, 
      games: formattedGames 
    });

  } catch (error) {
    console.error('Failed to load games:', error);
    return NextResponse.json({ 
      success: false, 
      games: [] 
    });
  }
}


