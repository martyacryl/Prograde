import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        plays: {
          include: {
            playGrade: true,
            positionPlayGrades: true
          }
        },
        team: true,
        opponent: true,
        season: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    const formattedGames = games.map(game => {
      const totalPlays = game.plays.length;
      const gradedPlays = game.plays.filter(play => play.playGrade || play.positionPlayGrades.length > 0).length;
      
      return {
        id: game.id,
        homeTeam: game.team?.name || 'Home Team',
        awayTeam: game.opponent?.name || 'Away Team',
        date: game.date.toISOString().split('T')[0],
        score: game.score || null,
        status: 'Imported',
        playCount: totalPlays,
        playsGraded: gradedPlays,
        totalPlays: totalPlays,
        season: game.season,
        week: game.week,
        lastGraded: game.plays.length > 0 ? 
          new Date(Math.max(...game.plays.map(p => new Date(p.updatedAt).getTime()))).toISOString() : 
          null
      };
    });

    return NextResponse.json({ 
      success: true, 
      games: formattedGames 
    });

  } catch (error) {
    console.error('Failed to load games:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load games',
      games: [] 
    });
  }
}


